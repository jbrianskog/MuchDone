import { EventStore, SubCallback, Unsub } from "data/event-store";
import { DomainEventTypeName, UncommittedDomainEvent } from "domain/events";
//import { IndexedDBEventStore } from "data/indexeddb-event-store";
import { FirebaseRTDBEventStore } from "data/firebase-rtdb-event-store";

//const db: EventStore<DomainEventTypeName> = new IndexedDBEventStore("much-done", "event");
const db: EventStore<DomainEventTypeName> = new FirebaseRTDBEventStore<DomainEventTypeName>();

export function onTodoListUpdated(todoListId: string, callback: SubCallback<DomainEventTypeName>): Unsub {
  return db.onEventsByAggregateUpdated(todoListId, callback);
}
export function onTodoListsUpdated(callback: SubCallback<DomainEventTypeName>): Unsub {
  return db.onEventsByTypeUpdated(DomainEventTypeName.TodoListCreated, callback);
}
export async function addEvents(events: UncommittedDomainEvent[]): Promise<void> {
  return db.addEvents(events);
}
