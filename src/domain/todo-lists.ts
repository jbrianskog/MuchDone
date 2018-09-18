import { AggregateRoot } from "./aggregate-root";
import { TodoListCreated } from "./events";

export class TodoLists extends AggregateRoot {
    protected _todoListIds!: string[];
    get ids(): string[] {
        return this._todoListIds;
    }
    protected init(): void {
        super.init();
        this._todoListIds = [];
    }

    // Domain Event Handlers
    protected TodoListCreated(e: TodoListCreated): void {
        this._todoListIds.push(e.aggregateId);
    }
}
