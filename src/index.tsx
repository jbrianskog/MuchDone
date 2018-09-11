import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "components/app";
import "styles.css";

if (!window.indexedDB) {
  window.alert("Your browser doesn't support IndexedDB (the browser feature this app uses to store your To-dos). Update your browser to its latest version.");
}

ReactDOM.render(
  <App/>,
  document.getElementById("app"),
);
