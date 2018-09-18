import { DomainEventTypeName, DomainEvent, UncommittedDomainEvent } from "./events";

export type DomainEventHandler = (e: UncommittedDomainEvent) => void;

export abstract class AggregateRoot {
  //[key: string]: any;
  private _uncommittedEvents!: UncommittedDomainEvent[];
  get uncommittedEvents(): UncommittedDomainEvent[] {
    return this._uncommittedEvents;
  }
  protected _id!: string | null;
  get id(): string | null {
    return this._id;
  }
  protected init(): void {
    this._uncommittedEvents = [];
  }
  constructor(events: DomainEvent[]) {
    this.init();
    for (const e of events) {
      this.apply(e);
    }
  }
  private apply(e: UncommittedDomainEvent): void {
    // @ts-ignore
    let handler = this[DomainEventTypeName[e.type]];
    if (handler) {
      (handler as DomainEventHandler).bind(this)(e);
    }
  }
  protected applyAndStage(e: UncommittedDomainEvent): void {
    this.apply(e);
    this._uncommittedEvents.push(e);
  }
}
