import { Component, createSignal } from "solid-js";

// @ts-ignore
import pkg from "../package.json";

import { SimpleDatepicker } from "./lib";
import "./lib/styles.css";

import styles from "./App.module.css";

const App: Component = () => {
  const [date, setDate] = createSignal<Date>(new Date());

  return (
    <main class={styles.container}>
      <h1>solid-simple-datepicker v{pkg.version}</h1>
      <SimpleDatepicker
        selectedDate={date()}
        onChange={(date) => {
          console.log(`onChange: ${date}`);

          setDate(date);
        }}
        onFooterDone={() => console.log("onDone")}
      />
      <a
        target="_blank"
        href="https://github.com/elite174/solid-simple-datepicker"
      >
        Github
      </a>
    </main>
  );
};

export default App;
