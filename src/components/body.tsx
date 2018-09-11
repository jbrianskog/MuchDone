import * as React from "react";
import { v4 as uuid } from "uuid";
import { TodoIdType } from "domain/todo";
import { TodoList } from "domain/todo-list";
import { Event } from "data/event-store";
import { todoListEvents, addEvents } from "data";
import { EventList } from "./event-list";
import { EventListEmpty } from "./event-list-empty";
import { HistoryTodoListPanel } from "./history-todo-list-panel";
import { TodoListPanel } from "./todo-list-panel";
import { DomainEventTypeName } from "domain/events";
import { LoginBtn } from "./login-btn";

export interface BodyProps {
  todoListId: string | null;
  isAuthenticated: boolean;
  updateTodoListId(id: string | null): void;
  login(): void;
  logout(): void;
}

interface BodyState {
  events: Event<DomainEventTypeName>[];
  history: boolean;
  historyVersion: number;
}

export class Body extends React.PureComponent<BodyProps, BodyState> {
  constructor(props: BodyProps) {
    super(props);
    this.state = {
      events: [],
      history: false,
      historyVersion: 0,
    };
  }
  componentDidMount(): void {
    if (this.props.todoListId) {
      todoListEvents(this.props.todoListId)
        .then(events => { this.setState({ events }); })
        .catch(console.log);
    }
  }
  componentDidUpdate(prevProps: BodyProps) {
    if (this.props.todoListId !== prevProps.todoListId) {
      if (!this.props.todoListId) {
        this.setState({ events: [] });
      } else {
        todoListEvents(this.props.todoListId)
          .then(events => { this.setState({ events }); })
          .catch(console.log);
      }
    }
  }
  updateDomainTodoList = async (command: (todoList: TodoList) => void): Promise<void> => {
    let events = (this.props.todoListId)
      ? await todoListEvents(this.props.todoListId)
      : [];
    let todoList = new TodoList(events);
    command(todoList);
    await addEvents(todoList.uncommittedEvents);
    if (!this.props.todoListId) {
      this.props.updateTodoListId(todoList.id);
    } else {
      this.setState({events: await todoListEvents(todoList.id)});
    }
  }
  addTodo = (name: string) => {
    this.updateDomainTodoList(list => { list.add(uuid(), name); })
      .catch(console.log);
  }
  completeTodo = (id: TodoIdType) => {
    this.updateDomainTodoList(list => { list.complete(id, Date.now()); })
      .catch(console.log);
  }
  uncompleteTodo = (id: TodoIdType) => {
    this.updateDomainTodoList(list => { list.uncomplete(id); })
      .catch(console.log);
  }
  deleteTodo = (id: TodoIdType) => {
    this.updateDomainTodoList(list => { list.remove(id); })
      .catch(console.log);
  }
  moveTodoUp = (id: TodoIdType) => {
    this.updateDomainTodoList(list => { list.changePosition(id, -1); })
      .catch(console.log);
  }
  moveTodoDown = (id: TodoIdType) => {
    this.updateDomainTodoList(list => { list.changePosition(id, 1); })
      .catch(console.log);
  }
  renametodo = (id: TodoIdType, name: string) => {
    this.updateDomainTodoList(list => { list.rename(id, name); })
      .catch(console.log);
  }
  showHistoryVersion = (version: number) => {
    this.setState({ history: true, historyVersion: version });
  }
  showCurrentVersion = () => {
    todoListEvents(this.props.todoListId as string)
      .then(events => { this.setState({ events, history: false, historyVersion: 0 }); })
      .catch(console.log);
  }
  render() {
    let todoList = new TodoList(
      this.state.history
        ? this.state.events.slice(0, this.state.historyVersion)
        : this.state.events
    );

    return (
      <div className="container">
        <LoginBtn 
          isAuthenticated={this.props.isAuthenticated} 
          login={this.props.login}
          logout={this.props.logout} />
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
                addTodo={this.addTodo}
                completeTodo={this.completeTodo}
                uncompleteTodo={this.uncompleteTodo}
                deleteTodo={this.deleteTodo}
                moveTodoUp={this.moveTodoUp}
                moveTodoDown={this.moveTodoDown}
                renameTodo={this.renametodo}
              />
            }
          </div>
          <div className="col-sm-4">
            <h3>Domain Events</h3>
            {this.state.events.length
              ? <EventList
                disableOnClickOutside={!this.state.history}
                events={this.state.events}
                showHistoryVersion={this.showHistoryVersion}
                showCurrentVersion={this.showCurrentVersion} />
              : <EventListEmpty />}
          </div>
        </div>
        <footer>
          <p>&copy; 2018 - Jon Brian Skog</p>
        </footer>
      </div>
    );
  }
}
