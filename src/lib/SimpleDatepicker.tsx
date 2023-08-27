import type { Accessor, JSX, ParentComponent, VoidComponent } from "solid-js";
import {
  For,
  Show,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
} from "solid-js";
import { Dynamic } from "solid-js/web";

export type DatePickerSection = "d" | "m" | "y";

export type SectionOrder =
  | "d-m-y"
  | "d-y-m"
  | "m-d-y"
  | "m-y-d"
  | "y-m-d"
  | "y-d-m";

type Month = keyof typeof MONTH_LOCALE;
type Section = keyof typeof SECTION_LOCALE;
type Weekday = keyof typeof WEEKDAY_LOCALE;

export type Locale = {
  [K in keyof typeof DEFAULT_LOCALE]?: string;
};

type LocalDate = Record<Section, number>;

export interface DatePickerProps {
  selectedDate?: Date;
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
   * The number from 0 (Sun) to 6 (Sat)
   * @default 0 (Sunday)
   */
  startWeekDay?: number;
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
  jan: "Jan",
  feb: "Feb",
  mar: "Mar",
  apr: "Apr",
  may: "May",
  jun: "Jun",
  jul: "Jul",
  aug: "Aug",
  sep: "Sep",
  oct: "Oct",
  nov: "Nov",
  dec: "Dec",
});

const SECTION_LOCALE = Object.freeze({
  year: "Year",
  month: "Month",
  day: "Day",
});

const FOOTER_LOCALE = Object.freeze({
  done: "Done",
});

const WEEKDAY_LOCALE = Object.freeze({
  sun: "S",
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
});

const DEFAULT_LOCALE = Object.freeze({
  ...MONTH_LOCALE,
  ...SECTION_LOCALE,
  ...FOOTER_LOCALE,
  ...WEEKDAY_LOCALE,
});

const MONTHS_NAMES = Object.keys(MONTH_LOCALE) as Month[];
const MONTHS = new Array(12).fill(0).map((_, index) => index);
const WEEKDAYS = new Array(7).fill(0).map((_, index) => index);
const WEEKDAYS_NAMES = Object.keys(WEEKDAY_LOCALE) as Weekday[];

const getWeekOfMonth = (
  date: number,
  offsetWeekDay: number,
  firstWeekday: number
): number => {
  const offsetDate = date + ((firstWeekday + 7 - offsetWeekDay) % 7) - 1;

  return Math.floor(offsetDate / 7);
};

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
        class="SimpleDatepicker-Button SimpleDatepicker-Button_selected SimpleDatepicker-Button_wide"
      >
        <span class="SimpleDatepicker-ButtonText">{props.locale.done}</span>
      </button>
    </div>
  );
};

// This hook will scroll to selected list item
// if it's not visible
const useScrollToListItem = (
  selectedValue: Accessor<number>,
  dataAttribute: string
) => {
  const [listRef, setListRef] = createSignal<HTMLUListElement>();

  createEffect(() => {
    const listElement = listRef();

    if (listElement) {
      const selectedListElement = listElement.querySelector(
        `[${dataAttribute}="${selectedValue()}"]`
      );

      if (selectedListElement instanceof HTMLElement) {
        const listHeight = listElement.clientHeight;
        const listItemYPosition = selectedListElement.offsetTop;
        const listScrollPosition = listElement.scrollTop;

        if (
          listScrollPosition + listHeight < listItemYPosition ||
          listScrollPosition > listItemYPosition
        ) {
          listElement.scrollTo({
            // we have only 5 visible items
            // so selected item should be in the center
            top: listItemYPosition - (listHeight / 5) * 2,
          });
        }
      }
    }
  });

  return setListRef;
};

const DayRenderer: VoidComponent<
  CommonRendererProps & {
    selectedYear: number;
    selectedMonth: number;
    selectedDay: number;
    daysInMonth: number;
    startWeekDay: number;
    firstWeekDay: number;
  } & Pick<DatePickerProps, "disabledDays" | "startWeekDay">
> = (props) => {
  const disabledDays = createMemo(() => new Set(props.disabledDays ?? []));

  const isDayDisabled = (day: number) => disabledDays().has(day);

  const isDaySelected = (day: number) => day === props.selectedDay;

  const getDateTimeString = (day: number) =>
    `${props.selectedYear}-${props.selectedMonth}-${day}`;

  return (
    <figure style={props.style} class="SimpleDatepicker-ListWrapper">
      <figcaption class="SimpleDatepicker-ListCaption">
        {props.locale.day}
      </figcaption>
      <ul title={props.locale.day} class="SimpleDatepicker-DayGrid">
        <For each={WEEKDAYS}>
          {(_, index) => (
            <li class="SimpleDatepicker-ListItem">
              <button
                type="button"
                disabled
                class="SimpleDatepicker-Button SimpleDatepicker-Button_squared"
              >
                <span class="SimpleDatepicker-ButtonText">
                  {
                    props.locale[
                      WEEKDAYS_NAMES[
                        WEEKDAYS[(index() + props.startWeekDay) % 7]
                      ]
                    ]
                  }
                </span>
              </button>
            </li>
          )}
        </For>
        <For
          each={new Array(props.daysInMonth)
            .fill(0)
            .map((_, index) => index + 1)}
        >
          {(day) => {
            const dayInWeek = () =>
              new Date(props.selectedYear, props.selectedMonth, day).getDay();

            const weekInMonth = createMemo(() =>
              getWeekOfMonth(day, props.startWeekDay, props.firstWeekDay)
            );

            const gridColumnStart = () =>
              (dayInWeek() + 7 - props.startWeekDay) % 7;

            // +1 here because we need to skip row with week days
            const gridRowStart = () => weekInMonth() + 1;

            return (
              <li
                class="SimpleDatepicker-ListItem"
                style={{
                  "grid-column": `${gridColumnStart() + 1} / ${
                    gridColumnStart() + 2
                  }`,
                  "grid-row": `${gridRowStart() + 1} / ${gridRowStart() + 2}`,
                }}
              >
                <button
                  type="button"
                  classList={{
                    "SimpleDatepicker-Button SimpleDatepicker-Button_squared":
                      true,
                    "SimpleDatepicker-Button_selected": isDaySelected(day),
                  }}
                  disabled={isDayDisabled(day)}
                  onClick={() => props.onSelect(day)}
                >
                  <time
                    class="SimpleDatepicker-ButtonText"
                    datetime={getDateTimeString(day)}
                  >
                    {day}
                  </time>
                </button>
              </li>
            );
          }}
        </For>
      </ul>
    </figure>
  );
};

const MonthRenderer: VoidComponent<
  CommonRendererProps & {
    selectedYear: number;
    selectedMonth: number;
  } & Pick<DatePickerProps, "disabledMonths" | "locale">
> = (props) => {
  const disabledMonths = createMemo(() => new Set(props.disabledMonths ?? []));

  const isMonthDisabled = (month: number) => disabledMonths().has(month);

  const isMonthSelected = (month: number) => month === props.selectedMonth;

  const getDateTimeString = (month: number) => `${props.selectedYear}-${month}`;

  const setListRef = useScrollToListItem(
    () => props.selectedMonth,
    "data-month"
  );

  return (
    <figure style={props.style} class="SimpleDatepicker-ListWrapper">
      <figcaption class="SimpleDatepicker-ListCaption SimpleDatepicker-ListCaption_withScrollbarPadding">
        {props.locale.month}
      </figcaption>
      <ul
        ref={setListRef}
        title={props.locale.month}
        class="SimpleDatepicker-List SimpleDatepicker-List_scrollable"
      >
        <For each={MONTHS}>
          {(month) => (
            <li class="SimpleDatepicker-ListItem" data-month={month}>
              <button
                type="button"
                classList={{
                  "SimpleDatepicker-Button SimpleDatepicker-Button_wide": true,
                  "SimpleDatepicker-Button_selected": isMonthSelected(month),
                }}
                disabled={isMonthDisabled(month)}
                onClick={() => props.onSelect(month)}
              >
                <time
                  class="SimpleDatepicker-ButtonText"
                  datetime={getDateTimeString(month)}
                >
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
    selectedYear: number;
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

  const setListRef = useScrollToListItem(() => props.selectedYear, "data-year");

  return (
    <figure style={props.style} class="SimpleDatepicker-ListWrapper">
      <figcaption class="SimpleDatepicker-ListCaption SimpleDatepicker-ListCaption_withScrollbarPadding">
        {props.locale.year}
      </figcaption>
      <ul
        ref={setListRef}
        title={props.locale.year}
        class="SimpleDatepicker-List SimpleDatepicker-List_scrollable"
      >
        <For each={yearsArray()}>
          {(year) => (
            <li class="SimpleDatepicker-ListItem" data-year={year}>
              <button
                type="button"
                classList={{
                  "SimpleDatepicker-Button SimpleDatepicker-Button_wide": true,
                  "SimpleDatepicker-Button_selected": isYearSelected(year),
                }}
                disabled={isYearDisabled(year)}
                onClick={() => props.onSelect(year)}
              >
                <time class="SimpleDatepicker-ButtonText" datetime={`${year}`}>
                  {year}
                </time>
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
      order: DEFAULT_ORDER,
      tag: "div",
      footer: true,
      startWeekDay: 0,
    } satisfies DatePickerProps,
    initialProps
  );

  const propsDate = createMemo<Date>(() => props.selectedDate ?? new Date());

  const [currentYear, setCurrentYear] = createSignal(propsDate().getFullYear());
  const [currentMonth, setCurrentMonth] = createSignal(propsDate().getMonth());
  const [currentDate, setCurrentDate] = createSignal(propsDate().getDate());

  // sync state with props
  createComputed(
    on(
      () => props.selectedDate,
      (selectedDate) => {
        if (!selectedDate) selectedDate = new Date();

        setCurrentYear(selectedDate.getFullYear());
        setCurrentMonth(selectedDate.getMonth());
        setCurrentDate(selectedDate.getDate());
      },
      { defer: true }
    )
  );

  const locale = createMemo(() => ({
    ...DEFAULT_LOCALE,
    ...props.locale,
  }));

  const handleChange = (patch: Partial<LocalDate>) =>
    props.onChange?.(
      new Date(
        patch.year ?? currentYear(),
        patch.month ?? currentMonth(),
        patch.day ?? currentDate()
      )
    );

  const daysInMonth = createMemo(() =>
    new Date(currentYear(), currentMonth() + 1, 0).getDate()
  );

  const firstWeekday = createMemo(() =>
    new Date(currentYear(), currentMonth(), 1).getDay()
  );

  const weekInMonth = createMemo(() =>
    getWeekOfMonth(daysInMonth(), props.startWeekDay, firstWeekday())
  );

  const sectionMap = {
    d: () => (
      <DayRenderer
        locale={locale()}
        selectedDay={currentDate()}
        selectedMonth={currentMonth()}
        selectedYear={currentYear()}
        daysInMonth={daysInMonth()}
        firstWeekDay={firstWeekday()}
        disabledDays={props.disabledDays}
        startWeekDay={props.startWeekDay}
        onSelect={(day) => handleChange({ day })}
      />
    ),
    m: () => (
      <MonthRenderer
        locale={locale()}
        selectedMonth={currentMonth()}
        selectedYear={currentYear()}
        disabledMonths={props.disabledMonths}
        onSelect={(month) => handleChange({ month })}
      />
    ),
    y: () => (
      <YearRenderer
        locale={locale()}
        selectedYear={currentYear()}
        startYear={props.startYear}
        endYear={props.endYear}
        onSelect={(year) => handleChange({ year })}
      />
    ),
  };

  const sections = createMemo(
    () => props.order.split("-") as DatePickerSection[]
  );

  return (
    <Dynamic
      component={props.tag}
      classList={{
        SimpleDatepicker: true,
        [props.class ?? ""]: true,
      }}
      style={props.style}
    >
      <div
        class="SimpleDatepicker-SectionContainer"
        style={{
          ["--sd-max-rows"]: weekInMonth() + 2,
        }}
      >
        <For each={sections()}>
          {
            // We can't use flex-order because we want proper tab naviagtion on sections
            // Tabindex is also not preferrable because we don't want to affect external navigation
            (section) => <Dynamic component={sectionMap[section]} />
          }
        </For>
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
