import * as React from "react";
import { Todo } from "domain/todo";
import { TodoTitle } from "components/todo-list-panel/todo-list/todo-list-item/todo-panel/todo-title";

export interface HistoryTodoListItemProps {
  todo: Todo;
}

export class HistoryTodoListItem extends React.PureComponent<HistoryTodoListItemProps> {
  render() {
    return (
      <div className="list-group-item">
        <div className="todo-list-todo-panel">
          <TodoTitle title={this.props.todo.name} />
        </div>
      </div>
    );
  }
}
