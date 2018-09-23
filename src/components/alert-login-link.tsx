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
      <a role="button" tabIndex={0} onClick={this.loginClicked}>Sign&nbsp;in&nbsp;with&nbsp;Google</a>
    );
  }
}
