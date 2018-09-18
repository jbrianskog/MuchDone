import { v4 as uuid } from "uuid";
import { AggregateRoot } from "./aggregate-root";
import { TodoAdded, TodoCompleted, TodoPositionChanged, TodoRemoved, TodoRenamed, TodoUncompleted, TodoListCreated } from "./events";
import { CompletedTodo, Todo, TodoIdType } from "./todo";

export class TodoList extends AggregateRoot {
  protected _todos!: (Todo | CompletedTodo)[];
  protected _todosMap!: Map<TodoIdType, Todo | CompletedTodo>;
  get todos(): Todo[] {
    return this._todos.filter(x => !x.isCompleted);
  }
  get completedTodos(): CompletedTodo[] {
    return (this._todos.filter(x => x.isCompleted) as CompletedTodo[])
      .sort((x, y) => y.completionTimestamp - x.completionTimestamp);
  }
  protected init(): void {
    super.init();
    this._todos = [];
    this._todosMap = new Map();
  }

  // Domain Event Handlers
  protected TodoAdded(e: TodoAdded): void {
    if (!this.id) {
      this._id = e.aggregateId;
    }
    let todo: Todo = {
      id: e.todoId,
      name: e.todoName,
      isCompleted: false,
    };
    this._todos.push(todo);
    this._todosMap.set(e.todoId, todo);
  }
  protected TodoRemoved(e: TodoRemoved): void {
    let i = this._todos.findIndex(x => x.id === e.todoId);
    if (i !== -1) {
      this._todos.splice(i, 1);
      this._todosMap.delete(e.todoId);
    }
  }
  protected TodoCompleted(e: TodoCompleted): void {
    let todo = this._todosMap.get(e.todoId);
    if (todo) {
      todo.isCompleted = true;
      (todo as CompletedTodo).completionTimestamp = e.todoCompletionTimestamp;
    }
  }
  protected TodoUncompleted(e: TodoUncompleted): void {
    let todo = this._todosMap.get(e.todoId);
    if (todo) {
      todo.isCompleted = false;
    }
  }
  protected TodoRenamed(e: TodoRenamed): void {
    let todo = this._todosMap.get(e.todoId);
    if (todo) {
      todo.name = e.todoName;
    }
  }
  protected TodoPositionChanged(e: TodoPositionChanged): void {
    let incompleteTodoPositions: number[] = this._todos.reduce<number[]>((p, c, i) => {
      if (!c.isCompleted) {
        p.push(i);
      }
      return p;
    }, []);
    let from = incompleteTodoPositions.findIndex(x => this._todos[x].id === e.todoId);
    if (from === -1) {
      return;
    }
    let to = from + e.todoOffset;
    if (to < 0) {
      to = 0;
    } else if (to > incompleteTodoPositions.length - 1) {
      to = incompleteTodoPositions.length - 1;
    }
    if (from === to) {
      return;
    }
    if (to < from) {
      for (let i = to; i < from; i++) {
        arraySwap(this._todos, incompleteTodoPositions[from], incompleteTodoPositions[i]);
      }
    } else {
      for (let i = to; i > from; i--) {
        arraySwap(this._todos, incompleteTodoPositions[from], incompleteTodoPositions[i]);
      }
    }
    function arraySwap(arr: any[], x: number, y: number): void {
      let a = arr[x];
      arr[x] = arr[y];
      arr[y] = a;
    }
  }

  add(id: TodoIdType, name: string): void {
    let agId = this.id;
    if (!agId) {
      agId = uuid();
      this.applyAndStage(new TodoListCreated(agId));
    }
    this.applyAndStage(new TodoAdded(agId, id, name));
  }
  remove(id: TodoIdType): void {
    if (!this.id || !this._todosMap.has(id)) {
      return;
    }
    this.applyAndStage(new TodoRemoved(this.id, id));
  }
  complete(id: TodoIdType, completionTimestamp: number): void {
    let todo = this._todosMap.get(id);
    if (!this.id || !todo || todo.isCompleted) {
      return;
    }
    this.applyAndStage(new TodoCompleted(this.id, id, completionTimestamp));
  }
  uncomplete(id: TodoIdType): void {
    let todo = this._todosMap.get(id);
    if (!this.id || !todo || !todo.isCompleted) {
      return;
    }
    this.applyAndStage(new TodoUncompleted(this.id, id));
  }
  rename(id: TodoIdType, name: string): void {
    let todo = this._todosMap.get(id);
    if (!this.id || !todo || todo.name === name) {
      return;
    }
    this.applyAndStage(new TodoRenamed(this.id, id, name));
  }
  changePosition(id: TodoIdType, offset: number): void {
    if (!this.id || offset === 0) {
      return;
    }
    let i = this.todos.findIndex(x => x.id === id);
    if (i === -1
      || (i === 0 && offset < 1)
      || (i === this.todos.length - 1 && offset > -1)) {
      return;
    }
    this.applyAndStage(new TodoPositionChanged(this.id, id, offset));
  }
}
