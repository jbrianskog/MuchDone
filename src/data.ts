import { EventStore } from "data/event-store";
import { DomainEventTypeName, DomainEvent } from "domain/events";
//import { IndexedDBEventStore } from "data/indexeddb-event-store";
import { FirebaseRTDBEventStore } from "data/firebase-rtdb-event-store";

//const db: EventStore<DomainEventTypeName> = new IndexedDBEventStore("much-done", "event");
const db: EventStore<DomainEventTypeName> = new FirebaseRTDBEventStore<DomainEventTypeName>();

export async function todoListEvents(aggregateId: string): Promise<DomainEvent[]> {
    return db.getEventsByAggregate(aggregateId);
}

export async function todoListId(): Promise<string | null> {
  // This app's domain and event-store are designed to accommodate multiple aggregates of different types.
  // Currently, the app only has one aggregate type (TodoList) and only allows the user to have one instance of that aggregate.
  // This method depends on that limitation. If multiple aggregates are implemented, this method will need
  // some other way to get the default todoListId.
  let events = await db.getAllEvents();
    let lists = todoListIds(events);
    return (lists.length)
        ? lists[0]
        : null;
}

function todoListIds(events: DomainEvent[]): string[] {
    return events.reduce<string[]>((p, c) => {
        if (c.type === DomainEventTypeName.TodoAdded && p.indexOf(c.aggregateId) === -1) {
            p.push(c.aggregateId);
        }
        return p;
    }, []);
}

export async function addEvents(events: DomainEvent[]): Promise<void> {
    return db.addEvents(events);
}
