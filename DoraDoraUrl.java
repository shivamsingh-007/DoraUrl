import java.time.Duration;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.BitSet;
import java.util.HashMap;
import java.util.Map;

// Fixed version — see learn.md for error-by-error breakdown.
// Single-file standalone: `public class DoraDoraUrl` matches filename,
// helpers are package-private / nested stubs so `javac DoraDoraUrl.java` passes
// without Spring on the classpath. In a real Spring project, split
// SnowflakeIdGenerator and UrlShortenerService into their own files and
// restore `public`, `@Service`, and proper imports.

// FIX (was: `public class SnowFlakeldGenerator` — typo Flakeld + public-in-wrong-file):
class SnowflakeIdGenerator {
    private final long workerId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    private static final long EPOCH = 1700000000000L;
    private static final long WORKER_BITS = 10L;
    // FIX (was: `private static final SEQUENCE_BITS = 12L;` — missing type):
    private static final long SEQUENCE_BITS = 12L;
    private static final long MAX_SEQUENCE = ~(-1L << SEQUENCE_BITS);
    // FIX (added — was missing, allows silent overflow of workerId):
    private static final long MAX_WORKER_ID = ~(-1L << WORKER_BITS);

    // FIX (was: `public SnowflakeldGenerator` — case mismatch vs class name):
    public SnowflakeIdGenerator(long workerId) {
        if (workerId < 0 || workerId > MAX_WORKER_ID) {
            throw new IllegalArgumentException(
                    "workerId must be 0.." + MAX_WORKER_ID + ", got " + workerId);
        }
        this.workerId = workerId;
    }

    public synchronized long nextId() {
        long timestamp = System.currentTimeMillis();

        // FIX (added — was missing: clock going backwards generated duplicates):
        if (timestamp < lastTimestamp) {
            throw new IllegalStateException(
                    "Clock moved backwards. Refusing to generate id.");
        }

        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0) {
                while (timestamp <= lastTimestamp) {
                    timestamp = System.currentTimeMillis();
                }
            }
        } else {
            sequence = 0L;
        }
        lastTimestamp = timestamp;
        // FIX (was: `!` logical-NOT instead of `|` bitwise-OR — did not compile):
        return ((timestamp - EPOCH) << (WORKER_BITS + SEQUENCE_BITS))
                | (workerId << SEQUENCE_BITS)
                | sequence;
    }
}

// Minimal Base62 stub (real project: use your own encoder bean).
class Base62Encoder {
    private static final String ALPHABET =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public String encode(long value) {
        if (value == 0) return "0";
        StringBuilder sb = new StringBuilder();
        long v = value;
        while (v > 0) {
            sb.append(ALPHABET.charAt((int) (Long.remainderUnsigned(v, 62))));
            v = Long.divideUnsigned(v, 62);
        }
        return sb.reverse().toString();
    }
}

// ---- Minimal stubs so this file compiles without Spring ----
class UrlRecord {
    final String shortCode;
    final String longUrl;
    final Instant createdAt;
    final Instant expiresAt;

    private UrlRecord(Builder b) {
        this.shortCode = b.shortCode;
        this.longUrl = b.longUrl;
        this.createdAt = b.createdAt;
        this.expiresAt = b.expiresAt;
    }

    static Builder builder() { return new Builder(); }

    static class Builder {
        String shortCode;
        String longUrl;
        Instant createdAt;
        Instant expiresAt;

        Builder shortCode(String s) { this.shortCode = s; return this; }
        Builder longUrl(String s) { this.longUrl = s; return this; }
        Builder createdAt(Instant t) { this.createdAt = t; return this; }
        Builder expiresAt(Instant t) { this.expiresAt = t; return this; }
        UrlRecord build() { return new UrlRecord(this); }
    }
}

class ShortCodeConflictException extends RuntimeException {
    ShortCodeConflictException(String msg) { super(msg); }
}

class UrlRepository {
    private final Map<String, String> byCode = new HashMap<>();
    private final Map<String, String> byLong = new HashMap<>();

    String findByLongUrl(String longUrl) { return byLong.get(longUrl); }
    boolean existsByShortCode(String code) { return byCode.containsKey(code); }
    void save(UrlRecord r) {
        byCode.put(r.shortCode, r.longUrl);
        byLong.put(r.longUrl, r.shortCode);
    }
}

class RedisTemplate<K, V> {
    private final Map<K, V> store = new HashMap<>();
    ValueOps opsForValue() { return new ValueOps(); }
    class ValueOps {
        void set(K key, V value, Duration ttl) { store.put(key, value); }
        V get(K key) { return store.get(key); }
    }
}

// FIX: was `public class UrlShortenerService` (second public class in one file).
// Package-private here so single-file `javac` passes; make it `public` again
// once moved to `UrlShortenerService.java`. `@Service` omitted (needs Spring).
class UrlShortenerService {
    // FIX (was: `private final Snowflakeld idGnerator;` — unknown type + typo):
    private final SnowflakeIdGenerator idGenerator;
    private final Base62Encoder encoder;
    // FIX (was: `private final UrlRepository;` — type with no field name):
    private final UrlRepository urlRepository;
    private final RedisTemplate<String, String> redis;

    UrlShortenerService(SnowflakeIdGenerator idGenerator, Base62Encoder encoder,
                        UrlRepository urlRepository, RedisTemplate<String, String> redis) {
        this.idGenerator = idGenerator;
        this.encoder = encoder;
        this.urlRepository = urlRepository;
        this.redis = redis;
    }

    public String createShortUrl(String longUrl, String alias, Long ttlSeconds) {
        if (longUrl == null || longUrl.isBlank()) {
            throw new IllegalArgumentException("longUrl must not be blank");
        }
        String existingCode = urlRepository.findByLongUrl(longUrl);
        if (existingCode != null) return existingCode;

        // FIX (was broken ternary `?alias;` + `nexT=tId()` — missing `: branch`):
        // Also removed unsafe `.substring(0,7)` which destroyed uniqueness
        // and could throw StringIndexOutOfBoundsException.
        String shortCode = (alias != null && !alias.isBlank())
                ? alias
                : encoder.encode(idGenerator.nextId());

        if (urlRepository.existsByShortCode(shortCode)) {
            throw new ShortCodeConflictException("Code already taken:" + shortCode);
        }
        // FIX (was: `.longUrl(longUrl);` — stray `;` broke the chain):
        // FIX (was: `ttlseconds != nll` — case typo + `null` typo):
        UrlRecord record = UrlRecord.builder()
                .shortCode(shortCode)
                .longUrl(longUrl)
                .createdAt(Instant.now())
                .expiresAt(ttlSeconds != null
                        ? Instant.now().plusSeconds(ttlSeconds) : null)
                .build();
        // NOTE: real project needs UNIQUE(shortCode) + catch DuplicateKeyException
        // because check-then-save races under concurrency.
        urlRepository.save(record);

        // FIX (was: hardcoded 24h, ignoring ttlSeconds):
        Duration ttl = (ttlSeconds != null)
                ? Duration.ofSeconds(ttlSeconds)
                : Duration.ofHours(24);
        redis.opsForValue().set("url:" + shortCode, longUrl, ttl);

        return shortCode;
    }
}

// Entry point matches filename (only `public` top-level class allowed here).
public class DoraDoraUrl {
    public static void main(String[] args) {
        SnowflakeIdGenerator gen = new SnowflakeIdGenerator(1);
        Base62Encoder encoder = new Base62Encoder();
        UrlRepository repo = new UrlRepository();
        RedisTemplate<String, String> redis = new RedisTemplate<>();
        UrlShortenerService svc = new UrlShortenerService(gen, encoder, repo, redis);

        System.out.println("id1=" + gen.nextId());
        System.out.println("id2=" + gen.nextId());
        System.out.println("auto=" + svc.createShortUrl("https://example.com/a", null, 3600L));
        System.out.println("alias=" + svc.createShortUrl("https://example.com/b", "myAlias", null));
        System.out.println("dedup=" + svc.createShortUrl("https://example.com/a", null, 3600L));

        UrlBloomFilter bloom = new UrlBloomFilter();
        bloom.add("myAlias");
        System.out.println("bloom-hit=" + bloom.mightExist("myAlias"));
        System.out.println("bloom-miss=" + bloom.mightExist("nope"));
        System.out.println("OK");
    }
}

// ---- Standalone stubs for Bloom filter (real project: use Guava + Spring) ----
// Real imports to restore in a Spring/Guava project:
//   import org.springframework.stereotype.Component;
//   import com.google.common.hash.BloomFilter;
//   import com.google.common.hash.Funnels;
//   import java.nio.charset.StandardCharsets;
@interface Component {}

interface Funnel<T> {
    byte[] toBytes(T value);
}

class Funnels {
    static Funnel<String> stringFunnel(java.nio.charset.Charset charset) {
        return v -> v.getBytes(charset);
    }
}

class BloomFilter<T> {
    private final Funnel<T> funnel;
    private final BitSet bits;
    private final int bitSize;
    private final int numHashFunctions;

    private BloomFilter(Funnel<T> funnel, int bitSize, int numHashFunctions) {
        this.funnel = funnel;
        this.bitSize = bitSize;
        this.numHashFunctions = numHashFunctions;
        this.bits = new BitSet(bitSize);
    }

    static <T> BloomFilter<T> create(Funnel<T> funnel, int expectedInsertions, double fpp) {
        if (expectedInsertions <= 0) throw new IllegalArgumentException("expectedInsertions must be > 0");
        if (fpp <= 0.0 || fpp >= 1.0) throw new IllegalArgumentException("fpp must be in (0,1)");
        double ln2 = Math.log(2);
        int bitSize = (int) Math.ceil(-expectedInsertions * Math.log(fpp) / (ln2 * ln2));
        int k = Math.max(1, (int) Math.round((double) bitSize / expectedInsertions * ln2));
        return new BloomFilter<>(funnel, bitSize, k);
    }

    private int[] hashes(T value) {
        byte[] b = funnel.toBytes(value);
        int h1 = 0, h2 = 0;
        for (byte x : b) {
            h1 = h1 * 31 + (x & 0xFF);
            h2 = h2 * 131 + (x & 0xFF);
        }
        // FIX: force non-negative (Math.abs(Integer.MIN_VALUE) is still negative).
        h1 &= 0x7fffffff;
        h2 &= 0x7fffffff;
        // FIX: h2 must be odd and non-zero, else hash2*i collapses to few bits.
        h2 |= 1;
        int[] out = new int[numHashFunctions];
        for (int i = 0; i < numHashFunctions; i++) {
            out[i] = (int) ((h1 + (long) i * h2) % bitSize);
        }
        return out;
    }

    void put(T value) {
        for (int h : hashes(value)) bits.set(h);
    }

    boolean mightContain(T value) {
        for (int h : hashes(value)) {
            if (!bits.get(h)) return false;
        }
        return true;
    }
}

// FIX (was: `@Component public class UrlBloomFilter` — 2nd public class + missing imports).
// Package-private + stub @interface above so single-file `javac` passes.
// Real project: move to `UrlBloomFilter.java`, restore `public` + Spring/Guava imports.
@Component
class UrlBloomFilter {
    // FIX (was: `10_000_000_000L` long — Guava takes `int expectedInsertions`,
    // and 10B entries at fpp=0.01 needs ~11.4 GBytes -> OOM). 1M is sane default.
    private final BloomFilter<String> bloomFilter = BloomFilter.create(
            Funnels.stringFunnel(StandardCharsets.UTF_8),
            1_000_000,
            0.01
    );

    public void add(String shortCode) {
        bloomFilter.put(shortCode);
    }

    // FIX (was: `mighExist` typo):
    public boolean mightExist(String shortCode) {
        return bloomFilter.mightContain(shortCode);
    }

    /** @deprecated kept for compatibility, misspelling of {@link #mightExist}. */
    @Deprecated
    public boolean mighExist(String shortCode) {
        return mightExist(shortCode);
    }
}
