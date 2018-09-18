import * as React from "react";
import * as ReactDOM from "react-dom";
import * as firebase from "firebase";
import { App } from "components/app";
import "styles.css";

// if (!window.indexedDB) {
//   window.alert("Your browser doesn't support IndexedDB (the browser feature this app uses to store your To-dos). Update your browser to its latest version.");
// }

firebase.initializeApp({
  apiKey: "AIzaSyA39ayMBQy61hI_F12NIVUnjBMnOxeh4NM",
  authDomain: "muchdone-daff6.firebaseapp.com",
  databaseURL: "https://muchdone-daff6.firebaseio.com",
  projectId: "muchdone-daff6",
  storageBucket: "muchdone-daff6.appspot.com",
  messagingSenderId: "1050428102724"
});

ReactDOM.render(
  <App/>,
  document.getElementById("app"),
);
