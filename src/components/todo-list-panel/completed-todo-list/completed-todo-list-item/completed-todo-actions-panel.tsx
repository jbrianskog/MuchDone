import * as React from "react";
import { CompletedTodo } from "domain/todo";
import { CompletedTodoTitle } from "./completed-todo-panel/completed-todo-title";
import { TodoActionsPanelBtnGroup } from "components/todo-list-panel/todo-list/todo-list-item/todo-actions-panel/todo-actions-panel-btn-group";
import { TodoDeleteBtn } from "components/todo-list-panel/todo-list/todo-list-item/todo-actions-panel/todo-delete-btn";
import { TodoRenameBtn } from "components/todo-list-panel/todo-list/todo-list-item/todo-actions-panel/todo-rename-btn";

export interface CompletedTodoActionsPanelProps {
  todo: CompletedTodo;
  deleteTodo(): void;
  showDefaultPanel(): void;
  showRenamePanel(): void;
}

export class CompletedTodoActionsPanel extends React.PureComponent<CompletedTodoActionsPanelProps> {
  render() {
    return (
      <div className="list-group-item list-group-item-success">
        <div className="todo-list-todo-panel">
          <CompletedTodoTitle title={this.props.todo.name} completionDate={new Date(this.props.todo.completionTimestamp)} />
          <TodoActionsPanelBtnGroup showDefaultPanel={this.props.showDefaultPanel}>
            <TodoDeleteBtn deleteTodo={this.props.deleteTodo} />
            <TodoRenameBtn showRenamePanel={this.props.showRenamePanel} />
          </ TodoActionsPanelBtnGroup>
        </div>
      </div>
    );
  }
}
