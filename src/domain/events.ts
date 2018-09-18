import { ESEvent, UncommittedESEvent } from "data/event-store";
import { TodoIdType } from "./todo";
import { v4 as uuid } from "uuid";

export enum DomainEventTypeName {
  TodoListCreated,
  TodoAdded,
  TodoRemoved,
  TodoCompleted,
  TodoUncompleted,
  TodoRenamed,
  TodoPositionChanged,
}
export type UncommittedDomainEvent = UncommittedESEvent<DomainEventTypeName>;
export type DomainEvent = ESEvent<DomainEventTypeName>;

abstract class DomainEventBase {
  readonly id = uuid();
}

export class TodoListCreated extends DomainEventBase implements UncommittedDomainEvent {
  readonly type = DomainEventTypeName.TodoListCreated;
  constructor(
    readonly aggregateId: string,
  ) { super(); }
}

export class TodoAdded extends DomainEventBase implements UncommittedDomainEvent {
  readonly type = DomainEventTypeName.TodoAdded;
  constructor(
    readonly aggregateId: string,
    readonly todoId: TodoIdType,
    readonly todoName: string,
  ) { super(); }
}

export class TodoRemoved extends DomainEventBase implements UncommittedDomainEvent {
  readonly type = DomainEventTypeName.TodoRemoved;
  constructor(
    readonly aggregateId: string,
    readonly todoId: TodoIdType,
  ) { super(); }
}

export class TodoCompleted extends DomainEventBase implements UncommittedDomainEvent {
  readonly type = DomainEventTypeName.TodoCompleted;
  constructor(
    readonly aggregateId: string,
    readonly todoId: TodoIdType,
    readonly todoCompletionTimestamp: number,
  ) { super(); }
}

export class TodoUncompleted extends DomainEventBase implements UncommittedDomainEvent {
  readonly type = DomainEventTypeName.TodoUncompleted;
  constructor(
    readonly aggregateId: string,
    readonly todoId: TodoIdType,
  ) { super(); }
}

export class TodoRenamed extends DomainEventBase implements UncommittedDomainEvent {
  readonly type = DomainEventTypeName.TodoRenamed;
  constructor(
    readonly aggregateId: string,
    readonly todoId: TodoIdType,
    readonly todoName: string,
  ) { super(); }
}

export class TodoPositionChanged extends DomainEventBase implements UncommittedDomainEvent {
  readonly type = DomainEventTypeName.TodoPositionChanged;
  constructor(
    readonly aggregateId: string,
    readonly todoId: TodoIdType,
    readonly todoOffset: number,
  ) { super(); }
}
