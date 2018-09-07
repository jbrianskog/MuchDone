import { Event, EventStore } from "data/event-store";
import { DomainEventTypeName, UncommittedDomainEvent } from "domain/events";
import { IndexedDBEventStore } from "data/indexeddb-event-store";

const db: EventStore<DomainEventTypeName> = new IndexedDBEventStore("much-done", "event");

export async function todoListEvents(aggregateId: string): Promise<Event<DomainEventTypeName>[]> {
    return await db.getEventsByAggregate(aggregateId);
}

export async function todoListId(): Promise<string | null> {
  // This app's domain and event-store are designed to accommodate multiple aggregates of different types.
  // Currently, the app only has one aggregate type (TodoList) and only allows the user to have one instance of that aggregate.
  // This method depends on that limitation. If multiple aggregates are implemented, this method will need
  // some other way to get the todoListId.
  let events = await db.getAllEvents();
    let lists = todoListIds(events);
    return (lists.length)
        ? lists[0]
        : null;
}

function todoListIds(events: Event<DomainEventTypeName>[]): string[] {
    return events.reduce<string[]>((p, c) => {
        if (c.type === DomainEventTypeName.TodoAdded && p.indexOf(c.aggregateId) === -1) {
            p.push(c.aggregateId);
        }
        return p;
    }, []);
}

export async function addEvents(events: UncommittedDomainEvent[]): Promise<void> {
    return await db.addEvents(events);
}
