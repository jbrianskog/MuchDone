import { AggregateIdType, allDomainEvents, DomainEvent, domainEventsByAggregate, DomainEventType } from "./event-store";

export async function todoListEvents(): Promise<DomainEvent[]> {
    // This app's domain and event-store are designed to accommodate multiple aggregates of different types.
    // Currently, the app only has one aggregate type (TodoList) and only allows the user to have one instance of that aggregate.
    // This todoLists() lookup occurs to get the aggregateId of the user's one TodoList.
    let events = await allDomainEvents();
    let lists = todoLists(events);
    return (lists.length)
        ? await domainEventsByAggregate(lists[0])
        : [];
}

export async function todoListId(): Promise<AggregateIdType | null> {
    // This app's domain and event-store are designed to accommodate multiple aggregates of different types.
    // Currently, the app only has one aggregate type (TodoList) and only allows the user to have one instance of that aggregate.
    // This todoLists() lookup occurs to get the aggregateId of the user's one TodoList.
    let events = await allDomainEvents();
    let lists = todoLists(events);
    return (lists.length)
        ? lists[0]
        : null;
}

function todoLists(events: DomainEvent[]): AggregateIdType[] {
    return events.reduce<AggregateIdType[]>((p, c) => {
        if (c.type === DomainEventType.TodoAdded && p.indexOf(c.aggregateId) === -1) {
            p.push(c.aggregateId);
        }
        return p;
    }, []);
}
