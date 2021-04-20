import { h, render } from "preact";
import "./index.css";
import App from "./App";

window.crosswords = function ({ rootId, onCompleted = () => {} }) {
  render(<App onCompleted={onCompleted} />, document.getElementById(rootId));
};
