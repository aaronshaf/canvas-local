# Instructure UI Component Usage Guide

This document provides a guide for using components from the Instructure UI library within our project.

## Components

### Alert

The Alert component is used to notify the user of important information. It comes in four variants: `info`, `success`, `warning`, and `error`.

**Guidelines**

- Use the `info` variant for general information.
- Use the `success` variant to confirm that an action was successful.
- Use the `warning` variant to caution the user about a potential issue.
- Use the `error` variant to indicate that an error has occurred.
- Keep alert messages concise, ideally no more than two lines long.
- Avoid using too many alerts on a single page.

**Accessibility**

- For alerts that require user interaction to dismiss, focus should be managed appropriately.
- Use `aria-live="polite"` for most live regions, and `aria-live="assertive"` for critical information that needs to be announced immediately.
- The `aria-atomic` attribute can be used to control how much of the live region is announced when a change occurs.

**Properties**

- `children`: The content to be rendered within the alert.
- `variant`: Determines the color and icon of the alert. Can be `info`, `success`, `warning`, or `error`.
- `margin`: Sets the margin around the alert.
- `liveRegion`: A function that returns the `div` where screen reader alerts will be placed.
- `liveRegionPoliteness`: Sets the `aria-live` politeness setting (`polite` or `assertive`).
- `isLiveRegionAtomic`: Sets the `aria-atomic` attribute.
- `screenReaderOnly`: If `true`, the alert will only be visible to screen readers.
- `timeout`: The number of milliseconds until the alert is automatically dismissed.
- `renderCloseButtonLabel`: The label for the close button.
- `onDismiss`: A callback function that is executed after the alert is closed.
- `transition`: The transition effect to use when the alert appears and disappears.
- `open`: Controls the visibility of the alert.
- `hasShadow`: If `true`, the alert will have a shadow.
- `variantScreenReaderLabel`: A textual representation of the alert variant for screen readers.
- `renderCustomIcon`: An icon to override the default variant icon.

### AppNav
The AppNav component is a responsive navigation bar, primarily intended for use in LTI applications. It can adapt to different screen sizes by truncating navigation items that don't fit and placing them into a dropdown menu.

**Usage**
- Use for the primary navigation in an LTI application.
- It can be configured to display a logo, navigation items, and content after the items.
- The component can notify your application about how many items are visible, allowing for dynamic adjustments like creating a hamburger menu.

**Properties**
- `screenReaderLabel`: (Required) An accessible label for the navigation.
- `children`: Only accepts `AppNav.Item` as children.
- `debounce`: The debounce rate in milliseconds for responding to container resizing.
- `renderBeforeItems`: Content to display before the navigation items (e.g., a logo).
- `renderAfterItems`: Content to display after the navigation items, aligned to the end.
- `margin`: Sets the margin around the component.
- `elementRef`: A reference to the underlying `nav` element.
- `renderTruncateLabel`: A function to customize the label of the menu trigger for truncated items.
- `onUpdate`: A callback that receives the number of visible items when the navigation is updated.
- `visibleItemsCount`: Sets the number of visible navigation items.

### Avatar
The Avatar component is used to represent a user. It can display a user's image, or their initials if an image is not available.

**Usage**
- Use in user profiles, comments, or bylines.
- Can be circular or square.

**Properties**
- `src`: The URL of the user's image.
- `alt`: Alt text for the image.
- `initials`: The user's initials to display if no image is provided.
- `size`: The size of the avatar (e.g., 'small', 'medium', 'large').

### Badge
The Badge component is a small visual indicator used to convey a numeric count or status.

**Usage**
- Use for notification counts on icons or navigation items.
- Can also be used to indicate status (e.g., "New", "Updated").

**Properties**
- `count`: The numeric value to display.
- `variant`: The color and style of the badge (e.g., 'primary', 'danger').
- `standalone`: Whether the badge is positioned relative to another element or stands alone.

### Billboard
The Billboard component is a large, prominent hero-style container for displaying key messages, headlines, or calls to action.

**Usage**
- Use on a landing page or dashboard to draw attention to important information.
- Can contain a heading, text, and a call-to-action button.

**Properties**
- `heading`: The main headline text.
- `message`: The descriptive text.
- `cta`: A button or link for the call to action.
- `image`: A background image.

### Breadcrumb
The Breadcrumb component provides a navigational trail, showing the user their location within the application's hierarchy.

**Usage**
- Use on pages that are nested more than one level deep.
- Helps users understand their location and navigate back to previous pages.

**Properties**
- `links`: An array of objects, each with a `text` and `href` for the breadcrumb trail.

### Button
The Button component is used for user-initiated actions. It can be styled with different variants and sizes.

**Usage**
- Use for actions such as submitting forms, opening modals, or triggering events.
- Variants include `primary`, `secondary`, `success`, `danger`.

**Properties**
- `variant`: The style of the button.
- `size`: The size of the button (e.g., 'small', 'medium', 'large').
- `onClick`: A handler for the button's click event.
- `disabled`: Whether the button is disabled.

### Byline
The Byline component is used to attribute content to a user, typically displaying their avatar and name.

**Usage**
- Use in blog posts, articles, or comments to show the author.

**Properties**
- `avatar`: An Avatar component.
- `name`: The name of the user.
- `timestamp`: An optional timestamp.

### Calendar
The Calendar component is used for displaying and selecting dates.

**Usage**
- Can be used as a date picker or to display a calendar of events.

**Properties**
- `onDateSelect`: A handler for when a date is selected.
- `events`: An array of events to display on the calendar.

### Checkbox & CheckboxGroup
The Checkbox component allows the user to make a binary choice. The CheckboxGroup is used to group a series of checkboxes.

**Usage**
- Use a single checkbox for a yes/no choice.
- Use a checkbox group for a list of options where multiple selections are allowed.

**Properties (Checkbox)**
- `label`: The label for the checkbox.
- `checked`: Whether the checkbox is checked.
- `onChange`: A handler for the change event.

**Properties (CheckboxGroup)**
- `name`: The name for the group of checkboxes.
- `options`: An array of checkbox options.

### CloseButton
A button specifically for dismissing a component, such as a modal or an alert.

**Usage**
- Use in modals, alerts, or other dismissible components.

**Properties**
- `onClick`: A handler for the button's click event.

### ColorContrast
A utility to check the contrast ratio between two colors to ensure accessibility.

**Usage**
- Use during development to verify that color combinations meet accessibility standards.

### ColorIndicator
Displays a swatch of a specific color.

**Usage**
- Use to show a color choice or to represent a color in a list.

**Properties**
- `color`: The color to display.

### ColorMixer
A tool for creating and mixing colors.

**Usage**
- Use in a theme editor or other design tool.

### ColorPicker
Allows users to select a color from a palette or by entering a hex code.

**Usage**
- Use in forms or settings where a user needs to choose a color.

**Properties**
- `color`: The currently selected color.
- `onChange`: A handler for when the color is changed.

### ColorPreset
A component that displays a predefined set of color swatches for user selection.

**Usage**
- Use within a `ColorPicker` or design tool to offer a curated palette of colors.
- Can be used to enforce brand colors or a limited color selection.

**Properties**
- `colors`: An array of color strings to display as swatches.
- `onSelect`: A handler for when a color swatch is selected.

### CondensedButton
A more compact version of the standard `Button` component, suitable for use in toolbars or other space-constrained areas.

**Usage**
- Use when a standard button would take up too much space.
- Ideal for icon-only buttons with a tooltip.

**Properties**
- Inherits properties from the `Button` component but with a smaller default padding and font size.

### ContextView
A component that displays supplementary information related to a primary element, without cluttering the main interface. It often appears as a non-modal overlay.

**Usage**
- Use to show extra details, controls, or previews when a user interacts with an element.
- Can be used to create rich popovers or contextual menus.

**Properties**
- `content`: The content to be displayed within the view.
- `placement`: The position of the view relative to the trigger element (e.g., 'top', 'bottom', 'start', 'end').
- `open`: Controls the visibility of the view.

### DateInput
A form field specifically for entering a date. It typically combines a text input with a calendar popover for easy selection.

**Usage**
- Use in forms where a user needs to enter a specific date.
- Supports date formatting and validation.

**Properties**
- `label`: The label for the input field.
- `value`: The current date value.
- `onChange`: A handler for when the date value changes.
- `placeholder`: Placeholder text for the input.

### DateInput2
An alternative or updated version of the `DateInput` component, potentially with a different design or enhanced features.

**Usage**
- Use as a replacement for `DateInput` if its features are more suitable for the use case.
- May offer improved accessibility, a different UI, or additional configuration options.

**Properties**
- Similar to `DateInput`, but may include additional or different properties based on its specific implementation.
### DateTimeInput
A form field that allows the user to enter both a date and a time.

**Usage**
- Use in forms for scheduling events, setting deadlines, or any other scenario requiring a specific date and time.
- Combines the functionality of `DateInput` and a time selector.

**Properties**
- `label`: The label for the input field.
- `value`: The current date-time value.
- `onChange`: A handler for when the value changes.

### DrawerLayout
A layout component that provides a side panel (a "drawer") that can be opened and closed to reveal additional content or navigation.

**Usage**
- Use for secondary navigation, filters, or settings that don't need to be visible at all times.
- The drawer can be positioned on the start or end side of the screen.

**Properties**
- `open`: Controls whether the drawer is open or closed.
- `onDismiss`: A handler for when the drawer is dismissed.
- `label`: An accessible label for the drawer content.

### Drilldown
A navigation component that allows users to explore hierarchical data structures, such as a file system or nested categories.

**Usage**
- Use for navigating deeply nested content without losing context.
- Presents one level of the hierarchy at a time.

**Properties**
- `options`: An array of objects representing the items at the current level.
- `onSelect`: A handler for when an item is selected.

### Editable
A component that can be switched between a read-only view and an editable form.

**Usage**
- Use for in-place editing of content, such as a user's profile name or a task description.
- Reduces the need for separate view and edit pages.

**Properties**
- `mode`: Can be 'view' or 'edit'.
- `renderView`: A function that returns the content for the view mode.
- `renderEdit`: A function that returns the content for the edit mode.
- `onModeChange`: A handler for when the mode changes.

### FileDrop
A component that creates a designated area where users can drag and drop files for uploading.

**Usage**
- Use in forms or applications where users need to upload files from their local machine.
- Provides visual feedback when a file is dragged over the area.

**Properties**
- `onDrop`: A handler that is called when files are dropped onto the component.
- `label`: The text to display within the drop area.
### Flex
A layout component that uses CSS Flexbox to arrange its children. It provides a convenient way to create flexible and responsive layouts.

**Usage**
- Use for arranging items in a single dimension (a row or a column).
- Can control alignment, justification, and spacing of child elements.

**Properties**
- `direction`: The direction of the flex container (e.g., 'row', 'column').
- `justifyItems`: How items are justified along the main axis.
- `alignItems`: How items are aligned along the cross axis.
- `gap`: The spacing between child items.

### FormField & FormFieldGroup
`FormField` is a wrapper for form inputs that provides a label, help text, and validation messages. `FormFieldGroup` is used to group related form fields together.

**Usage**
- Wrap each input component (e.g., `TextInput`, `Select`) in a `FormField`.
- Use `FormFieldGroup` to organize a set of related fields under a common label or legend.

**Properties (FormField)**
- `label`: The label for the form field.
- `messages`: An array of validation or help messages to display.
- `id`: A unique identifier for the input.

**Properties (FormFieldGroup)**
- `description`: A description for the group of fields.
- `legend`: A label for the group.

### Grid
A layout component that uses CSS Grid to arrange its children in a two-dimensional grid.

**Usage**
- Use for creating complex, grid-based layouts.
- Can define rows, columns, and the placement of items within the grid.

**Properties**
- `colSpacing`: The spacing between columns.
- `rowSpacing`: The spacing between rows.
- `startAt`: The breakpoint at which the grid layout should start.

### Heading
A component for displaying page and section titles with appropriate semantic heading levels (h1, h2, h3, etc.).

**Usage**
- Use to create a clear and accessible document structure.
- Choose the appropriate heading level based on the information hierarchy.

**Properties**
- `level`: The heading level (e.g., 'h1', 'h2').
- `border`: Whether to display a border below the heading.
### IconButton
A button that contains only an icon, used for common actions where an icon is universally understood.

**Usage**
- Use in toolbars, headers, or other compact spaces.
- Always provide a `screenReaderLabel` for accessibility.

**Properties**
- `renderIcon`: The icon to display.
- `screenReaderLabel`: An accessible label for the button.
- `onClick`: A handler for the button's click event.

### Img
A component for displaying images, providing a wrapper around the standard `<img>` element with additional features.

**Usage**
- Use for displaying all images to ensure consistent styling and behavior.
- May include features like lazy loading or placeholder effects.

**Properties**
- `src`: The URL of the image.
- `alt`: Alternative text for the image.
- `width`: The width of the image.
- `height`: The height of the image.

### InlineList
A component for displaying a list of items horizontally.

**Usage**
- Use for displaying tags, categories, or a series of links.
- Can specify a delimiter to be placed between items.

**Properties**
- `delimiter`: The character or string to display between list items.
- `items`: An array of items to display in the list.

### InPlaceEdit
A component that allows users to edit content directly where it is displayed, often by clicking on the text to transform it into an input field.

**Usage**
- Use for quick edits of single pieces of information, like a document title or a person's name.

**Properties**
- `renderValue`: A function that returns the content to be displayed.
- `onChange`: A handler for when the edited value is submitted.

### Link
A component for creating hyperlinks to navigate to other pages or external resources.

**Usage**
- Use for all navigational links to ensure consistent styling and accessibility.
- Should be used for navigation, not for triggering actions.

**Properties**
- `href`: The URL to navigate to.
- `children`: The text or content of the link.
### List
A flexible component for displaying a collection of items in a vertical list.

**Usage**
- Use for displaying simple to complex lists of data.
- Supports different item layouts, delimiters, and spacing.

**Properties**
- `items`: An array of items to be rendered in the list.
- `itemLayout`: Can be 'stacked' or 'inline' to control item arrangement.
- `delimiter`: How to separate items (e.g., 'none', 'solid', 'dashed').

### Menu
A component that displays a list of actions or options to a user, typically triggered by a button.

**Usage**
- Use for creating dropdown menus, context menus, or action lists.
- Can be grouped and contain selectable items.

**Properties**
- `trigger`: The element that opens the menu.
- `children`: The `Menu.Item` or `Menu.Group` components to display.
- `onSelect`: A handler for when a menu item is selected.

### Metric & MetricGroup
The `Metric` component is used to display a single, important numerical data point with a label. `MetricGroup` arranges multiple `Metric` components together.

**Usage**
- Use on dashboards or in reports to highlight key performance indicators (KPIs).

**Properties (Metric)**
- `label`: The label for the metric.
- `value`: The numerical value to display.

**Properties (MetricGroup)**
- `children`: A collection of `Metric` components.

### Modal
A dialog box that appears on top of the main content, requiring the user to interact with it before returning to the application.

**Usage**
- Use for critical information, user decisions, or tasks that interrupt the main workflow.
- Should be used sparingly as they can be disruptive.

**Properties**
- `open`: Controls whether the modal is open or closed.
- `onDismiss`: A handler for when the modal is dismissed.
- `label`: An accessible label for the modal.
- `children`: The content of the modal.

### NumberInput
A form field specifically for entering numerical values.

**Usage**
- Use in forms where the user needs to enter a number.
- May include controls for incrementing and decrementing the value.

**Properties**
- `label`: The label for the input.
- `value`: The current numerical value.
- `onChange`: A handler for when the value changes.
### Options
A component that provides a list of selectable options, often used within a `Select` or `Menu` component.

**Usage**
- Use to render a list of choices that a user can select from.
- Can be used for both single and multiple selection.

**Properties**
- `children`: The `Options.Item` components to display.
- `onSelect`: A handler for when an option is selected.

### Overlay
A low-level component for rendering content on top of the main UI. It's a building block for other components like `Modal` and `Popover`.

**Usage**
- Use when you need to create a custom overlaying element.
- Manages stacking context and can provide a backdrop.

**Properties**
- `open`: Controls whether the overlay is visible.
- `onDismiss`: A handler for when the overlay is dismissed.
- `label`: An accessible label for the overlay content.

### Pages
A component for displaying a series of views or pages that the user can navigate through sequentially.

**Usage**
- Use for carousels, onboarding flows, or multi-step wizards.

**Properties**
- `children`: The individual `Pages.Page` components.
- `activePageIndex`: The index of the currently active page.
- `onPageIndexChange`: A handler for when the page index changes.

### Pagination
A component that provides controls to navigate through a paginated list of items.

**Usage**
- Use at the bottom of a long list or table to allow users to jump between pages of content.

**Properties**
- `variant`: The style of the pagination controls.
- `labelNext`: The label for the 'next' button.
- `labelPrev`: The label for the 'previous' button.
- `onPageChange`: A handler for when the page is changed.

### Pill
A small, rounded label used to display a status, category, or other metadata.

**Usage**
- Use to draw attention to an item's status (e.g., 'Draft', 'Published').
- Can also be used for categorization or as a removable filter tag.

**Properties**
- `text`: The text to display inside the pill.
- `variant`: The color of the pill (e.g., 'primary', 'success', 'danger').
### Popover
A small overlay that appears next to a trigger element to display additional, non-critical information or actions.

**Usage**
- Use for contextual help, quick actions, or displaying extra details without cluttering the UI.
- It is non-modal and can be dismissed by clicking outside of it.

**Properties**
- `trigger`: The element that the popover is positioned relative to.
- `children`: The content to display inside the popover.
- `on`: The event that triggers the popover (e.g., 'click', 'hover').
- `placement`: The position of the popover relative to the trigger.

### ProgressBar
A linear visual indicator that shows the completion status of a task or process.

**Usage**
- Use for file uploads, form submissions, or any task that takes a noticeable amount of time to complete.

**Properties**
- `label`: An accessible label for the progress bar.
- `valueNow`: The current value of the progress.
- `valueMax`: The maximum value, representing completion.
- `variant`: The color of the progress bar (e.g., 'primary', 'success').

### ProgressCircle
A circular visual indicator of progress, often used for a more compact representation.

**Usage**
- Use in dashboards, buttons, or other space-constrained areas to show progress.

**Properties**
- `label`: An accessible label for the progress circle.
- `value`: The current progress value (from 0 to 100).
- `size`: The diameter of the circle.

### RadioInput & RadioInputGroup
`RadioInput` represents a single choice within a set. `RadioInputGroup` is used to group multiple `RadioInput` components, ensuring that only one option can be selected at a time.

**Usage**
- Use when a user must select one option from a list of two or more mutually exclusive choices.

**Properties (RadioInput)**
- `label`: The label for the radio button.
- `value`: The value associated with the radio button.

**Properties (RadioInputGroup)**
- `name`: The name for the radio button group, shared by all options.
- `description`: A label for the entire group.
- `children`: The `RadioInput` components.
- `onChange`: A handler for when the selected value changes.

### RangeInput
An html5 range input/slider component.

**Usage**
- Use for selecting a value from a specified range.

**Properties**
- `min`: The minimum value of the range.
- `max`: The maximum value of the range.
- `defaultValue`: The initial value of the range input.
- `value`: The current value of the range input (must be accompanied by an `onChange` prop).
- `onChange`: A handler for when the value changes.
- `messages`: An array of validation or help messages.
- `size`: The size of the value label (`small`, `medium`, `large`).
- `layout`: The layout of the component (`stacked`, `inline`).
- `id`: A unique identifier for the input.
- `label`: (Required) The label for the range input.
- `displayValue`: Whether to display the current value (default: `true`).
- `step`: The step increment for the value (default: `1`).
- `formatValue`: A function to format the displayed value.
- `inline`: Whether the component is inline (default: `false`).
- `disabled`: Whether the input is disabled (default: `false`).
- `readOnly`: Whether the input is read-only (default: `false`).
- `thumbVariant`: The visual variant of the thumb (`deprecated`, `accessible`).
- `inputRef`: A function that provides a reference to the underlying input element.

**Default Theme Variables**
See which global theme variables are mapped to the component here: `packages/ui-range-input/src/RangeInput/theme.ts`

| Name | Value |
|---|---|
| `minWidth` | `12.5rem` |
| `handleSize` | `1.5rem` |
| `handleBackground` | `blue45` |
| `handleBorderColor` | `white` |
| `handleBorderSize` | `0.125rem` |
| `handleShadow` | `0 0.0625rem 0.125rem rgba(0, 0, 0, .2), 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1)` |
| `handleFocusInset` | `0.0625rem` |
| `handleFocusRingSize` | `0.125rem` |
| `handleFocusRingColor` | `white` |
| `handleFocusBackground` | `blue45` |
| `handleHoverBackground` | `blue45` |
| `handleShadowColor` | `rgb(29, 82, 126)` |
| `handleFocusOutlineColor` | `rgba(43, 122, 188, 0.4)` |
| `handleFocusOutlineWidth` | `0.75em` |
| `trackBackground` | `grey45` |
| `valueColor` | `white` |
| `valueFontFamily` | `LatoWeb, Lato, "Helvetica Neue", Helvetica, Arial, sans-serif` |
| `valueFontWeight` | `400` |
| `valueSmallFontSize` | `0.875rem` |
| `valueSmallPadding` | `0 0.5rem` |
| `valueSmallLineHeight` | `1.75rem` |
| `valueMediumFontSize` | `1rem` |
| `valueMediumPadding` | `0 0.75rem` |
| `valueMediumLineHeight` | `2.375rem` |
| `valueLargeFontSize` | `1.375rem` |
| `valueLargePadding` | `0 1.5rem` |
| `valueLargeLineHeight` | `3rem` |

**How to override the default theme**
In case you need to change the appearance of the `RangeInput` component, you can override its [default theme variables.](https://github.com/instructure/instructure-ui/tree/master/packages/ui-range-input/src/RangeInput/theme.ts)
The easiest way to do this is to utilize the `themeOverride` property. See the [Using theme overrides](https://instructure.design/#using-theme-overrides) guide for more info and alternative methods.

```javascript
// theme override example
<RangeInput {...props} themeOverride={{ handleFocusRingSize: 'custom value' }}/>
```

**How to install RangeInput**
```bash
npm install @instructure/ui-range-input
```

**How to use RangeInput**
```javascript
/*** ES Modules (with tree shaking) ***/
import { RangeInput } from '@instructure/ui-range-input'

/*** ES Modules (without tree shaking) ***/
import { RangeInput } from '@instructure/ui-range-input/es/RangeInput/index'
```

### Rating
- **Rating**: For displaying and selecting a rating.
- **Responsive**: A utility for creating responsive layouts.
- **Select**: A dropdown list for selecting a single option.
- **Selectable**: A component that can be selected.
- **SideNavBar**: A navigation bar that appears on the side of the screen.
- **SimpleSelect**: A simplified version of the select component.
- **SourceCodeEditor**: A text editor for writing and displaying code.
- **Spinner**: An animated indicator that shows that a process is running.
- **Table**: For displaying tabular data.
- **Tabs**: A set of tabs for switching between different views.
- **Tag**: A label for categorizing or filtering content.
- **Text**: For displaying text.
- **TextArea**: A form field for entering multiple lines of text.
- **TextInput**: A form field for entering a single line of text.
- **TimeSelect**: A dropdown list for selecting a time.
- **ToggleButton**: A button that can be toggled on and off.
- **ToggleDetails**: A component that can be expanded and collapsed to show or hide additional information.
- **ToggleGroup**: A group of toggle buttons.
- **Tooltip**: A small popup that displays information when a user hovers over an element.
- **TopNavBar**: A navigation bar that appears at the top of the screen.
- **Tray**: A panel that slides in from the side of the screen.
- **TreeBrowser**: A component for displaying and navigating a hierarchical tree structure.
- **TruncateText**: A component that truncates long text with an ellipsis.
- **View**: A basic container component.
