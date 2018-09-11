import * as React from "react";
import { todoListId } from "data";
import { Body } from "./body";

interface AppState {
  todoListId: string | null;
  isAuthenticated: boolean;
}

export class App extends React.PureComponent<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      todoListId: null,
      isAuthenticated: false,
    };
  }
  componentDidMount() {
    todoListId()
      .then(id => this.setState({ todoListId: id }))
      .catch(console.log);
  }
  updateTodoListId = (id: string | null) => this.setState({ todoListId: id });
  login = () => this.setState({ isAuthenticated: true });
  logout = () => this.setState({ isAuthenticated: false });
  render() {
    return (
      <Body
        todoListId={this.state.todoListId}
        //events={this.state.events}
        isAuthenticated={this.state.isAuthenticated}
        updateTodoListId={this.updateTodoListId}
        login={this.login}
        logout={this.logout} />
    );
  }
}
