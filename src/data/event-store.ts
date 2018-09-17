export interface ESEvent<T> {
  readonly id: string;
  readonly aggregateId: string;
  readonly type: T;
  readonly version: number;
}
export interface EventStore<T> {
  getAllEvents(version?: number): Promise<ESEvent<T>[]>;
  getEventsByAggregate(aggregateId: string, version?: number): Promise<ESEvent<T>[]>;
  onAggregateEventsUpdated(aggregateId: string, callback: (events: ESEvent<T>[], off: () => void) => any): () => void;
  addEvents(events: ESEvent<T>[]): Promise<void>;
}
