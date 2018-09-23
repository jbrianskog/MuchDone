import * as React from "react";
import { AlertLoginLink } from "./alert-login-link";

export interface LocalModeAlertProps {
  login(rememberMe?: boolean): void
  hide(): void
}

export class LocalModeAlert extends React.PureComponent<LocalModeAlertProps> {
  render() {
    return (
      <div className="alert alert-warning alert-dismissible" role="alert">
        <button type="button" className="close" onClick={this.props.hide} aria-label="Close"><span aria-hidden="true">&times;</span></button>
        {/* <h4>You're not signed-in</h4> */}
        <strong>You're not signed-in.</strong> Any to-dos you add will be stored locally; in the browser. This to-do list will only be accessible in this browser, on this device, and may be lost if your browsing data is cleared. <AlertLoginLink login={this.props.login}/> to store your to-dos in the cloud: they'll be available and synced in real-time on all your devices.
      </div>
    );
  }
}
