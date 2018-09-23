import { EventStore, SubCallback, Unsub, DeleteableEventStore } from "data/event-store";
import { DomainEventTypeName, UncommittedDomainEvent } from "domain/events";

export class Data {
  constructor(readonly eventStore: EventStore<DomainEventTypeName>) { }
  onTodoListUpdated(todoListId: string, callback: SubCallback<DomainEventTypeName>): Unsub {
    return this.eventStore.onEventsByAggregateUpdated(todoListId, callback);
  }
  onTodoListsUpdated(callback: SubCallback<DomainEventTypeName>): Unsub {
    return this.eventStore.onEventsByTypeUpdated(DomainEventTypeName.TodoListCreated, callback);
  }
  async addUncommittedEvents(events: UncommittedDomainEvent[]): Promise<void> {
    return this.eventStore.addUncommittedEvents(events);
  }
  async importTodoList(sourceStore: DeleteableEventStore<DomainEventTypeName>, targetAgId: string | null): Promise<void> {
    // This method imports all events from the source store into the target aggregate id.
    // For the purpose of importing from the IndexedDB to Firestore this is acceptable
    // as the app currently only stores a single aggregate (the todo list) in the IndexedDB store.
    // If multiple aggregates are intended to be supported in IndexedDB, this method will need to change. 
    let events = await sourceStore.getAllEvents();
    if (!events.length) {
      return;
    }
    let importableEvents = (targetAgId)
      // The target store already has a TodoList.  
      ? events
        .filter(x => x.type !== DomainEventTypeName.TodoListCreated)
        .map(event => Object.assign(event, { aggregateId: targetAgId }))
      // There is no Todolist in the target store so use the source aggregateId and import the TodoListCreated event.
      : events;
    await this.eventStore.addEvents(importableEvents);
    return sourceStore.deleteEvents();
  }
}
