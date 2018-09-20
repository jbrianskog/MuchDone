import * as React from "react";
import * as firebase from "firebase";
import { v4 as uuid } from "uuid";
import { Data } from "data";
import { updateUserProfile } from "data/firebase-rtdb"
import { TodoList } from "domain/todo-list";
import { DomainEvent, DomainEventTypeName } from "domain/events";
import { Body } from "./body";
import { TodoIdType } from "domain/todo";
import { Unsub } from "data/event-store";
import { TodoLists } from "domain/todo-lists";
import { FirebaseRTDBEventStore } from "data/firebase-rtdb-event-store";
import { IndexedDBEventStore } from "data/indexeddb-event-store";

interface AppState {
  todoListId: string | null;
  todoListEvents: DomainEvent[];
  isAuthenticated: boolean;
  authStateWasReceived: boolean;
  indexedDBSupported: boolean;
}

export class App extends React.PureComponent<{}, AppState> {
  offAuthStateChanged: firebase.Unsubscribe | null = null;
  offTodoListUpdated: Unsub | null = null;
  offTodoListsUpdated: Unsub | null = null;
  data!: Data;
  constructor(props: {}) {
    super(props);
    this.state = {
      todoListId: null,
      todoListEvents: [],
      isAuthenticated: false,
      authStateWasReceived: false,
      indexedDBSupported: ("indexedDB" in window),
    };
  }
  componentDidMount() {
    this.offAuthStateChanged = firebase.auth().onAuthStateChanged(user => {
      console.log("onAuthStateChanged");
      console.log(user);
      this.offTodoListUpdated && this.offTodoListUpdated();
      this.offTodoListsUpdated && this.offTodoListsUpdated();
      if (user) {
        // login
        this.setState({ authStateWasReceived: true, isAuthenticated: true, todoListId: null, todoListEvents: [] });
        this.data = new Data(new FirebaseRTDBEventStore<DomainEventTypeName>());
        this.subscribeToTodoListUpdates();
        updateUserProfile().catch(console.log);
      } else {
        // logout
        this.setState({ authStateWasReceived: true, isAuthenticated: false, todoListId: null, todoListEvents: [] });
        if (this.state.indexedDBSupported) {
          this.data = new Data(new IndexedDBEventStore<DomainEventTypeName>("much-done", "event"));
          this.subscribeToTodoListUpdates();
        }
      }
    })
  }
  componentWillUnmount() {
    this.offAuthStateChanged && this.offAuthStateChanged();
    this.offTodoListUpdated && this.offTodoListUpdated();
    this.offTodoListsUpdated && this.offTodoListsUpdated();
  }
  subscribeToTodoListUpdates = () => {
    this.offTodoListsUpdated = this.data.onTodoListsUpdated(events => {
      let lists = new TodoLists(events);
      if (!this.state.todoListId && lists.ids.length) {
        // The client had no TodoList and one was created.
        this.setState({ todoListId: lists.ids[0] })
        this.offTodoListUpdated = this.data.onTodoListUpdated(lists.ids[0], events => this.setState({ todoListEvents: events }));
      } else if (this.state.todoListId && !lists.ids.length) {
        // The client had a TodoList but the default TodoList was deleted.
        this.offTodoListUpdated && this.offTodoListUpdated();
        this.setState({ todoListId: null, todoListEvents: [] })
      } else if (this.state.todoListId && lists.ids.length && this.state.todoListId !== lists.ids[0]) {
        // The client had a TodoList but a different TodoList was made the default.
        this.offTodoListUpdated && this.offTodoListUpdated();
        this.setState({ todoListId: lists.ids[0] })
        this.offTodoListUpdated = this.data.onTodoListUpdated(lists.ids[0], events => this.setState({ todoListEvents: events }));
      }
    });
  }
  login = (rememberMe?: boolean) => {
    let persistence = (rememberMe)
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;
    firebase.auth().setPersistence(persistence)
      .then(() => {
        firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
      })
      .catch(console.log);
  };
  logout = () => {
    firebase.auth().signOut()
      .catch(console.log);
  };
  commandDomainTodoList = async (command: (todoList: TodoList) => void): Promise<void> => {
    let todoList = new TodoList(this.state.todoListEvents);
    command(todoList);
    if (todoList.uncommittedEvents.length) {
      await this.data.addEvents(todoList.uncommittedEvents);
      if (!this.state.todoListId && todoList.id) {
        this.setState({
          todoListId: todoList.id
        });
        this.offTodoListUpdated = this.data.onTodoListUpdated(todoList.id, events => this.setState({ todoListEvents: events }));
      }
    }
  }
  addTodo = (name: string) => {
    this.commandDomainTodoList(list => { list.add(uuid(), name); })
      .catch(console.log);
  }
  completeTodo = (id: TodoIdType) => {
    this.commandDomainTodoList(list => { list.complete(id, Date.now()); })
      .catch(console.log);
  }
  uncompleteTodo = (id: TodoIdType) => {
    this.commandDomainTodoList(list => { list.uncomplete(id); })
      .catch(console.log);
  }
  deleteTodo = (id: TodoIdType) => {
    this.commandDomainTodoList(list => { list.remove(id); })
      .catch(console.log);
  }
  moveTodoUp = (id: TodoIdType) => {
    this.commandDomainTodoList(list => { list.changePosition(id, -1); })
      .catch(console.log);
  }
  moveTodoDown = (id: TodoIdType) => {
    this.commandDomainTodoList(list => { list.changePosition(id, 1); })
      .catch(console.log);
  }
  renameTodo = (id: TodoIdType, name: string) => {
    this.commandDomainTodoList(list => { list.rename(id, name); })
      .catch(console.log);
  }
  render() {
    return (
      <Body
        events={this.state.todoListEvents}
        authStateWasReceived={this.state.authStateWasReceived}
        isAuthenticated={this.state.isAuthenticated}
        indexedDBSupported={this.state.indexedDBSupported}
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
