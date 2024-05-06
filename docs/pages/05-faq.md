# Frequently asked questions


## Common Canvas

### Questions about Nodes

??? question "With resizeable nodes (enableResizableNodes: true) why don't the shapes defined by bodyPath and selectionPath change when resizing a node?"

    The bodyPath and selectionPath ‘shapes’ do not automatically redraw when the user resizes the node. However, a function that returns a path can be provided for those fields instead of a string, so the application can return whatever shape it prefers as the resizing progresses. Obviously, these functions are called in real-time so they needs to return very quickly.

??? question "Can React objects specified in nodeExternalObject display supernodes and, if so, how is the sub-flow rendered?"

    Yes, ’nodeExternalObject` is supported for supernodes. The way it works is:

	* If the supernode is collapsed (that is, it looks like a regular node) then the React node is used in the same way as for a regular node
	* If the supernode it expanded in-place, then the React object is still used in the same way and the `<svg>` area that displays the sub-flow is displayed by Common Canvas over the top of the node body.
	* If the user is viewing the supernode ‘full-page’ then the sub-flow is rendered in the usual way since the parent supernode is not visible at that point.

	There is an example of this in the ‘React Nodes - Carbon Charts’ sample application in the test harness.

	<img src="../assets/faq-react-supernodes.png" width="700" />


??? question "When displaying React nodes using nodeExternalObject field, how can the application pass in its own props to the component?"

	The application can add whatever it wants to pass in as a field in either the nodeData object or the canvasController — making sure not to over write any of the existing fields that are there by default of course. So if you wanted to pass in your own data on a node-by-node basis you could set a field in the app_data field of each node. Something like:

	```js
		const nodeId = "123";

		const mydtaa = {
			field1: val1
			field2: val2
		}

		canvasController.setNodeProperties(
			nodeId,
			{ app_data: mydata }
		);
	```

	Then in the React object just reference the fields like:
	```js
		const f1 = this.props.nodeData.app_data.field1;
	```



### Questions about Comments


??? question "With markdown enabled in comments, why isn't the whitespace preserved when the user leaves edit mode?"

    That’s the way markdown works. It removes white space in the entered text. For example, if you enter similar text into  a comment in a GitHub issue and look at the preview you’ll see the whitespace is removed.

	Common Canvas is using a third party library to convert what the user enters to the HTML that is displayed so the removal of whitespace is not under its control.

    However, Comments support the ability to enter HTML directly into the markdown text. HTML can be used to preserve whitespace and do many other styling and customizations to the text.

??? question "Are there any plans to support different fonts in comments?"

	In Elyra Canvas v13.0.0, there is now a feature that allows the user to enter HTML in to the markdown text. This allows fonts and many other customizations of the text — although the user does need to know what they are doing with HTML.

