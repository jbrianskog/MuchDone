import * as React from "react";
import { Todo } from "domain/todo";
import { TodoActionsPanelBtnGroup } from "./todo-actions-panel/todo-actions-panel-btn-group";
import { TodoDeleteBtn } from "./todo-actions-panel/todo-delete-btn";
import { TodoMoveDownBtn } from "./todo-actions-panel/todo-move-down-btn";
import { TodoMoveUpBtn } from "./todo-actions-panel/todo-move-up-btn";
import { TodoRenameBtn } from "./todo-actions-panel/todo-rename-btn";
import { TodoTitle } from "./todo-panel/todo-title";

export interface TodoActionsPanelProps {
  todo: Todo;
  deleteTodo(): void;
  moveTodoUp(listItemRef: React.RefObject<HTMLDivElement>): void;
  moveTodoDown(listItemRef: React.RefObject<HTMLDivElement>): void;
  showDefaultPanel(): void;
  showRenamePanel(): void;
}

export class TodoActionsPanel extends React.PureComponent<TodoActionsPanelProps> {
  listItemRef: React.RefObject<HTMLDivElement>;
  constructor(props: TodoActionsPanelProps) {
    super(props);
    this.listItemRef = React.createRef();
  }
  moveTodoUp = () => {
    this.props.moveTodoUp(this.listItemRef);
  }
  moveTodoDown = () => {
    this.props.moveTodoDown(this.listItemRef);
  }
  render() {
    return (
      <div className="list-group-item" ref={this.listItemRef}>
        <div className="todo-list-todo-panel">
          <TodoTitle title={this.props.todo.name} />
          <TodoActionsPanelBtnGroup showDefaultPanel={this.props.showDefaultPanel}>
            <TodoDeleteBtn deleteTodo={this.props.deleteTodo} />
            <TodoMoveUpBtn moveTodoUp={this.moveTodoUp} />
            <TodoMoveDownBtn moveTodoDown={this.moveTodoDown} />
            <TodoRenameBtn showRenamePanel={this.props.showRenamePanel} />
          </TodoActionsPanelBtnGroup>
        </div>
      </div>
    );
  }
}
