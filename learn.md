# Learn.md — DoraDoraUrl.java Code Review (verified with `javac`)

File under review: `DoraDoraUrl.java` (60 lines, 2 classes).
Verification method: `javac DoraDoraUrl.java` → 10 errors, confirmed below.
Fixed version: `DoraDoraUrl.java` (rewritten, now compiles + runs; see bottom for what changed).

## A. Compile errors (javac confirms 10 errors)

### 1. `DoraDoraUrl.java:8` — missing type on constant
```java
// BEFORE (broken):
private static final SEQUENCE_BITS = 12L;
// AFTER (fixed):
private static final long SEQUENCE_BITS = 12L;
```
Error: `<identifier> expected`. Every `static final` field needs a type.

### 2. `DoraDoraUrl.java:1,11` — class/constructor typo `SnowFlakeldGenerator`
```java
// BEFORE:
public class SnowFlakeldGenerator{ ...
public SnowflakeldGenerator(long workerId){
// AFTER:
class SnowflakeIdGenerator { ...
public SnowflakeIdGenerator(long workerId){
```
`Flakeld` uses lowercase `l` + `d` instead of `flakeId`. It compiled only because both spellings matched, but javac reports `invalid method declaration; return type required` here because the constructor name (`SnowflakeldGenerator` with lowercase `l`) does not exactly match the class name (`SnowFlakeldGenerator` with uppercase `L`). Lesson: constructor must match class name byte-for-byte, including case.

### 3. `DoraDoraUrl.java:29-31` — `!` used instead of `|` when composing ID
```java
// BEFORE (broken, 3 errors: `';' expected`, `not a statement` x2):
return ((timestamp - EPOCH)<<(WORKER_BITS +SEQUENCE_BITS))
!(workerId << SEQUENCE_BITS)
!sequence;
// AFTER (fixed):
return ((timestamp - EPOCH) << (WORKER_BITS + SEQUENCE_BITS))
        | (workerId << SEQUENCE_BITS)
        | sequence;
```
`!` is logical NOT (boolean only). ID composition needs bitwise OR `|`.

### 4. `DoraDoraUrl.java:37` — field with type but no name
```java
// BEFORE:
private final UrlRepository;
// AFTER:
private final UrlRepository urlRepository;
```
Error: `<identifier> expected`.

### 5. `DoraDoraUrl.java:35` — unresolvable type + field typo
```java
// BEFORE:
private final Snowflakeld idGnerator;
// AFTER:
private final SnowflakeIdGenerator idGenerator;
```
`Snowflakeld` (no `Generator` suffix) does not exist, and `idGnerator` misses `e`. Must match declaration in (2).

### 6. `DoraDoraUrl.java:42-43` — broken ternary + garbled method call
```java
// BEFORE:
String shortCode =(alias != null)?alias;
encoder.encode(idGenerator.nexT=tId()).substring(0,7);
// AFTER:
String shortCode = (alias != null && !alias.isBlank())
        ? alias
        : encoder.encode(idGenerator.nextId());
```
Errors: `: expected`. A ternary needs `cond ? a : b`. `nexT=tId()` is a typo for `nextId()`. Old code also called `idGenerator` while field was `idGnerator` (see #5).

### 7. `DoraDoraUrl.java:49-50` — `;` breaks builder chain
```java
// BEFORE:
.longUrl(longUrl);
.createdAt(Instant.now())
// AFTER:
.longUrl(longUrl)
.createdAt(Instant.now())
```
Error: `illegal start of expression`. `;` terminates the statement, so next line starting with `.` is illegal.

### 8. `DoraDoraUrl.java:51` — `ttlseconds` vs `ttlSeconds`, `nll` vs `null`
```java
// BEFORE:
.expiresAt(ttlseconds != nll ?
Instant.now().plusSeconds(ttlseconds):null);
// AFTER:
.expiresAt(ttlSeconds != null
        ? Instant.now().plusSeconds(ttlSeconds) : null)
```
Java is case-sensitive (`ttlseconds` ≠ `ttlSeconds`), and `nll` (letter `l`) ≠ `null`.

### 9. Two `public` top-level classes in `DoraDoraUrl.java`
```java
// BEFORE:
public class SnowFlakeldGenerator{...}  // line 1
public class UrlShortenerService{...}   // line 34
// AFTER (single-file fix):
class SnowflakeIdGenerator {...}
class UrlShortenerService {...}
```
Rule: max one `public` top-level class per file, and filename must match it. File is `DoraDoraUrl.java` but contains neither `DoraDoraUrl`. Fix: remove `public` (real project: split into `SnowflakeIdGenerator.java` + `UrlShortenerService.java`), or wrap in `public class DoraDoraUrl`.

### 10. Missing imports / dependencies
`Instant`, `Duration`, `@Service`, `RedisTemplate`, `Base62Encoder`, `UrlRepository`, `UrlRecord`, `ShortCodeConflictException` are used but never imported/defined. Real Spring project needs:
```java
import java.time.Instant;
import java.time.Duration;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;
```
Standalone fix in this repo adds minimal stubs so `javac` (no Spring) passes.

## B. Logic / design mistakes (compiles after A, but wrong at runtime)

### 11. No `workerId` range check (10 bits → 0..1023)
```java
// ADDED:
private static final long MAX_WORKER_ID = ~(-1L << WORKER_BITS);
public SnowflakeIdGenerator(long workerId) {
    if (workerId < 0 || workerId > MAX_WORKER_ID)
        throw new IllegalArgumentException(...);
    this.workerId = workerId;
}
```
Without this, `workerId=5000` silently overflows into timestamp bits.

### 12. No clock-backwards guard → duplicate IDs
```java
// BEFORE: timestamp < lastTimestamp falls into else { sequence=0 } → duplicate
// AFTER:
if (timestamp < lastTimestamp)
    throw new IllegalStateException("Clock moved backwards");
```

### 13. `.substring(0,7)` on encoded ID
Truncates the Snowflake ID to 7 chars, destroying uniqueness and risking `StringIndexOutOfBoundsException` if encoded string is shorter. Fixed version uses full Base62 string (or hash + retry on collision).

### 14. `redis.set(..., Duration.ofHours(24))` ignores `ttlSeconds`
DB `expiresAt` uses `ttlSeconds`, cache hardcodes 24h → stale cache after DB expiry (or vice versa). Fixed:
```java
Duration ttl = (ttlSeconds != null) ? Duration.ofSeconds(ttlSeconds) : Duration.ofHours(24);
redis.opsForValue().set("url:" + shortCode, longUrl, ttl);
```

### 15. Check-then-save race on alias
```java
if (urlRepository.existsByShortCode(shortCode)) throw ...;
urlRepository.save(record);
```
Two threads can pass the check together. Needs DB unique constraint on `shortCode` + catch `DuplicateKeyException`, plus alias format validation and `longUrl` null/URL validation (both missing).

## C. What was fixed in `DoraDoraUrl.java`
- All 10 `javac` errors fixed (items 1–10).
- Renamed to `SnowflakeIdGenerator`, corrected `|` composition, ternary, builder chain, `null`/`ttlSeconds`, field names.
- Added `MAX_WORKER_ID` validation, clock-backwards guard.
- Removed unsafe `substring(0,7)`, made cache TTL respect `ttlSeconds`.
- Removed `public` from top-level classes (single-file compile rule) + added minimal stubs + `main()` demo so `javac && java` verifies without Spring.
- Verify: `javac DoraDoraUrl.java && java DoraDoraUrl`

## D. Update: `UrlBloomFilter` appended at `DoraDoraUrl.java:212-226` (verified: 6 new `javac` errors, now fixed)

### 16. Second `public` top-level class in same file
```java
// BEFORE (broken):
@Component
public class UrlBloomFilter{ ... }   // + public class DoraDoraUrl above
// AFTER (fixed):
@Component
class UrlBloomFilter { ... }
```
Error: `class UrlBloomFilter is public, should be declared in a file named UrlBloomFilter.java`. One `public` class per file. Fix: package-private here; real project → move to `UrlBloomFilter.java` and restore `public`.

### 17. Missing imports / dependencies (`Component`, `BloomFilter`, `Funnels`, `StandardCharsets`)
```java
// BEFORE: used with no import/definition → 5x `cannot find symbol`
// AFTER (standalone fix in this file):
import java.nio.charset.StandardCharsets;
@interface Component {}          // stub; real: org.springframework.stereotype.Component
interface Funnel<T> {...}        // stub; real: com.google.common.hash.Funnel
class Funnels {...}              // stub; real: com.google.common.hash.Funnels
class BloomFilter<T> {...}       // BitSet stub; real: com.google.common.hash.BloomFilter
```
Real Spring+Guava project restores:
```java
import org.springframework.stereotype.Component;
import com.google.common.hash.BloomFilter;
import com.google.common.hash.Funnels;
import java.nio.charset.StandardCharsets;
```

### 18. `10_000_000_000L` expected insertions — wrong type + OOM
```java
// BEFORE:
BloomFilter.create(Funnels.stringFunnel(...), 10_000_000_000L, 0.01);
// AFTER:
BloomFilter.create(Funnels.stringFunnel(StandardCharsets.UTF_8), 1_000_000, 0.01);
```
Guava signature is `create(Funnel, int expectedInsertions, double fpp)` — a `long` 10B does not fit `int` (max ~2.1B). Even if it did, 10B entries at fpp=0.01 needs `m = -n*ln(p)/(ln2^2)` ≈ 9.6 bits/entry ≈ 11–12 GBytes → OOM on most hosts. Fixed to `1_000_000` (~1.2 MBytes).

### 19. Method typo `mighExist`
```java
// BEFORE: public boolean mighExist(String shortCode)
// AFTER:  public boolean mightExist(String shortCode)
//         + @Deprecated mighExist() delegating to mightExist() for compatibility
```

### 20. Design note (not compile error)
Bloom filter is write-only: `add()` is never called from `UrlShortenerService`, and a Bloom filter gives false positives, so it can only be a pre-check before `urlRepository.existsByShortCode()` / DB unique constraint — never a replacement. Wire it into the service or drop it.

Verify after fix: `javac DoraDoraUrl.java && java DoraDoraUrl` → `bloom-hit=true, bloom-miss=false, OK`.

## E. Tests — `DoraDoraUrlTest.java` (26/26 pass on 2026-10-13, JDK 21)

Run: `javac DoraDoraUrl.java DoraDoraUrlTest.java && java DoraDoraUrlTest`

- Snowflake (7): monotonic `b>a`, 10k unique, workerId bits `((id>>12)&0x3FF)==worker`, `-1`/`1024` rejected, `1023` accepted, 16k concurrent unique (8 threads x 2k).
- Base62 (4): `encode(0)=="0"`, charset `[0-9A-Za-z]`, distinct ids → distinct codes, `61→z` / `62→10`.
- Service (10): auto code non-blank, redis cache hit, dedup same longUrl → same code, alias used, duplicate alias → `ShortCodeConflictException`, blank alias → auto fallback, null/blank longUrl → `IllegalArgumentException`, ttl + null-ttl records persisted.
- Bloom (5): miss-before-add false, hit-after-add true, deprecated `mighExist()` delegates, service code round-trips, 1000 fresh queries → 0 FPs (<50 allowed).

Known gap tests do not cover (needs Spring/DB): check-then-save race needs DB UNIQUE + `DuplicateKeyException` test, cache TTL expiry needs fake clock, clock-backwards guard needs clock injection.
