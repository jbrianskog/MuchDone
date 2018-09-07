import { DomainEventTypeName, UncommittedDomainEvent } from "./events";

export type DomainEventHandler = (e: UncommittedDomainEvent) => void;

export abstract class AggregateRoot {
    [key: string]: any;
    private _uncommittedEvents!: UncommittedDomainEvent[];
    get uncommittedEvents(): UncommittedDomainEvent[] {
        return this._uncommittedEvents;
    }
    protected _id!: string;
    get id(): string {
        return this._id;
    }
    protected init(): void {
        this._uncommittedEvents = new Array<UncommittedDomainEvent>();
    }
    constructor(events: UncommittedDomainEvent[]) {
        this.init();
        for (const e of events) {
            (this[DomainEventTypeName[e.type]] as DomainEventHandler)(e);
        }
    }
    protected applyAndStage(e: UncommittedDomainEvent): void {
        (this[DomainEventTypeName[e.type]] as DomainEventHandler)(e);
        this._uncommittedEvents.push(e);
    }
}
