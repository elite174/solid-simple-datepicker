import { Component, createSignal } from "solid-js";

import { SimpleDatepicker } from "./lib";
import "./lib/styles.css";

import styles from "./App.module.css";

const App: Component = () => {
  const [date, setDate] = createSignal<Date>(new Date());
  const [disabledDays, setDisabledDays] = createSignal<number[]>();

  setTimeout(() => setDisabledDays([16]), 5000);

  return (
    <div class={styles.container}>
      <SimpleDatepicker
        date={date()}
        disabledDays={disabledDays()}
        onChange={setDate}
      />
    </div>
  );
};

export default App;
