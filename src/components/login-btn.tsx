import * as React from "react";

export interface LoginBtnProps {
  login(): void
  logout(): void
  isAuthenticated: boolean
}

export class LoginBtn extends React.PureComponent<LoginBtnProps> {
  render() {
    return (
      <div>
        {(this.props.isAuthenticated)
        ? <button onClick={this.props.logout} type="button" className="btn btn-link">Logout</button>
        : <button onClick={this.props.login} type="button" className="btn btn-link">Login</button>}
      </div>
    );
  }
}
