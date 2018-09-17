import * as React from "react";
import * as firebase from "firebase";
import { v4 as uuid } from "uuid";
import { todoListId, todoListEvents, addEvents } from "data";
import { TodoList } from "domain/todo-list";
import { DomainEvent } from "domain/events";
import { Body } from "./body";
import { TodoIdType } from "domain/todo";

interface AppState {
  todoListId: string | null;
  todoListEvents: DomainEvent[];
  isAuthenticated: boolean;
}

export class App extends React.PureComponent<{}, AppState> {
  authStateUnsub: firebase.Unsubscribe | null = null;
  constructor(props: {}) {
    super(props);
    this.state = {
      todoListId: null,
      todoListEvents: [],
      isAuthenticated: false,
    };
  }
  componentDidMount() {
    this.authStateUnsub = firebase.auth().onAuthStateChanged(user => {
      console.log("onAuthStateChanged");
      console.log(user);
      todoListId()
        .then(id => {
          if (id) {
            return todoListEvents(id)
              .then(events => this.setState({ isAuthenticated: !!user, todoListId: id, todoListEvents: events }));
          } else {
            this.setState({ isAuthenticated: !!user, todoListId: null, todoListEvents: [] })
          }
        })
        .catch(console.log);
    })
  }
  componentWillUnmount() {
    this.authStateUnsub && this.authStateUnsub();
  }
  login = () => {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .catch(console.log);
  };
  logout = () => {
    firebase.auth().signOut()
      .catch(console.log);
  };
  updateDomainTodoList = async (command: (todoList: TodoList) => void): Promise<void> => {
    let events = (this.state.todoListId)
      ? await todoListEvents(this.state.todoListId)
      : [];
    let todoList = new TodoList(events);
    command(todoList);
    if (todoList.uncommittedEvents.length) {
      await addEvents(todoList.uncommittedEvents);
      this.setState({
        todoListId: todoList.id,
        todoListEvents: await todoListEvents(todoList.id)
      });
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
  renameTodo = (id: TodoIdType, name: string) => {
    this.updateDomainTodoList(list => { list.rename(id, name); })
      .catch(console.log);
  }
  render() {
    return (
      <Body
        todoListId={this.state.todoListId}
        events={this.state.todoListEvents}
        isAuthenticated={this.state.isAuthenticated}
        login={this.login}
        logout={this.logout}
        addTodo={this.addTodo}
        completeTodo={this.completeTodo}
        uncompleteTodo={this.uncompleteTodo}
        deleteTodo={this.deleteTodo}
        moveTodoUp={this.moveTodoUp}
        moveTodoDown={this.moveTodoDown}
        renameTodo={this.renameTodo}
      />
    );
  }
}
