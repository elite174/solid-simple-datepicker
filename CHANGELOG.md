# 1.1.0

## BREAKING changes

- `date` prop was renamed to `selectedDate`
- HTML markdown for the component was changed (there're new CSS classes, some classes were removed)

## New features and improvements

- Finally, the datepicker shows the week days! You can customize:

    ```tsx
    // default is 0 (Sunday)
    // 1 - is Monday
    <SimpleDatepicker startWeekDay={1} />
    ```

    You can also pass new locales to customize the name of the weekday

- Added new color: `--sd-button-disabled-color`
- Refactored CSS
- Fixed types for the package


# 1.0.2

- Added prefix `-sd` for css variables
- CSS is minified

# 1.0.1

- Small style improvements (Added text ellipsis for buttons)
- Added missing title prop for day list
