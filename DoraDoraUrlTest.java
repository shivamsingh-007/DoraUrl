import java.util.HashSet;
import java.util.Set;

// Standalone tests (no JUnit needed): javac + java.
// Covers SnowflakeIdGenerator, Base62Encoder, UrlShortenerService, UrlBloomFilter.
public class DoraDoraUrlTest {
    static int passed = 0;
    static int failed = 0;

    static void check(boolean cond, String name) {
        if (cond) {
            passed++;
            System.out.println("PASS: " + name);
        } else {
            failed++;
            System.out.println("FAIL: " + name);
        }
    }

    static void checkThrows(Class<? extends Throwable> expected, Runnable r, String name) {
        try {
            r.run();
            failed++;
            System.out.println("FAIL: " + name + " (no exception, expected " + expected.getSimpleName() + ")");
        } catch (Throwable t) {
            if (expected.isInstance(t)) {
                passed++;
                System.out.println("PASS: " + name);
            } else {
                failed++;
                System.out.println("FAIL: " + name + " (got " + t + ", expected " + expected.getSimpleName() + ")");
            }
        }
    }

    static UrlShortenerService newService(SnowflakeIdGenerator gen, UrlRepository repo,
                                          RedisTemplate<String, String> redis) {
        return new UrlShortenerService(gen, new Base62Encoder(), repo, redis);
    }

    public static void main(String[] args) throws Exception {
        // ---------- SnowflakeIdGenerator ----------
        SnowflakeIdGenerator gen = new SnowflakeIdGenerator(1);
        long a = gen.nextId();
        long b = gen.nextId();
        check(b > a, "snowflake: ids are monotonic (b > a)");

        // uniqueness over 10k ids
        Set<Long> ids = new HashSet<>();
        for (int i = 0; i < 10_000; i++) ids.add(gen.nextId());
        check(ids.size() == 10_000, "snowflake: 10k ids are unique");

        // workerId embedded in bits 12..21
        long id = gen.nextId();
        check(((id >> 12) & 0x3FFL) == 1L, "snowflake: workerId recoverable from id bits");

        // workerId bounds
        checkThrows(IllegalArgumentException.class, () -> new SnowflakeIdGenerator(-1), "snowflake: workerId=-1 rejected");
        checkThrows(IllegalArgumentException.class, () -> new SnowflakeIdGenerator(1024), "snowflake: workerId=1024 rejected (>10 bits)");
        SnowflakeIdGenerator genMax = new SnowflakeIdGenerator(1023);
        check(genMax.nextId() > 0, "snowflake: workerId=1023 accepted");

        // concurrency: 8 threads x 2k ids, all unique
        SnowflakeIdGenerator genC = new SnowflakeIdGenerator(7);
        Set<Long> conc = java.util.Collections.synchronizedSet(new HashSet<>());
        Thread[] ts = new Thread[8];
        for (int t = 0; t < 8; t++) {
            ts[t] = new Thread(() -> {
                for (int i = 0; i < 2000; i++) conc.add(genC.nextId());
            });
            ts[t].start();
        }
        for (Thread t : ts) t.join();
        check(conc.size() == 16_000, "snowflake: 16k concurrent ids are unique");

        // ---------- Base62Encoder ----------
        Base62Encoder enc = new Base62Encoder();
        check("0".equals(enc.encode(0)), "base62: encode(0)==\"0\"");
        check(enc.encode(123456789L).matches("[0-9A-Za-z]+"), "base62: output charset is [0-9A-Za-z]");
        check(!enc.encode(a).equals(enc.encode(b)), "base62: distinct ids -> distinct codes");
        check(enc.encode(61L).equals("z") && enc.encode(62L).equals("10"), "base62: boundary 61->z, 62->10");

        // ---------- UrlShortenerService ----------
        UrlRepository repo = new UrlRepository();
        RedisTemplate<String, String> redis = new RedisTemplate<>();
        UrlShortenerService svc = newService(new SnowflakeIdGenerator(3), repo, redis);

        // auto code
        String code1 = svc.createShortUrl("https://example.com/a", null, 3600L);
        check(code1 != null && !code1.isBlank(), "service: auto code is non-blank");
        check("https://example.com/a".equals(redis.opsForValue().get("url:" + code1)), "service: longUrl cached in redis");

        // dedup same longUrl -> same code
        String code1b = svc.createShortUrl("https://example.com/a", null, 3600L);
        check(code1.equals(code1b), "service: same longUrl returns same code (dedup)");

        // alias respected
        String aliasCode = svc.createShortUrl("https://example.com/b", "myAlias", null);
        check("myAlias".equals(aliasCode), "service: alias is used as code");

        // alias conflict
        checkThrows(ShortCodeConflictException.class,
                () -> svc.createShortUrl("https://example.com/c", "myAlias", null),
                "service: duplicate alias throws ShortCodeConflictException");

        // blank alias treated as auto (not saved as "")
        String blankAlias = svc.createShortUrl("https://example.com/d", "   ", null);
        check(!blankAlias.isBlank() && !"   ".equals(blankAlias), "service: blank alias falls back to auto code");

        // invalid longUrl
        checkThrows(IllegalArgumentException.class, () -> svc.createShortUrl(null, null, null), "service: null longUrl rejected");
        checkThrows(IllegalArgumentException.class, () -> svc.createShortUrl("  ", null, null), "service: blank longUrl rejected");

        // ttl stored on record
        UrlRepository repo2 = new UrlRepository();
        UrlShortenerService svc2 = newService(new SnowflakeIdGenerator(4), repo2, new RedisTemplate<>());
        String ttlCode = svc2.createShortUrl("https://example.com/ttl", null, 60L);
        // record reachable via reverse index; expiry = createdAt + 60s (allow skew)
        check(repo2.existsByShortCode(ttlCode), "service: ttl record persisted");
        String noTtlCode = svc2.createShortUrl("https://example.com/nottl", null, null);
        check(repo2.existsByShortCode(noTtlCode), "service: null-ttl record persisted");

        // ---------- UrlBloomFilter ----------
        UrlBloomFilter bloom = new UrlBloomFilter();
        check(!bloom.mightExist("hello-xyz"), "bloom: miss before add is false");
        bloom.add("hello-xyz");
        check(bloom.mightExist("hello-xyz"), "bloom: hit after add is true");
        check(bloom.mighExist("hello-xyz"), "bloom: deprecated mighExist() still delegates");
        bloom.add(code1);
        check(bloom.mightExist(code1), "bloom: service-generated code round-trips");

        // false-positive sanity: 1000 adds, 1000 fresh queries -> expect few FPs
        UrlBloomFilter bloom2 = new UrlBloomFilter();
        for (int i = 0; i < 1000; i++) bloom2.add("key-" + i);
        int fp = 0;
        for (int i = 1000; i < 2000; i++) if (bloom2.mightExist("key-" + i)) fp++;
        check(fp < 50, "bloom: 1000 fresh queries give <50 FPs (got " + fp + ")");

        System.out.println("\n==== RESULT: " + passed + " passed, " + failed + " failed ====");
        if (failed > 0) System.exit(1);
    }
}
