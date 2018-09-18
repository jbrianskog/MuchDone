export interface UncommittedESEvent<T> {
  readonly id: string;
  readonly aggregateId: string;
  readonly type: T;
}
export interface ESEvent<T> extends UncommittedESEvent<T> {
  readonly version: number;
}
export interface EventStore<T> {
  getAllEvents(version?: number): Promise<ESEvent<T>[]>;
  getEventsByAggregate(aggregateId: string, version?: number): Promise<ESEvent<T>[]>;
  getEventsByType(type: T, version?: number): Promise<ESEvent<T>[]>;
  onAggregateEventsUpdated(aggregateId: string, callback: (events: ESEvent<T>[], off: () => void) => any): () => void;
  addEvents(events: UncommittedESEvent<T>[]): Promise<void>;
}
