import idb, { Cursor, DB } from "idb";
import { Event, UncommittedEvent, EventStore } from "./event-store";

const aggregateIdPropName = "aggregateId";
const eventIdPropName = "id";

export class IndexedDBEventStore<T> implements EventStore<T> {
  constructor(readonly dbName: string, readonly storeName: string) {}
  protected async open(): Promise<DB> {
    return await idb.open(this.dbName, 1, db => {
      switch (db.oldVersion) {
        case 0:
          db.createObjectStore(this.storeName, { autoIncrement: true, keyPath: eventIdPropName })
            .createIndex(aggregateIdPropName, aggregateIdPropName);
      }
    });
  }
  async getAllEvents(version?: number): Promise<Event<T>[]> {
    let db = await this.open();
    let events = [] as Event<T>[];
    let tx = db.transaction(this.storeName);
    let store = tx.objectStore(this.storeName);
    function cursorCallback(cursor: Cursor<Event<T>, number>): void {
      if (!cursor) {
        return;
      }
      events.push(cursor.value);
      // tslint:disable-next-line:no-floating-promises
      cursor.continue();
    }
    // iterateCursor() should be replaced with usage of openCursor() when "idb" decides it is safe to do so.
    if (version) {
      store.iterateCursor(IDBKeyRange.upperBound(version), cursorCallback);
    } else {
      store.iterateCursor(cursorCallback);
    }
    await tx.complete;
    return events;
  }
  async getEventsByAggregate(aggregateId: string, version?: number): Promise<Event<T>[]> {
    let db = await this.open();
    let events = [] as Event<T>[];
    let tx = db.transaction(this.storeName);
    let index = tx.objectStore(this.storeName).index(aggregateIdPropName);
    function cursorCallback(cursor: Cursor<Event<T>, number>): void {
      if (!cursor) {
        return;
      }
      let event = cursor.value;
      if (!version || event.id <= version) {
        events.push(event);
      }
      // tslint:disable-next-line:no-floating-promises
      cursor.continue();
    }
    // iterateCursor() should be replaced with usage of openCursor() when "idb" decides it is safe to do so.
    index.iterateCursor(aggregateId, cursorCallback);
    await tx.complete;
    return events;
  }
  async addEvents(events: UncommittedEvent<T>[]): Promise<void> {
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