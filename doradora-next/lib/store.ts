/* Client-side external store for the demo studio.
 * useSyncExternalStore keeps SSR snapshots stable and makes localStorage
 * hydration subscription-driven (no setState-in-effect, no render impurity).
 */
import {
  loadClicks,
  loadLinks,
  saveClicks,
  saveLinks,
  type ShortLink,
} from "./shortener";

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

let linksCache: ShortLink[] | null = null;
let clicksCache: number | null = null;
let tickCache = 0;
let tickTimer: ReturnType<typeof setInterval> | null = null;

const EMPTY_LINKS: ShortLink[] = [];
const ZERO_CLICKS = 0;
const ZERO_TICK = 0;

export function getLinksSnapshot(): ShortLink[] {
  if (linksCache === null) {
    linksCache = typeof window === "undefined" ? [] : loadLinks();
  }
  return linksCache;
}

export function getLinksServerSnapshot(): ShortLink[] {
  return EMPTY_LINKS;
}

export function getClicksSnapshot(): number {
  if (clicksCache === null) {
    clicksCache = typeof window === "undefined" ? 0 : loadClicks();
  }
  return clicksCache;
}

export function getClicksServerSnapshot(): number {
  return ZERO_CLICKS;
}

/** Mounted flag: false during SSR/prerender, true once subscribed on the client. */
export function getMountedSnapshot(): boolean {
  return true;
}

export function getMountedServerSnapshot(): boolean {
  return false;
}

function subscribeTicker(cb: () => void): () => void {
  listeners.add(cb);
  if (tickTimer === null && typeof window !== "undefined") {
    tickCache = Date.now();
    tickTimer = setInterval(() => {
      tickCache = Date.now();
      emit();
    }, 30000);
  }
  return () => {
    listeners.delete(cb);
  };
}

export function getTickSnapshot(): number {
  if (tickCache === 0 && typeof window !== "undefined") tickCache = Date.now();
  return tickCache;
}

export function getTickServerSnapshot(): number {
  return ZERO_TICK;
}

export function setLinksStore(next: ShortLink[]): void {
  linksCache = next;
  saveLinks(next);
  emit();
}

export function setClicksStore(n: number): void {
  clicksCache = n;
  saveClicks(n);
  emit();
}

export const store = {
  subscribe,
  subscribeTicker,
  getLinksSnapshot,
  getLinksServerSnapshot,
  getClicksSnapshot,
  getClicksServerSnapshot,
  getMountedSnapshot,
  getMountedServerSnapshot,
  getTickSnapshot,
  getTickServerSnapshot,
  setLinksStore,
  setClicksStore,
};
