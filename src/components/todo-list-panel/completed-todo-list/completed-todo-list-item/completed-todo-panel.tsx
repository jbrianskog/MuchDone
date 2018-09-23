import * as React from "react";
import { findDOMNode } from "react-dom";
import { CompletedTodo } from "domain/todo";
import { CompletedTodoTitle } from "./completed-todo-panel/completed-todo-title";
import { TodoPanelBtnGroup } from "components/todo-list-panel/todo-list/todo-list-item/todo-panel/todo-panel-btn-group";

export interface CompletedTodoPanelProps {
  todo: CompletedTodo;
  uncompleteTodo(): void;
  showActionsPanel(): void;
}

export class CompletedTodoPanel extends React.PureComponent<CompletedTodoPanelProps> {
  btnGroup!: HTMLElement;
  btnGroupRef: React.Ref<TodoPanelBtnGroup> = comp => {
    if (comp) {
      this.btnGroup = findDOMNode(comp) as HTMLElement;
    }
  }
  onClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
    if (!this.btnGroup.contains(e.target as HTMLElement)) {
      this.props.uncompleteTodo();
    }
  }
  render() {
    return (
      <a role="button" tabIndex={0} onClick={this.onClick} className="list-group-item list-group-item-success">
        <div className="todo-list-todo-panel">
          <CompletedTodoTitle title={this.props.todo.name} completionDate={new Date(this.props.todo.completionTimestamp)} />
          <TodoPanelBtnGroup
            ref={this.btnGroupRef}
            showActionsPanel={this.props.showActionsPanel} />
        </div>
      </a>
    );
  }
}
