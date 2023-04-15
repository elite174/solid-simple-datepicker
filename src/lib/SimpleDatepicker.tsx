import { JSX, ParentComponent, VoidComponent, createSignal } from "solid-js";
import { For, createMemo, mergeProps } from "solid-js";
import { Dynamic } from "solid-js/web";

export type DatePickerSection = "d" | "m" | "y";

type Month = keyof typeof MONTH_LOCALE;
type Section = keyof typeof SECTION_LOCALE;

type Locale = {
  [K in Month | Section]?: string;
};

export interface DatePickerProps {
  date?: Date;
  startYear?: number;
  endYear?: number;
  disabledMonths?: number[];
  disabledDays?: number[];
  disabledYears?: number[];
  locale?: Locale;
  order?: `${DatePickerSection}-${DatePickerSection}-${DatePickerSection}`;
  class?: string;
  tag?: string;
  onChange?: (date: Date) => void;
  FooterComponent?: ParentComponent;
}

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

const MONTHS_NAMES = Object.keys(MONTH_LOCALE) as Month[];
const MONTHS = new Array(12).fill(0).map((_, index) => index + 1);
const DAYS = new Array(31).fill(0).map((_, index) => index + 1);

const SECTION_LOCALE = Object.freeze({
  year: "Year",
  month: "Month",
  day: "Day",
});

const DEFAULT_ORDER: DatePickerProps["order"] = "m-d-y";

interface CommonRenererProps {
  style?: JSX.HTMLAttributes<HTMLElement>["style"];
}

const DayRenderer: VoidComponent<
  CommonRenererProps & {
    selectedYear?: number;
    selectedMonth?: number;
    selectedDay?: number;
  } & Pick<DatePickerProps, "disabledDays" | "locale">
> = (initialProps) => {
  const props = mergeProps({ locale: { ...SECTION_LOCALE } }, initialProps);

  const disabledDays = createMemo(() => new Set(props.disabledDays ?? []));

  const daysInMonth = createMemo(() =>
    props.selectedYear !== undefined && props.selectedMonth !== undefined
      ? new Date(props.selectedYear, props.selectedMonth, 0).getDate()
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
                classList={{
                  "SimpleDatepicker-Button": true,
                  "SimpleDatepicker-Button_selected": isDaySelected(day),
                }}
                disabled={isDayDisabled(day)}
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
  CommonRenererProps & { selectedYear?: number; selectedMonth?: number } & Pick<
      DatePickerProps,
      "disabledMonths" | "locale"
    >
> = (initialProps) => {
  const props = mergeProps(
    { locale: { ...MONTH_LOCALE, ...SECTION_LOCALE } },
    initialProps
  );

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
                classList={{
                  "SimpleDatepicker-Button": true,
                  "SimpleDatepicker-Button_selected": isMonthSelected(month),
                }}
                disabled={isMonthDisabled(month)}
              >
                <time datetime={getDateTimeString(month)}>
                  {props.locale[MONTHS_NAMES[month - 1] as Month]}
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
  CommonRenererProps & { selectedYear?: number } & Pick<
      DatePickerProps,
      "startYear" | "endYear" | "disabledYears" | "locale"
    >
> = (initialProps) => {
  const props = mergeProps(
    {
      startYear: 1960,
      endYear: new Date().getFullYear() + 50,
      locale: SECTION_LOCALE,
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
                classList={{
                  "SimpleDatepicker-Button": true,
                  "SimpleDatepicker-Button_selected": isYearSelected(year),
                }}
                disabled={isYearDisabled(year)}
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
      locale: SECTION_LOCALE,
      order: DEFAULT_ORDER satisfies DatePickerProps["order"],
      tag: "div",
    },
    initialProps
  );

  const [localDate, setLocalDate] = createSignal<
    Record<Section, number | undefined>
  >({
    day: undefined,
    month: undefined,
    year: undefined,
  });

  const selectedDay = () =>
    props.date ? props.date.getDate() : localDate().day;

  const selectedMonth = () =>
    props.date ? props.date.getMonth() : localDate().month;

  const selectedYear = () =>
    props.date ? props.date.getFullYear() : localDate().year;

  const sections = () => props.order.split("-");

  const handleChange = (year?: number, month?: number, day?: number) => {
    setLocalDate((date) => ({ ...date, ...{ year, month, day } }));
  };

  return (
    <Dynamic
      component={props.tag}
      classList={{ SimpleDatepicker: true, [props.class ?? ""]: true }}
    >
      <div class="SimpleDatepicker-SectionContainer">
        <YearRenderer
          style={{ order: sections().indexOf("y") }}
          selectedYear={selectedYear()}
          startYear={props.startYear}
          endYear={props.endYear}
        />
        <MonthRenderer
          style={{ order: sections().indexOf("m") }}
          selectedMonth={selectedMonth()}
          selectedYear={selectedYear()}
          disabledMonths={props.disabledMonths}
        />
        <DayRenderer
          style={{ order: sections().indexOf("d") }}
          selectedDay={selectedDay()}
          selectedMonth={selectedMonth()}
          selectedYear={selectedYear()}
          disabledDays={props.disabledDays}
        />
      </div>
      <Dynamic component={props.FooterComponent} />
    </Dynamic>
  );
};
