import { ESEvent } from "data/event-store";
import { TodoIdType } from "./todo";
import { v4 as uuid } from "uuid";

export enum DomainEventTypeName {
  TodoAdded,
  TodoRemoved,
  TodoCompleted,
  TodoUncompleted,
  TodoRenamed,
  TodoPositionChanged,
}
export type DomainEvent = ESEvent<DomainEventTypeName>;

abstract class DomainEventBase {
  readonly id = uuid();
  readonly version = Date.now();
}

export class TodoAdded extends DomainEventBase implements DomainEvent {
    readonly type = DomainEventTypeName.TodoAdded;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoName: string,
    ) {super();}
}

export class TodoRemoved extends DomainEventBase implements DomainEvent {
    readonly type = DomainEventTypeName.TodoRemoved;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
    ) {super();}
}

export class TodoCompleted extends DomainEventBase implements DomainEvent {
    readonly type = DomainEventTypeName.TodoCompleted;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoCompletionTimestamp: number,
    ) {super();}
}

export class TodoUncompleted extends DomainEventBase implements DomainEvent {
    readonly type = DomainEventTypeName.TodoUncompleted;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
    ) {super();}
}

export class TodoRenamed extends DomainEventBase implements DomainEvent {
    readonly type = DomainEventTypeName.TodoRenamed;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoName: string,
    ) {super();}
}

export class TodoPositionChanged extends DomainEventBase implements DomainEvent {
    readonly type = DomainEventTypeName.TodoPositionChanged;
    constructor(
        readonly aggregateId: string,
        readonly todoId: TodoIdType,
        readonly todoOffset: number,
    ) {super();}
}
