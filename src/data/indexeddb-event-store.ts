import idb, { Cursor, DB } from "idb";
import { ESEvent, SubCallback, Unsub, UncommittedESEvent, DeleteableEventStore } from "./event-store";

const eventIdPropName = "id";
const versionPropName = "version";

type SubPredicate<T> = (event: UncommittedESEvent<T>) => boolean;
type SubAction = () => Promise<void>;
interface Sub<T> {
  predicate: SubPredicate<T>;
  action: SubAction;
}

export class IndexedDBEventStore<T> implements DeleteableEventStore<T> {
  protected _subs = new Map<symbol, Sub<T>>();
  constructor(readonly dbName: string, readonly storeName: string) { }
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
    return (version)
      ? index.getAll(IDBKeyRange.upperBound(version))
      : index.getAll();
  }
  async getEventsBy(predicate: (event: ESEvent<T>) => boolean, version?: number): Promise<ESEvent<T>[]> {
    let db = await this.open();
    let events = [] as ESEvent<T>[];
    let tx = db.transaction(this.storeName);
    let index = tx.objectStore(this.storeName).index(versionPropName);
    function cursorCallback(cursor: Cursor<ESEvent<T>, number>): void {
      if (!cursor) {
        return;
      }
      let event = cursor.value;
      if (predicate(event)) {
        events.push(event);
      }
      // tslint:disable-next-line:no-floating-promises
      cursor.continue();
    }
    let range = (version)
      ? IDBKeyRange.upperBound(version)
      : null;
    // iterateCursor() should be replaced with usage of openCursor() when "idb" decides it is safe to do so.
    index.iterateCursor(range, cursorCallback);
    await tx.complete;
    return events;
  }
  async getEventsByAggregate(aggregateId: string, version?: number): Promise<ESEvent<T>[]> {
    return this.getEventsBy(x => x.aggregateId === aggregateId, version);
  }
  async getEventsByType(typeId: T, version?: number): Promise<ESEvent<T>[]> {
    return this.getEventsBy(x => x.type === typeId, version);
  }
  onEventsByUpdated(predicate: SubPredicate<T>, subResults: () => Promise<ESEvent<T>[]>, callback: SubCallback<T>): Unsub {
    let sym = Symbol();
    let unsub = () => this._subs.delete(sym);
    let action = () => subResults().then(events => callback(events, unsub));
    this._subs.set(sym, {
      predicate,
      action,
    });
    action().catch(console.log);
    return unsub;
  }
  onEventsByAggregateUpdated(aggregateId: string, callback: SubCallback<T>): Unsub {
    return this.onEventsByUpdated(
      // If an event is added to the event store that matches this predicate...
      event => event.aggregateId === aggregateId,
      // send these events...
      () => this.getEventsByAggregate(aggregateId),
      // to this callback.
      callback);
  }
  onEventsByTypeUpdated(typeId: T, callback: SubCallback<T>): Unsub {
    return this.onEventsByUpdated(
      event => event.type === typeId,
      () => this.getEventsByType(typeId),
      callback);
  }
  async triggerSubs(events: (UncommittedESEvent<T>|ESEvent<T>)[]): Promise<void> {
    let triggeredSubActions: SubAction[] = [];
    for (const sub of this._subs.values()) {
      for (const e of events) {
        if (sub.predicate(e)) {
          triggeredSubActions.push(sub.action);
          break;
        }
      }
    }
    await Promise.all(triggeredSubActions.map(action => action()));
  }
  async addEvents(events: (UncommittedESEvent<T>|ESEvent<T>)[]): Promise<void> {
    let db = await this.open();
    let tx = db.transaction(this.storeName, "readwrite");
    let store = tx.objectStore(this.storeName);
    let addPromises = events.map(event => store.add(event));
    await Promise.all(addPromises);
    await tx.complete;
    return this.triggerSubs(events);
  }
  async addUncommittedEvents(events: UncommittedESEvent<T>[]): Promise<void> {
    return this.addEvents(events.map(event => Object.assign({ version: Date.now() }, event)));
  }
  async importEvents(events: ESEvent<T>[], aggregateId: string): Promise<void> {
    return this.addEvents(events.map(event => Object.assign({}, event, { aggregateId })));
  }
  async deleteEvents(): Promise<void> {
    // This methods does not trigger any subs as it is currently intended to only
    // be used for importing todo lists to Firestore and not while this is the active event store.
    // If you intend to use this method while this event store is active,
    // you should trigger subs for each deleted event.
    let db = await this.open();
    let tx = db.transaction(this.storeName, "readwrite");
    await tx.objectStore(this.storeName).clear();
    return tx.complete;
  }
}