import * as React from "react";

export interface AlertLoginLinkProps {
  login(rememberMe?: boolean): void
}

export class AlertLoginLink extends React.PureComponent<AlertLoginLinkProps> {
  loginClicked = () => {
    this.props.login(false);
  };
  render() {
    return (
      <a onClick={this.loginClicked}>Sign in with Google</a>
    );
  }
}
