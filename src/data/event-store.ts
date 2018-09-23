export interface UncommittedESEvent<T> {
  readonly id: string;
  readonly aggregateId: string;
  readonly type: T;
}
export interface ESEvent<T> extends UncommittedESEvent<T> {
  readonly version: number;
}
export type SubCallback<T> = (events: ESEvent<T>[], off: () => void) => any;
export type Unsub = () => void;
export interface EventStore<T> {
  getAllEvents(version?: number): Promise<ESEvent<T>[]>;
  getEventsByAggregate(aggregateId: string, version?: number): Promise<ESEvent<T>[]>;
  getEventsByType(typeId: T, version?: number): Promise<ESEvent<T>[]>;
  onEventsByAggregateUpdated(aggregateId: string, callback: SubCallback<T>): Unsub;
  onEventsByTypeUpdated(typeId: T, callback: SubCallback<T>): Unsub;
  addEvents(events: (UncommittedESEvent<T>|ESEvent<T>)[]): Promise<void>;
  addUncommittedEvents(events: UncommittedESEvent<T>[]): Promise<void>;
}
export interface DeleteableEventStore<T> extends EventStore<T> {
  deleteEvents(): Promise<void>;
}
