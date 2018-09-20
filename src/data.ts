import { EventStore, SubCallback, Unsub } from "data/event-store";
import { DomainEventTypeName, UncommittedDomainEvent } from "domain/events";

export class Data {
  constructor(readonly eventStore: EventStore<DomainEventTypeName>) { }
  onTodoListUpdated(todoListId: string, callback: SubCallback<DomainEventTypeName>): Unsub {
    return this.eventStore.onEventsByAggregateUpdated(todoListId, callback);
  }
  onTodoListsUpdated(callback: SubCallback<DomainEventTypeName>): Unsub {
    return this.eventStore.onEventsByTypeUpdated(DomainEventTypeName.TodoListCreated, callback);
  }
  async addEvents(events: UncommittedDomainEvent[]): Promise<void> {
    return this.eventStore.addEvents(events);
  }
}