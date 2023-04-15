import { Component, createSignal } from "solid-js";

import { SimpleDatepicker } from "./lib";
import "./lib/styles.css";

import styles from "./App.module.css";

const App: Component = () => {
  const [date, setDate] = createSignal(new Date(2000, 4, 3));

  return (
    <div class={styles.container}>
      <SimpleDatepicker date={date()} onChange={setDate} />
    </div>
  );
};

export default App;
