import { UncommittedEvent } from "data/event-store";
import { TodoIdType } from "./todo";

export enum DomainEventTypeName {
  TodoAdded,
  TodoRemoved,
  TodoCompleted,
  TodoUncompleted,
  TodoRenamed,
  TodoPositionChanged,
}
export type UncommittedDomainEvent = UncommittedEvent<DomainEventTypeName>;

export class TodoAdded implements UncommittedDomainEvent {
    readonly type = DomainEventTypeName.TodoAdded;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoName: string,
    ) { }
}

export class TodoRemoved implements UncommittedDomainEvent {
    readonly type = DomainEventTypeName.TodoRemoved;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
    ) { }
}

export class TodoCompleted implements UncommittedDomainEvent {
    readonly type = DomainEventTypeName.TodoCompleted;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoCompletionTimestamp: number,
    ) { }
}

export class TodoUncompleted implements UncommittedDomainEvent {
    readonly type = DomainEventTypeName.TodoUncompleted;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
    ) { }
}

export class TodoRenamed implements UncommittedDomainEvent {
    readonly type = DomainEventTypeName.TodoRenamed;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoName: string,
    ) { }
}

export class TodoPositionChanged implements UncommittedDomainEvent {
    readonly type = DomainEventTypeName.TodoPositionChanged;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoOffset: number,
    ) { }
}
