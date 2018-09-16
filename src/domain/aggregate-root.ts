import { DomainEventTypeName, DomainEvent } from "./events";

export type DomainEventHandler = (e: DomainEvent) => void;

export abstract class AggregateRoot {
    [key: string]: any;
    private _uncommittedEvents!: DomainEvent[];
    get uncommittedEvents(): DomainEvent[] {
        return this._uncommittedEvents;
    }
    protected _id!: string;
    get id(): string {
        return this._id;
    }
    protected init(): void {
        this._uncommittedEvents = new Array<DomainEvent>();
    }
    constructor(events: DomainEvent[]) {
        this.init();
        for (const e of events) {
            (this[DomainEventTypeName[e.type]] as DomainEventHandler)(e);
        }
    }
    protected applyAndStage(e: DomainEvent): void {
        (this[DomainEventTypeName[e.type]] as DomainEventHandler)(e);
        this._uncommittedEvents.push(e);
    }
}
