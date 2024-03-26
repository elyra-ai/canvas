# Toolbar Config object

The toolbar config object is optional. If it is not provided common-canvas will display a reasonable default toolbar. If provided, it configures which action items (tools) and dividers are shown in the canvas toolbar. A toolbar will only be displayed for common-canvas if the canvas configuration field [`enableToolbarLayout`](2.1-Config-Objects.md#enabletoolbarlayout) is set to "Top" (which is the default).

If you do specify a toolbar config object, you can specify actions for the left and right side of the toolbar to override the default toolbar. You can also optionally tell the toolbar not to handle the enable/disable state for the standard toolbar buttons using `overrideAutoEnableDisable`. The `leftBar` and `rightBar` fields contain an array of objects: one element for each toolbar item. Here is an example, toolbar configuration object:

```js
    const toolbarConfig = {
        leftBar: [
            { action: "undo", label: "Undo", enable: true },
            { action: "redo", label: "Redo", enable: true },
            { divider: true },
            { action: "cut", label: "Cut", enable: false },
            { action: "copy", label: "Copy", enable: false },
            { action: "paste", label: "Paste", enable: false },
            { divider: true },
            { action: "createAutoComment", label: "Add Comment", enable: true },
            { action: "deleteSelectedObjects", label: "Delete", enable: true },
            { action: "arrangeHorizontally", label: "Arrange Horizontally", enable: true }
            { divider: true },
            { action: "insaneMode", label: "Switch on insane mode", enable: true, isSelected: true }
        ],
        rightBar: [
            { action: "stop", label: "Stop Execution", enable: false },
            { divider: true },
            { action: "run", label: "Run Pipeline", enable: false }
        ],
        overrideAutoEnableDisable: false
    };
```
Where:

* **leftBar** - an array of action items to specify what is displayed on the left side of the toolbar.

* **rightBar** - an array of action items to specify what is displayed on the right side of the toolbar. If this is omitted, common-canvas will automatically populate the right side of the toolbar with zoom-in, zoom-out, and zoom-to-fit actions. To suppress these right side actions, specify the `rightBar` field as an empty array or an array containing the actions you want on the right.

* **overrideAutoEnableDisable** - a boolean. The default is false. By default common-canvas has an auto-enablement feature that controls the enablement of common tools in the toolbar based on user actions (e.g enable the `Delete` icon when items are selected). If `overrideAutoEnableDisable` set to true it will switch off the auto-enablement feature. This is useful if the host application wants to disable all the nodes under certain circumstances. If set to true, the `enable` property in the action items for each tool is used to decide whether to display the icon as enabled or disabled. If set to false or omitted, common-canvas will handle the auto-enablement of common actions. (See the `action`section below for more details.)

Two toolbar items are automatically added to the toolbar:

- A palette action which is used for opening and closing the node palette. This is added to the left side of the left side of the toolbar if the [`enablePaletteLayout`](2.1-Config-Objects.md#enablepalettelayout) field is set to either "Flyout" (the default) or "Modal" in the canvas configuration.
- A notification panel action which is used to open and close the notifications panel. This will be added to the right side of the toolbar if a [notification configuration](2.1-Config-Objects.md#notification-config-object) object is specified to the `<CommonCanvas>` react object.

The toolbar will display the objects in the same order they are defined in the arrays.

Here is an example of an action object which must contain a unique `action` field as a minimum.
```js
    {
        action: "run",
        label: "Run",
        enable: true,
        iconEnabled: "/image/myOwnEnabledIcon.svg",
        iconDisabled: "/image/myOwnDisabledIcon.svg",
        incLabelWithIcon: "before",
        kind: "primary",
        tooltip: "Run the flow",
        isSelected: false
    }
```

* **action** - a unique identifier and the name of the action to be performed. This action name will be passed in the `data` parameter of the [editActionHandler](2.2-Common-Canvas-callbacks.md#editactionhandler) callback method so you can detect when the user clicks an action in the toolbar.

    If you are using the recommended (and default) [internal object model](2.1-Config-Objects.md#enableinternalobjectmodel), the following built in actions will be automatically handled by common-canvas: `undo`, `redo`, `cut`, `copy`, `paste`, `createAutoComment`, `deleteSelectedObjects`, `arrangeHorizontally`, `arrangeVertically`, `zoomIn`, `zoomOut`, and `zoomToFit`. So for example, if the `deleteSelectedObjects` action (shown as a trash can) is clicked, any selected objects will be deleted from the internal object model.

    Disablement of some of these built in actions is also handled by common-canvas so, for example, when no canvas objects are selected the `deleteSelectedObjects` action (trash can icon) will be automatically disabled. You can switch off this automatic enable/disable function by setting `overrideAutoEnableDisable` field in the toolbar config to `true`. When set to true, the `enable` field in the action objects will be used to set the enablement appearance of the toolbar item.

* **label** - the Tooltip label to display (and optionally the text to display next to the icon if `incLabelWithIcon` is specified).

* **enable** - Icon will have hover effect and is clickable when set to true. If false, icon will be disabled and unclickable. If not set, it will default to disabled (false). If `overrideAutoEnableDisable` is set to false, or omitted, this field is ignored for the standard action items (like cut, copy, paste) because common canvas handles their enable/disable appearance. If `overrideAutoEnableDisable` is set to true, this field will be used for standard action items.

* **iconEnabled** - specifies the icon to display when `enable` is true. Common-canvas will provide icons for the following actions so you don't need to specify `iconEnabled` or `iconDisabled` for them: `stop`, `run`, `undo`, `redo`, `cut`, `copy`, `paste`, `createAutoComment`, `deleteSelectedObjects`, `arrangeHorizontally`, `arrangeVertically`, `commentsShow`, `commentsHide`, `zoomIn`, `zoomOut`, and `zoomToFit`.

    It can be either:

    - a string containing the path to a custom SVG file to display or
    - a JSX expression, for example `(<Edit32 />)` where Edit32 is an icon imported from carbon icons. It is recommended to only pass very simple JSX expressions.

* **iconDisabled** - specifies the icon to display when `enable` is false. If `iconDisabled` is *not* specified `iconEnabled` will be used instead. It can be omitted for any of the standard actions (see `iconEnabled` above).

    It can be either:

    - a string containing the path to a custom SVG file to display or
    - a JSX expression, for example `(<Edit32 />)` where Edit32 is an icon imported from carbon icons. It is recommended to only pass very simple JSX expressions.

* **incLabelWithIcon** - can be set to "no", "before" or "after". The default is "no". This field specifies whether the label should be displayed in the toolbar with the icon and if so, where it is displayed with respect to the icon.

* **kind** - can be set to "default", "primary", "danger", "secondary", "tertiary" or "ghost". The default it "default". These give the action the same styling as the equivalent kind's of [buttons in the carbon library](https://carbondesignsystem.com/components/button/usage#button-types).

* **tooltip** - A string or JSX object. The tooltip that will be displayed for the action. If this is not provided the label will be displayed as the tooltip instead.

* **isSelected** - A boolean. When set to true the toolbar button displays a selection highlight (which is a blue bar along the bottom border of the toolbar item). This is useful if you have a button that switches on and off a mode in your interface, as opposed to a regular button, which does not have any state, that would typically execute a command of some sort. For example, if your product has a 'Turbo boost' setting, which can be on or off, you could add a 'Turbo Boost' button to the toolbar and use `isSelected` to indicate when the option is active. When the user clicks the button it would switch `isSelected` for the 'Turbo Boost' button to true or false as appropriate. (This would give behavior like a checkbox.)

    You can also use this property to indicate a current state between a number of mutually exclusive settings. In this case, you would add one button to the toolbar for each setting and then set the `isSelected` property to true for the setting that is currently active. Then, when the user clicks a different option in the set, your code would set `isSelected` to true for that button and set it to false for the previously selected button. (This would give behavior like a radio button set.)


You can add dividers to separate groups of actions from other actions. This is displayed as a thin gray line. The divider object has one attribute:
```js
    {
       divider: true
    }
```

* **divider** - To show a divider in the toolbar, add an object with `divider` attribute set to true.

### Deprecated toolbar config

  The old toolbar configuration is still supported for now (but is deprecated). This allows the config to be provided as an array that defines just the left side of the toolbar. The right side will always show the zoom actions (zoomIn, zoomOut, zoomToFit) and a notifications panel icon (if a notification configuration object is provided in the CommonCanvas react object). These right side actions will always show on the right-hand side of the toolbar and are handled internally by the canvas. The entries in the array follow the same definition as described above. Note: there is no need to provide a `palette` action in the array because a palette icon and following divider will automatically be added to the toolbar when a palette is specified for the canvas.

An example of the toolbar config array should look like this:
```js
    const toolbarConfig = [
       { action: "stop", label: "Stop Execution", enable: false },
       { action: "run", label: "Run Pipeline", enable: false },
       { action: "undo", label: "Undo", enable: true },
       { action: "redo", label: "Redo", enable: true },
       { action: "cut", label: "Cut", enable: false },
       { action: "copy", label: "Copy", enable: false },
       { action: "paste", label: "Paste", enable: false },
       { action: "createAutoComment", label: "Add Comment", enable: true },
       { action: "deleteSelectedObjects", label: "Delete", enable: true },
       { action: "arrangeHorizontally", label: "Arrange Horizontally", enable: true }
    ];
```

### Advanced: JSX actions
Regular toolbar buttons, explained above, are displayed as set of Carbon `Button`s. If you _don't_ want your content wrappered in a button, you can provide your own JSX to display as an action in the toolbar. Be aware however that, because of the way the toolbar is designed, there are restrictions on what the toolbar can do to display your JSX. For example, it cannot display anything with a height greater than the toolbar height.

If you provide your own JSX object it is displayed in a simple `div` in the toolbar. Some attributes are applied to the `div` to allow the action to work correctly within the toolbar - these cannot be changed.  You are responsible for styling your JSX object to get it to appear the way you want.

Also be aware that, if the width of the toolbar reduces (maybe by the user sizing the page) your action may get moved into the overflow menu. It is also your responsibility to style the button so it appears as you want in the overflow menu as well as the toolbar.

The JSX can be provided in the `jsx` field. Here is an example. The only other fields that are recognized with the `jsx` field are `action` and `tooltip`, all other fields will be ignored.

```js
    {
       action: "custom-loading",
       jsx: (<div style={{ padding: "0 11px" }}><InlineLoading status="active" description="Loading..." /></div>),
       tooltip: "Loading the thing you wanted."
    }
```

* **action** - a unique identifier and the name of the action to be performed.

* **jsx** - A JSX object. This will be displayed as the action in the toolbar.

* **tooltip** - A string or JSX object. This will be displayed as the tooltip for the action in the toolbar. If `tooltip` is omitted no tooltip will be added to your action. If `tooltip` is specified the `jsx` will be inside a tooltip `div` which is in the toolbar `div` mentioned above.

Here's an example toolbar that includes some Carbon React components
```js
    toolbarConfig = {
        leftBar: [
            { action: "custom-loading",
              jsx: (
                <div style={{ padding: "0 11px" }}>
                  <InlineLoading status="active" description="Loading..." />
                 </div>
               )
             },
            { divider: true },
            { action: "custom-checkbox",
              jsx: (
                <div style={{ padding: "0 11px" }}>
                  <Checkbox id={"chk1"} defaultChecked labelText={"Check it out"} />
                </div>
              )
            },
            { divider: true },
            { action: "custom-button",
              tooltip: "A custom button of type primary!",
              jsx: (
                <div className="toolbar-custom-button">
                  <Button id={"btn1"} size="field" kind="primary">Custom button </Button>
                </div>
              )
            },
            { divider: true },
            { action: "custom-dropdown",
              tooltip: "A drop down using the overflow menu!",
              jsx: (
                <div className="toolbar-custom-button">
                  <OverflowMenu id={"ovf1"} renderIcon={TextScale32}>
                    <OverflowMenuItem itemText="Big" />
                    <OverflowMenuItem itemText="Medium" />
                    <OverflowMenuItem itemText="Little" />
                  </OverflowMenu>
                </div>) },
            { divider: true }
        ]
    };
```
