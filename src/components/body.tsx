import * as React from "react";
import { TodoIdType } from "domain/todo";
import { TodoList } from "domain/todo-list";
import { EventList } from "./event-list";
import { EventListEmpty } from "./event-list-empty";
import { HistoryTodoListPanel } from "./history-todo-list-panel";
import { TodoListPanel } from "./todo-list-panel";
import { DomainEvent } from "domain/events";
import { LoginBtn } from "./login-btn";

export interface BodyProps {
  events: DomainEvent[];
  isAuthenticated: boolean;
  login(rememberMe?: boolean): void;
  logout(): void;
  addTodo(name: string): void;
  completeTodo(id: TodoIdType): void;
  uncompleteTodo(id: TodoIdType): void;
  deleteTodo(id: TodoIdType): void;
  moveTodoUp(id: TodoIdType): void;
  moveTodoDown(id: TodoIdType): void;
  renameTodo(id: TodoIdType, name: string): void;
}

interface BodyState {
  history: boolean;
  historyVersion: number;
}

export class Body extends React.PureComponent<BodyProps, BodyState> {
  constructor(props: BodyProps) {
    super(props);
    this.state = {
      history: false,
      historyVersion: 0,
    };
  }
  showHistoryVersion = (version: number) => {
    this.setState({ history: true, historyVersion: version });
  }
  showCurrentVersion = () => {
    this.setState({ history: false, historyVersion: 0 });
  }
  render() {
    let todoList = new TodoList(
      this.state.history
        ? this.props.events.filter(x => x.version <= this.state.historyVersion)
        : this.props.events
    );
    return (
      <>
      <div className="navbar navbar-default navbar-static-top">
        <div className="container">
          <div className="navbar-header">
            <span className="navbar-brand"><span className="glyphicon glyphicon-check" aria-hidden="true"></span> MuchDone</span>
          </div>
          <LoginBtn 
            isAuthenticated={this.props.isAuthenticated} 
            login={this.props.login}
            logout={this.props.logout} />
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-sm-8">
            {this.state.history
              ? <HistoryTodoListPanel
                todos={todoList.todos}
                completedTodos={todoList.completedTodos}
              />
              : <TodoListPanel
                todos={todoList.todos}
                completedTodos={todoList.completedTodos}
                addTodo={this.props.addTodo}
                completeTodo={this.props.completeTodo}
                uncompleteTodo={this.props.uncompleteTodo}
                deleteTodo={this.props.deleteTodo}
                moveTodoUp={this.props.moveTodoUp}
                moveTodoDown={this.props.moveTodoDown}
                renameTodo={this.props.renameTodo}
              />
            }
          </div>
          <div className="col-sm-4">
            <h4>Domain Events</h4>
            {this.props.events.length
              ? <EventList
                disableOnClickOutside={!this.state.history}
                events={this.props.events}
                showHistoryVersion={this.showHistoryVersion}
                showCurrentVersion={this.showCurrentVersion} />
              : <EventListEmpty />}
          </div>
        </div>
        <footer>
          <p>&copy; 2018 - Jon Brian Skog</p>
        </footer>
      </div>
      </>
    );
  }
}
