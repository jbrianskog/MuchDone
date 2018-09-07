export interface UncommittedEvent<T> {
  readonly aggregateId: string;
  readonly type: T;
}
export interface Event<T> extends UncommittedEvent<T> {
  readonly id: number;
}
export interface EventStore<T> {
  getAllEvents(version?: number): Promise<Event<T>[]>;
  getEventsByAggregate(aggregateId: string, version?: number): Promise<Event<T>[]>;
  addEvents(events: UncommittedEvent<T>[]): Promise<void>;
}
