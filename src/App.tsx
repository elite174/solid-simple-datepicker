import { Component, createSignal } from "solid-js";

import { SimpleDatepicker } from "./lib";
import "./lib/styles.css";

import styles from "./App.module.css";

const App: Component = () => {
  const [date, setDate] = createSignal(new Date(2000, 4, 3));

  setTimeout(() => {
    setDate(new Date(1960, 9, 5));

    setTimeout(() => {
      setDate(new Date(2059, 0, 7));
    }, 5000);
  }, 5000);

  return (
    <div class={styles.container}>
      <SimpleDatepicker order="d-y-m" date={date()} onChange={setDate} />
    </div>
  );
};

export default App;
