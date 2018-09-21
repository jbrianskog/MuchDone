import { EventStore, SubCallback, Unsub, DeleteableEventStore } from "data/event-store";
import { DomainEventTypeName, UncommittedDomainEvent, DomainEvent } from "domain/events";

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
  async importTodoList(sourceStore: DeleteableEventStore<DomainEventTypeName>, targetAgId: string): Promise<void> {
    // This method imports all events from the source store into the target aggregate id.
    // For the purpose of importing from the IndexedDB to Firestore this is acceptable
    // as the app currently only stores a single aggregate (the todo list) in the IndexedDB store.
    // If multiple aggregates are intended to be supported in IndexedDB, this method will need to change. 
    let events = await sourceStore.getAllEvents();
    if (events.length) {
      await this.eventStore.importEvents(events, targetAgId);
      return sourceStore.deleteEvents();
    }
  }
}