import { openDB } from "idb";

const DB_NAME = "studlife-db";
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("sleep")) {
      db.createObjectStore("sleep", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("savings")) {
      db.createObjectStore("savings", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("payments")) {
      db.createObjectStore("payments", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("jobs")) {
      db.createObjectStore("jobs", { keyPath: "id" });
    }
  },
});
