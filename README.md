# solid-simple-datepicker

A nice, customizable and simple datepicker component for every day!

![image](https://user-images.githubusercontent.com/13636224/232307456-140fb01e-5513-41e2-bbc3-ad9b14f6fcc8.png)

## Installation

`npm i solid-simple-datepicker`

`yarn add solid-simple-datepicker`

`pnpm add solid-simple-datepicker`

## Usage

```tsx
import { SimpleDatepicker } from "solid-simple-datepicker";
import "solid-simple-datepicker/styles.css";

...
const [date, setDate] = createSignal<Date>();

return <SimpleDatepicker date={date()} onChange={setDate} />;  
```

## Props

```ts
export interface DatePickerProps {
  /** Selected date */
  date?: Date;
  /**
   * Start year to show in year list
   * @default 1960
   */
  startYear?: number;
  /**
   * End year to show in year list
   * @default 2059
   */
  endYear?: number;
  /**
   * Days to disable
   * @type Number from 1 to 31
   */
  disabledDays?: number[];

  /**
   * Months to disable
   * @type Number from 0 to 11
   */
  disabledMonths?: number[];
  /**
   * Years to disable
   */
  disabledYears?: number[];
  /**
   * I18N object
   */
  locale?: Locale;
  /**
   * The order in which datepicker sections should be displayed
   * @type "d-m-y" | "d-y-m" | "m-d-y" | "m-y-d" | "y-m-d" | "y-d-m"
   * @default "m-d-y"
   */
  order?: SectionOrder;
  /**
   * Extra class applied to the container element
   */
  class?: string;
  /**
   * Extra styles applied to the container element
   */
  style?: JSX.StyleHTMLAttributes<HTMLElement>;
  /**
   * Tag for the container element
   * @default "div"
   */
  tag?: string;
  /**
   * Is footer visible
   * @default true
   */
  footer?: boolean;
  /**
   * The callback is called when the date is valid
   * It won't be called when the date is unfilled (e.g. month is not selected)
   * or the date is invalid (e.g. Feb 31 2000)
   */
  onChange?: (date: Date) => void;
  /**
   * The callback is called when "Done" button of default footer component is clicked
   */
  onFooterDone?: VoidFunction;
  /**
   * Custom footer component to show
   */
  FooterComponent?: ParentComponent;
}
```

## Customization

You can easily customize the view of the Datepicker with CSS custom variables! Just pass extra class to the component with redefined CSS variables.

You can set the following variables (check styles.css):

```css
  --sd-scrollbar-size: 6px;
  --sd-scrollbar-border-radius: 8px;

  --sd-button-border-radius: 4px;
  --sd-button-height: 2rem;
  --sd-button-width: 4rem;
  --sd-button-inline-padding: 0.5rem;
  --sd-button-focus-outline: 1px solid var(--sd-primary-color);

  --sd-scrollbar-color: #888;

  --sd-background-color: white;
  --sd-text-color: #172454;

  --sd-primary-color: #1e4cd7;
  --sd-primary-hover-color: #1f3eae;
  --sd-primary-focus-color: #94c4fc;

  --sd-text-primary-color: white;
  --sd-text-disabled-color: #aaa;
  --sd-list-caption-color: #999;

  --sd-footer-border-color: #eee;

  --sd-transition-time: 50ms;
  --sd-transition-timing-function: ease-in-out;

  --sd-section-gap: 1rem;
  --sd-list-caption-gap: 0.25rem;
  --sd-list-caption-font-size: 0.8rem;
  --sd-padding: 0.5rem;

  --sd-box-shadow: 0px 0.6px 1.8px rgba(0, 0, 0, 0.035),
    0px 5px 14px rgba(0, 0, 0, 0.07);
  --sd-border-radius: 8px;

  --sd-footer-border-top: 1px solid var(--sd-footer-border-color);
```
