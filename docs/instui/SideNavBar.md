### SideNavBar
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

**Guidelines**
Do
Use for top-level SideNavBar
Remember that SideNavBar can be themed by the institution
When using an Avatar in the SideNavBar it should have the showBorder="always" prop
Don't
Add LTI links to the main area

**Properties**
Component Properties
PropTypeDefaultDescription
childrenReactNodenull
children of type SideNavBar.Item

minimizedbool
When minimized is set to true, the <SideNavBar /> shows icons only while the text becomes a tooltip. When it is set to false, the <SideNavBar /> shows text in addition to the icons

defaultMinimizedboolfalse
Whether the <SideNavBar /> is initially minimized (uncontrolled)

onMinimizedfunc
Type of: (event: React.SyntheticEvent, minimized: boolean) => void
labelstringRequired
Screen reader label for the main SideNavBar

toggleLabelobjectRequired
Screen reader label for the toggle button expanded/minimized state

Type of: {
  expandedLabel?: string
  minimizedLabel?: string
}
hrefstring
If the <SideNavBar.Item> goes to a new page, pass an href

onClickfuncfunction (_e: React.MouseEvent) {}
If the <SideNavBar.Item> does not go to a new page pass an onClick

Type of: (event: React.MouseEvent) => void

**Default Theme Variables**
See which global theme variables are mapped to the component here: packages/ui-side-nav-bar/src/SideNavBar/theme.ts
Component theme
NameValue
fontColorwhite
backgroundColorgrey100
width5.25rem
minimizedWidth3.375rem
fillwhite
focusOutlineInnerWidth0.125rem
focusOutlineOuterWidth0.0625rem
focusOutlineInnerColorblue45
focusOutlineOuterColorwhite
marginBottom0.75rem
toggleTransition300ms

**How to override the default theme**
In case you need to change the appearance of the SideNavBar component, you can override it's default theme variables.
The easiest way to do this is to utilize the themeOverride property. See the Using theme overrides guide for more info and alternative methods.

```javascript
// theme override example

<SideNavBar
  {...props}
  themeOverride={{
    marginBottom: 'custom value'
  }}
/>
```

**How to install SideNavBar**
```bash
npm install @instructure/ui-side-nav-bar
```

**How to use SideNavBar**
```javascript
/*** ES Modules (with tree shaking) ***/
import { SideNavBar } from ' @instructure/ui-side-nav-bar'

/*** ES Modules (without tree shaking) ***/
import { SideNavBar } from ' @instructure/ui-side-nav-bar/es/SideNavBar/index'
```

**Example**
```javascript
  <div style={{height: '35rem'}}>
    <SideNavBar
      label="Main navigation"
      toggleLabel={{
        expandedLabel: 'Minimize SideNavBar',
        minimizedLabel: 'Expand SideNavBar'
      }}
    >
      <SideNavBar.Item
        icon={<IconUserLine />}
        label={<ScreenReaderContent>Home</ScreenReaderContent>}
        href="#"
        themeOverride={{
          backgroundColor: 'red',
          hoverBackgroundColor: 'blue'
        }}
      />
      <SideNavBar.Item
        icon={<Avatar name="Ziggy Marley" size="x-small" src={avatarSquare} showBorder="always"/>}
        label="Account"
        onClick={() => { this.loadSubNav('account') }}
      />
      <SideNavBar.Item
        icon={<IconAdminLine />}
        label="Admin"
        href="#"
      />
      <SideNavBar.Item selected
        icon={<IconDashboardLine />}
        label="Dashboard"
        href="#"
      />
      <SideNavBar.Item
        icon={<Badge count={99}
                     formatOutput={function (formattedCount) {
                       return (
                         <AccessibleContent alt={`You have ${formattedCount} unread messages.`}>
                           {formattedCount}
                         </AccessibleContent>
                       )
                     }}
        ><IconInboxLine /></Badge>}
        label="Inbox"
        href="#"
      />
      <SideNavBar.Item
        icon={<IconUserLine />}
        label="Supercalifragilistic"
        href="#"
      />
    </SideNavBar>
  </div>
```