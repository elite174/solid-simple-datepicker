import { Component, createSignal } from "solid-js";

import { SectionOrder, SimpleDatepicker } from "./lib";
import "./lib/styles.css";

import styles from "./App.module.css";

const App: Component = () => {
  const [date, setDate] = createSignal<Date>(new Date());
  const [disabledDays, setDisabledDays] = createSignal<number[]>();
  const [order, setOrder] = createSignal<SectionOrder>();

  setTimeout(() => setDisabledDays([16]), 5000);

  setTimeout(() => setOrder("d-m-y"), 4000);

  return (
    <div class={styles.container}>
      <SimpleDatepicker
        date={date()}
        disabledDays={disabledDays()}
        order={order()}
        onChange={setDate}
      />
    </div>
  );
};

export default App;
