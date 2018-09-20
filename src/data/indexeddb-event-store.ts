import idb, { Cursor, DB } from "idb";
import { ESEvent, EventStore, SubCallback, Unsub } from "./event-store";

const eventIdPropName = "id";
const versionPropName = "version";

export class IndexedDBEventStore<T> implements EventStore<T> {
  constructor(readonly dbName: string, readonly storeName: string) {}
  protected async open(): Promise<DB> {
    return await idb.open(this.dbName, 1, db => {
      switch (db.oldVersion) {
        case 0:
          let store = db.createObjectStore(this.storeName, { keyPath: eventIdPropName });
          store.createIndex(versionPropName, versionPropName, { unique: false });
      }
    });
  }
  async getAllEvents(version?: number): Promise<ESEvent<T>[]> {
    let db = await this.open();
    let tx = db.transaction(this.storeName);
    let index = tx.objectStore(this.storeName).index(versionPropName);
    let ret = (version)
      ? await index.getAll(IDBKeyRange.upperBound(version))
      : await index.getAll();
    return ret;
  }
  async getEventsByAggregate(aggregateId: string, version?: number): Promise<ESEvent<T>[]> {
    let db = await this.open();
    let events = [] as ESEvent<T>[];
    let tx = db.transaction(this.storeName);
    let index = tx.objectStore(this.storeName).index(versionPropName);
    function cursorCallback(cursor: Cursor<ESEvent<T>, number>): void {
      if (!cursor) {
        return;
      }
      let event = cursor.value;
      if (event.aggregateId === aggregateId) {
        events.push(event);
      }
      // tslint:disable-next-line:no-floating-promises
      cursor.continue();
    }
    let range = (version)
    ? IDBKeyRange.upperBound(version)
    : IDBKeyRange.lowerBound(0);
    // iterateCursor() should be replaced with usage of openCursor() when "idb" decides it is safe to do so.
    index.iterateCursor(range, cursorCallback);
    await tx.complete;
    return events;
  }
  async getEventsByType(typeId: T, version?: number): Promise<ESEvent<T>[]> {
    throw new Error("getEventsByType not implemented");
  }
  onEventsByAggregateUpdated(aggregateId: string, callback: SubCallback<T>): Unsub {
    throw new Error("onAggregateEventsUpdated not implemented");
  }
  onEventsByTypeUpdated(typeId: T, callback: SubCallback<T>): Unsub {
    throw new Error("onEventsByTypeUpdated not implemented");
  }
  async addEvents(events: ESEvent<T>[]): Promise<void> {
    let db = await this.open();
    let tx = db.transaction(this.storeName, "readwrite");
    let store = tx.objectStore(this.storeName);
    let addPromises = [];
    for (const e of events) {
      addPromises.push(store.add(e));
    }
    await Promise.all(addPromises);
    await tx.complete;
  }
}