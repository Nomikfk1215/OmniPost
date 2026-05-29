// The runnable V1 demo uses src/lib/db/json-store.ts so it works without a
// native SQLite driver. This Drizzle schema entry is kept as the documented
// migration point for swapping the demo store to SQLite.
export * from "./schema";
