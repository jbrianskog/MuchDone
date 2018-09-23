import * as React from "react";
import { AlertLoginLink } from "./alert-login-link";

export interface NoIndexedDBAlertProps {
  login(rememberMe?: boolean): void
}

export class NoIndexedDBAlert extends React.PureComponent<NoIndexedDBAlertProps> {
  render() {
    return (
      <>
        <div className="alert alert-warning no-indexeddb-alert" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true" /><span>Your browser doesn't support storing your to-dos locally.</span>
        </div>
        <p>You have two options:</p>
        <ol>
          <li><a href="https://www.google.com/chrome/" target="_blank">Get a better browser</a></li>
          <li><AlertLoginLink login={this.props.login} /> to store your todos in the cloud ...which would be a lot cooler.</li>
        </ol>
        <p>You should <strong>really</strong> do both those things.</p>
      </>
    );
  }
}