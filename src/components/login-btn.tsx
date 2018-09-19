import * as React from "react";

export interface LoginBtnProps {
  login(rememberMe?: boolean): void
  logout(): void
  isAuthenticated: boolean
}

interface LoginBtnState {
  rememberMe: boolean
}

export class LoginBtn extends React.PureComponent<LoginBtnProps, LoginBtnState> {
  constructor(props: LoginBtnProps) {
    super(props);
    this.state = {
      rememberMe: false
    }
  }
  loginClicked = () => {
    this.props.login(this.state.rememberMe);
  };
  rememberMeChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ rememberMe: e.target.checked })
  }
  render() {
    return (
      <div className="navbar-right">
        {(this.props.isAuthenticated)
          ? <button onClick={this.props.logout} type="button" className="btn btn-success navbar-btn">Sign out</button>
          : <>
              <label className="checkbox-inline navbar-text">
                <input type="checkbox" checked={this.state.rememberMe} onChange={this.rememberMeChanged} />
                Remember me
              </label>
              <button onClick={this.loginClicked} type="button" className="btn btn-success navbar-btn">Sign in</button>
            </>
        }
      </div>
    );
  }
}
