import * as React from "react";
import { Todo, TodoIdType } from "domain/todo";
import { TodoListItem } from "./todo-list/todo-list-item";

export interface TodoListProps {
  todos: Todo[];
  completeTodo(id: TodoIdType): void;
  deleteTodo(id: TodoIdType): void;
  moveTodoUp(id: TodoIdType): void;
  moveTodoDown(id: TodoIdType): void;
  renameTodo(id: TodoIdType, name: string): void;
}

export class TodoList extends React.PureComponent<TodoListProps> {
  movedTodoListItemRef!: React.RefObject<HTMLDivElement> | null;
  movedTodoListItemOffsetTop!: number | null;
  moveTodoUp = (id: TodoIdType, listItemRef: React.RefObject<HTMLDivElement>) => {
    this.setMovedTodoRef(listItemRef);
    this.props.moveTodoUp(id);
  }
  moveTodoDown = (id: TodoIdType, listItemRef: React.RefObject<HTMLDivElement>) => {
    this.setMovedTodoRef(listItemRef);
    this.props.moveTodoDown(id);
  }
  setMovedTodoRef = (listItemRef: React.RefObject<HTMLDivElement>) => {
    this.movedTodoListItemOffsetTop = (listItemRef.current as HTMLDivElement).offsetTop;
    this.movedTodoListItemRef = listItemRef;
  }
  componentDidUpdate() {
    if (this.movedTodoListItemRef) {
      window.scrollBy({
        top: (this.movedTodoListItemRef.current as HTMLDivElement).offsetTop - (this.movedTodoListItemOffsetTop as number),
        behavior: "instant",
      });
      this.movedTodoListItemRef = null;
    }
  }
  render() {
    return (
      <div className="list-group">
        {this.props.todos.map(todo =>
          <TodoListItem
            key={todo.id}
            todo={todo}
            completeTodo={this.props.completeTodo}
            deleteTodo={this.props.deleteTodo}
            moveTodoUp={this.moveTodoUp}
            moveTodoDown={this.moveTodoDown}
            renameTodo={this.props.renameTodo}
          />)}
      </div>
    );
  }
}
