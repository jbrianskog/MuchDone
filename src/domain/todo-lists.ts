import { AggregateRoot } from "./aggregate-root";
import { TodoListCreated } from "./events";

export class TodoLists extends AggregateRoot {
  protected _ids!: string[];
  get ids(): string[] {
    return this._ids;
  }
  protected init(): void {
    super.init();
    this._ids = [];
  }

  // Domain Event Handlers
  protected TodoListCreated(e: TodoListCreated): void {
    this._ids.push(e.aggregateId);
  }
}
