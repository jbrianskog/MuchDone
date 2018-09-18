import { EventStore } from "data/event-store";
import { DomainEventTypeName, DomainEvent, UncommittedDomainEvent } from "domain/events";
//import { IndexedDBEventStore } from "data/indexeddb-event-store";
import { FirebaseRTDBEventStore } from "data/firebase-rtdb-event-store";

//const db: EventStore<DomainEventTypeName> = new IndexedDBEventStore("much-done", "event");
const db: EventStore<DomainEventTypeName> = new FirebaseRTDBEventStore<DomainEventTypeName>();

export async function todoListEvents(aggregateId: string): Promise<DomainEvent[]> {
  return db.getEventsByAggregate(aggregateId);
}
export function onTodoListUpdated(todoListId: string, callback: (events: DomainEvent[], off: () => void) => any): () => void {
  return db.onAggregateEventsUpdated(todoListId, callback);
}
export async function todoListId(): Promise<string | null> {
  let events = await db.getEventsByType(DomainEventTypeName.TodoListCreated)
  return (events.length)
    ? events[0].aggregateId
    : null;
}
export async function addEvents(events: UncommittedDomainEvent[]): Promise<void> {
  return db.addEvents(events);
}
