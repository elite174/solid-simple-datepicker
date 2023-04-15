import type { JSX, ParentComponent, VoidComponent } from "solid-js";
import {
  For,
  Show,
  createComputed,
  createMemo,
  createSignal,
  mergeProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";

export type DatePickerSection = "d" | "m" | "y";

type Month = keyof typeof MONTH_LOCALE;
type Section = keyof typeof SECTION_LOCALE;

type Locale = {
  [K in keyof typeof DEFAULT_LOCALE]?: string;
};

type LocalDate = Record<Section, number | undefined>;

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
   * @default 2060
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
   * @default "m-d-y"
   */
  order?: `${DatePickerSection}-${DatePickerSection}-${DatePickerSection}`;
  /**
   * Extra class applied to the container element
   */
  class?: string;
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

const DEFAULT_START_YEAR = 1960;
const DEFAULT_END_YEAR = 2060;
const DEFAULT_ORDER: DatePickerProps["order"] = "m-d-y";

const MONTH_LOCALE = Object.freeze({
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "Noveber",
  dec: "December",
});

const SECTION_LOCALE = Object.freeze({
  year: "Year",
  month: "Month",
  day: "Day",
});

const FOOTER_LOCALE = Object.freeze({
  done: "Done",
});

const DEFAULT_LOCALE = Object.freeze({
  ...MONTH_LOCALE,
  ...SECTION_LOCALE,
  ...FOOTER_LOCALE,
});

const MONTHS_NAMES = Object.keys(MONTH_LOCALE) as Month[];
const MONTHS = new Array(12).fill(0).map((_, index) => index);
const DAYS = new Array(31).fill(0).map((_, index) => index + 1);

interface CommonComponentProps {
  locale: Required<Locale>;
}

interface CommonRendererProps extends CommonComponentProps {
  style?: JSX.HTMLAttributes<HTMLElement>["style"];
  onSelect: (dateParam: number) => void;
}

const Footer: VoidComponent<
  CommonComponentProps & {
    onDone?: VoidFunction;
  }
> = (props) => {
  return (
    <div class="SimpleDatepicker-Footer">
      <button
        onClick={props.onDone}
        type="button"
        class="SimpleDatepicker-Button SimpleDatepicker-Button_selected"
      >
        {props.locale.done}
      </button>
    </div>
  );
};

const DayRenderer: VoidComponent<
  CommonRendererProps & {
    selectedYear?: number;
    selectedMonth?: number;
    selectedDay?: number;
  } & Pick<DatePickerProps, "disabledDays">
> = (props) => {
  const disabledDays = createMemo(() => new Set(props.disabledDays ?? []));

  const daysInMonth = createMemo(() =>
    props.selectedYear !== undefined && props.selectedMonth !== undefined
      ? new Date(props.selectedYear, props.selectedMonth + 1, 0).getDate()
      : 31
  );

  const isDayDisabled = (day: number) =>
    day > daysInMonth() || disabledDays().has(day);

  const isDaySelected = (day: number) => day === props.selectedDay;

  const getDateTimeString = (day: number) => {
    if (
      props.selectedYear !== undefined &&
      props.selectedMonth !== undefined &&
      day !== undefined
    )
      return `${props.selectedYear}-${props.selectedMonth}-${day}`;

    if (props.selectedMonth !== undefined && day !== undefined)
      return `${props.selectedMonth}-${day}`;
  };

  return (
    <figure
      style={props.style}
      class="SimpleDatepicker-ListWrapper SimpleDatepicker-ListWrapper_day"
    >
      <figcaption class="SimpleDatepicker-ListCaption">
        {props.locale.day}
      </figcaption>
      <ul class="SimpleDatepicker-List">
        <For each={DAYS}>
          {(day) => (
            <li class="SimpleDatepicker-ListItem">
              <button
                type="button"
                classList={{
                  "SimpleDatepicker-Button": true,
                  "SimpleDatepicker-Button_selected": isDaySelected(day),
                }}
                disabled={isDayDisabled(day)}
                onClick={() => props.onSelect(day)}
              >
                <time datetime={getDateTimeString(day)}>{day}</time>
              </button>
            </li>
          )}
        </For>
      </ul>
    </figure>
  );
};

const MonthRenderer: VoidComponent<
  CommonRendererProps & {
    selectedYear?: number;
    selectedMonth?: number;
  } & Pick<DatePickerProps, "disabledMonths" | "locale">
> = (props) => {
  const disabledMonths = createMemo(() => new Set(props.disabledMonths ?? []));

  const isMonthDisabled = (month: number) => disabledMonths().has(month);

  const isMonthSelected = (month: number) => month === props.selectedMonth;

  const getDateTimeString = (month: number) =>
    props.selectedYear !== undefined
      ? `${props.selectedYear}-${month}`
      : `${month}`;

  return (
    <figure
      style={props.style}
      class="SimpleDatepicker-ListWrapper SimpleDatepicker-ListWrapper_month"
    >
      <figcaption class="SimpleDatepicker-ListCaption">
        {props.locale.month}
      </figcaption>
      <ul title={props.locale.month} class="SimpleDatepicker-List">
        <For each={MONTHS}>
          {(month) => (
            <li class="SimpleDatepicker-ListItem">
              <button
                type="button"
                classList={{
                  "SimpleDatepicker-Button": true,
                  "SimpleDatepicker-Button_selected": isMonthSelected(month),
                }}
                disabled={isMonthDisabled(month)}
                onClick={() => props.onSelect(month)}
              >
                <time datetime={getDateTimeString(month)}>
                  {props.locale[MONTHS_NAMES[month] as Month]}
                </time>
              </button>
            </li>
          )}
        </For>
      </ul>
    </figure>
  );
};

const YearRenderer: VoidComponent<
  CommonRendererProps & {
    selectedYear?: number;
  } & Pick<
      DatePickerProps,
      "startYear" | "endYear" | "disabledYears" | "locale"
    >
> = (initialProps) => {
  const props = mergeProps(
    {
      startYear: DEFAULT_START_YEAR,
      endYear: DEFAULT_END_YEAR,
    },
    initialProps
  );

  const yearsArray = () =>
    new Array(props.endYear - props.startYear)
      .fill(0)
      .map((_, index) => index + props.startYear);

  const disabledYears = createMemo(() => new Set(props.disabledYears ?? []));

  const isYearDisabled = (year: number) => disabledYears().has(year);

  const isYearSelected = (year: number) => year === props.selectedYear;

  return (
    <figure
      style={props.style}
      class="SimpleDatepicker-ListWrapper SimpleDatepicker-ListWrapper_year"
    >
      <figcaption class="SimpleDatepicker-ListCaption">
        {props.locale.year}
      </figcaption>
      <ul class="SimpleDatepicker-List">
        <For each={yearsArray()}>
          {(year) => (
            <li class="SimpleDatepicker-ListItem">
              <button
                type="button"
                classList={{
                  "SimpleDatepicker-Button": true,
                  "SimpleDatepicker-Button_selected": isYearSelected(year),
                }}
                disabled={isYearDisabled(year)}
                onClick={() => props.onSelect(year)}
              >
                <time datetime={`${year}`}>{year}</time>
              </button>
            </li>
          )}
        </For>
      </ul>
    </figure>
  );
};

export const SimpleDatepicker: ParentComponent<DatePickerProps> = (
  initialProps
) => {
  const props = mergeProps(
    {
      order: DEFAULT_ORDER satisfies DatePickerProps["order"],
      tag: "div",
      footer: true
    },
    initialProps
  );

  const [localDate, setLocalDate] = createSignal<LocalDate>(
    (() =>
      props.date
        ? {
            year: props.date.getFullYear(),
            month: props.date.getMonth(),
            day: props.date.getDate(),
          }
        : { year: undefined, month: undefined, day: undefined })(),
    {
      equals: (prev, next) =>
        prev.day === next.day &&
        prev.month === next.month &&
        prev.year === next.year,
    }
  );

  // update local date if external date changes
  createComputed(() => {
    if (props.date) {
      setLocalDate({
        year: props.date.getFullYear(),
        month: props.date.getMonth(),
        day: props.date.getDate(),
      });
    }
  });

  const locale = createMemo(() => ({
    ...DEFAULT_LOCALE,
    ...props.locale,
  }));

  const sections = createMemo(() => props.order.split("-"));

  const handleChange = (patch: Partial<LocalDate>) => {
    const newLocalDate = { ...localDate(), ...patch };

    // If smth is undefined don't call onChange
    if (
      newLocalDate.day === undefined ||
      newLocalDate.month === undefined ||
      newLocalDate.year === undefined
    ) {
      setLocalDate(newLocalDate);

      return;
    }

    // If the date is invalid (like Date(2000, 1, 31) - Feb 31 2000)
    // update local date and return
    if (
      new Date(
        newLocalDate.year,
        newLocalDate.month,
        newLocalDate.day
      ).getMonth() !== newLocalDate.month
    ) {
      newLocalDate.day = undefined;
      setLocalDate(newLocalDate);

      return;
    }

    setLocalDate(newLocalDate);

    if (props.onChange) {
      const date = new Date(
        newLocalDate.year,
        newLocalDate.month,
        newLocalDate.day
      );

      props.onChange(date);
    }
  };

  return (
    <Dynamic
      component={props.tag}
      classList={{
        SimpleDatepicker: true,
        [props.class ?? ""]: true,
      }}
    >
      <div class="SimpleDatepicker-SectionContainer">
        <YearRenderer
          locale={locale()}
          style={{ order: sections().indexOf("y") }}
          selectedYear={localDate().year}
          startYear={props.startYear}
          endYear={props.endYear}
          onSelect={(year) => handleChange({ year })}
        />
        <MonthRenderer
          locale={locale()}
          style={{ order: sections().indexOf("m") }}
          selectedMonth={localDate().month}
          selectedYear={localDate().year}
          disabledMonths={props.disabledMonths}
          onSelect={(month) => handleChange({ month })}
        />
        <DayRenderer
          locale={locale()}
          style={{ order: sections().indexOf("d") }}
          selectedDay={localDate().day}
          selectedMonth={localDate().month}
          selectedYear={localDate().year}
          disabledDays={props.disabledDays}
          onSelect={(day) => handleChange({ day })}
        />
      </div>
      <Show when={props.footer}>
        <Dynamic
          component={
            props.FooterComponent ??
            (() => <Footer locale={locale()} onDone={props.onFooterDone} />)
          }
        />
      </Show>
    </Dynamic>
  );
};
