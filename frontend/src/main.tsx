import ReactDOM from "react-dom/client";
import App from "./App";
import type { ServerState } from "./libraryTypes";
import "./index.css";
const root = ReactDOM.createRoot(document.getElementById("root")!);
async function start() {
  try {
    const response = await fetch("/api/state");
    if (!response.ok) throw Error();
    const state: ServerState = await response.json();
    root.render(<App state={state} />);
  } catch {
    root.render(
      <main role="alert">
        Не удалось загрузить платформу. <button onClick={start}>Повторить</button>
      </main>,
    );
  }
}
void start();
