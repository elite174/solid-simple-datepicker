import type { Accessor, JSX, ParentComponent, VoidComponent } from "solid-js";
import {
  For,
  Show,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
} from "solid-js";
import { createStore, unwrap } from "solid-js/store";
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

export type Locale = {
  [K in keyof typeof DEFAULT_LOCALE]?: string;
};

type LocalDate = Record<Section, number | null>;

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

const DEFAULT_LOCALE = Object.freeze({
  ...MONTH_LOCALE,
  ...SECTION_LOCALE,
  ...FOOTER_LOCALE,
});

const MONTHS_NAMES = Object.keys(MONTH_LOCALE) as Month[];
const MONTHS = new Array(12).fill(0).map((_, index) => index);
const DAYS = new Array(31).fill(0).map((_, index) => index + 1);
const SECTIONS: Section[] = ["day", "month", "year"];
const DISABLED_SECTION_PROP_NAMES = Object.freeze({
  day: "disabledDays",
  month: "disabledMonths",
  year: "disabledYears",
});

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
        <span class="SimpleDatepicker-ButtonText">{props.locale.done}</span>
      </button>
    </div>
  );
};

// This hook will scroll to selected list item
// if it's not visible
const useScrollToListItem = (
  selectedValue: Accessor<number | null>,
  dataAttribute: string
) => {
  const [listRef, setListRef] = createSignal<HTMLUListElement>();

  createEffect(() => {
    const listElement = listRef();

    if (selectedValue() !== null && listElement) {
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
    selectedYear: number | null;
    selectedMonth: number | null;
    selectedDay: number | null;
  } & Pick<DatePickerProps, "disabledDays">
> = (props) => {
  const disabledDays = createMemo(() => new Set(props.disabledDays ?? []));

  const daysInMonth = createMemo(() =>
    props.selectedYear !== null && props.selectedMonth !== null
      ? new Date(props.selectedYear, props.selectedMonth + 1, 0).getDate()
      : 31
  );

  const isDayDisabled = (day: number) =>
    day > daysInMonth() || disabledDays().has(day);

  const isDaySelected = (day: number) => day === props.selectedDay;

  const getDateTimeString = (day: number) => {
    if (props.selectedYear !== null && props.selectedMonth !== null)
      return `${props.selectedYear}-${props.selectedMonth}-${day}`;

    if (props.selectedMonth !== null) return `${props.selectedMonth}-${day}`;

    return "";
  };

  return (
    <figure
      style={props.style}
      class="SimpleDatepicker-ListWrapper SimpleDatepicker-ListWrapper_day"
    >
      <figcaption class="SimpleDatepicker-ListCaption">
        {props.locale.day}
      </figcaption>
      <ul title={props.locale.day} class="SimpleDatepicker-List">
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
                <time
                  class="SimpleDatepicker-ButtonText"
                  datetime={getDateTimeString(day)}
                >
                  {day}
                </time>
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
    selectedYear: number | null;
    selectedMonth: number | null;
  } & Pick<DatePickerProps, "disabledMonths" | "locale">
> = (props) => {
  const disabledMonths = createMemo(() => new Set(props.disabledMonths ?? []));

  const isMonthDisabled = (month: number) => disabledMonths().has(month);

  const isMonthSelected = (month: number) => month === props.selectedMonth;

  const getDateTimeString = (month: number) =>
    props.selectedYear !== null ? `${props.selectedYear}-${month}` : `${month}`;

  const setListRef = useScrollToListItem(
    () => props.selectedMonth,
    "data-month"
  );

  return (
    <figure
      style={props.style}
      class="SimpleDatepicker-ListWrapper SimpleDatepicker-ListWrapper_month"
    >
      <figcaption class="SimpleDatepicker-ListCaption">
        {props.locale.month}
      </figcaption>
      <ul
        ref={setListRef}
        title={props.locale.month}
        class="SimpleDatepicker-List"
      >
        <For each={MONTHS}>
          {(month) => (
            <li class="SimpleDatepicker-ListItem" data-month={month}>
              <button
                type="button"
                classList={{
                  "SimpleDatepicker-Button": true,
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
    selectedYear: number | null;
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
    <figure
      style={props.style}
      class="SimpleDatepicker-ListWrapper SimpleDatepicker-ListWrapper_year"
    >
      <figcaption class="SimpleDatepicker-ListCaption">
        {props.locale.year}
      </figcaption>
      <ul
        ref={setListRef}
        title={props.locale.year}
        class="SimpleDatepicker-List"
      >
        <For each={yearsArray()}>
          {(year) => (
            <li class="SimpleDatepicker-ListItem" data-year={year}>
              <button
                type="button"
                classList={{
                  "SimpleDatepicker-Button": true,
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
      order: DEFAULT_ORDER satisfies DatePickerProps["order"],
      tag: "div",
      footer: true,
    },
    initialProps
  );

  const [localDate, setLocalDate] = createStore<LocalDate>(
    (() =>
      props.date
        ? {
            year: props.date.getFullYear(),
            month: props.date.getMonth(),
            day: props.date.getDate(),
          }
        : { year: null, month: null, day: null })()
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

  // Here we need to reset a section if selected item in the section becomes disabled 
  createComputed(() => {
    const currentLocalDate = { ...unwrap(localDate) };

    SECTIONS.forEach((section) => {
      // subscribe here to all props
      const disabledList = props[DISABLED_SECTION_PROP_NAMES[section]];

      if (
        currentLocalDate[section] !== null &&
        disabledList?.some((value) => value === currentLocalDate[section])
      ) {
        currentLocalDate[section] = null;
      }
    });

    setLocalDate(currentLocalDate);
  });

  const locale = createMemo(() => ({
    ...DEFAULT_LOCALE,
    ...props.locale,
  }));

  const sectionMap = {
    d: () => (
      <DayRenderer
        locale={locale()}
        selectedDay={localDate.day}
        selectedMonth={localDate.month}
        selectedYear={localDate.year}
        disabledDays={props.disabledDays}
        onSelect={(day) => handleChange({ day })}
      />
    ),
    m: () => (
      <MonthRenderer
        locale={locale()}
        selectedMonth={localDate.month}
        selectedYear={localDate.year}
        disabledMonths={props.disabledMonths}
        onSelect={(month) => handleChange({ month })}
      />
    ),
    y: () => (
      <YearRenderer
        locale={locale()}
        selectedYear={localDate.year}
        startYear={props.startYear}
        endYear={props.endYear}
        onSelect={(year) => handleChange({ year })}
      />
    ),
  };

  const sections = createMemo(
    () => props.order.split("-") as DatePickerSection[]
  );

  const handleChange = (patch: Partial<LocalDate>) => {
    const newLocalDate = { ...unwrap(localDate), ...patch };

    // If smth is null don't call onChange
    if (
      newLocalDate.day === null ||
      newLocalDate.month === null ||
      newLocalDate.year === null
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
      newLocalDate.day = null;
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
      style={props.style}
    >
      <div class="SimpleDatepicker-SectionContainer">
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
