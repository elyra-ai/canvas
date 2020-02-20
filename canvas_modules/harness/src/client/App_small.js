/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint no-console: ["error", { allow: ["log", "info", "warn", "error", "time", "timeEnd"] }] */

import React from "react";
import { IntlProvider } from "react-intl";
import { CommonCanvas, CanvasController } from "common-canvas";
import AllTypesCanvas from "../../test_resources/diagrams/allTypesCanvas.json";
import ModelerPalette from "../../test_resources/palettes/modelerPalette.json";
// import BlankCanvasImage from "../../assets/images/blank_canvas.svg";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(AllTypesCanvas);
		this.canvasController.setPipelineFlowPalette(ModelerPalette);
	}

	contextMenuHandler(data, defaultMenu) {
		console.log("contextMenuHandler");
		return defaultMenu;
	}

	editActionHandler(data) {
		console.log("editActionHandler");
	}

	clickActionHandler(data) {
		console.log("clickActionHandler");
	}

	decorationActionHandler(node, id, pipelineId) {
		console.log("decorationActionHandler");
	}

	selectionChangeHandler(data) {
		console.log("selectionChangeHandler");
	}

	layoutHandler(data) {
		console.log("layoutHandler");
	}

	tipHandler(tipType, data) {
		console.log("tipHandler");
	}

	idGenerationHandler(action, data) {
		console.log("idGenerationHandler");
	}

	render() {
		// Uncomment the code below to experiement with passing in a custom div
		// to specify the 'empty canvas flow' content. Provide it in the
		// emptyCanvasContent in the canvas config object below.
		// const emptyCanvasDiv = (
		// 	<div>
		// 		<img src={BlankCanvasImage} className="harness-empty-image" />
		// 		<span className="harness-empty-text">
		// 			Welcome to the Common Canvas test harness.<br />Your flow is empty!</span>
		// 		<span className="harness-empty-link"
		// 			onClick={this.handleEmptyCanvasLinkClick}
		// 		>Click here to take a tour</span>
		// 	</div>);

		// Uncomment the code below to experiement with passing in a custom div
		// to specify the 'drop zone' content. Provide it in the dropZoneCanvasContent
		// in the canvas config object below.
		// const dropZoneCanvasDiv = (
		// 	<div>
		// 		<div className="dropzone-canvas" />
		// 		<div className="dropzone-canvas-rect" />
		// 		<span className="dropzone-canvas-text">Drop a data object here<br />to add to canvas.</span>
		// 	</div>);


		// Uncomment the values in the config object below as desired.
		const commonCanvasConfig = {
			// enableNarrowPalette: true,
			// enableInteractionType: "Mouse",
			// enableSnapToGridType: "None",
			// enableSnapToGridX: null,
			// enableSnapToGridY: null,
			// enableAutoLayoutVerticalSpacing: 50,
			// enableAutoLayoutHorizontalSpacing: 50,
			// enableConnectionType: "Ports",
			// enableNodeFormatType: "Horizontal",
			// enableLinkType: "Curve",
			// enableNodeLayout: null,
			// enableInternalObjectModel: true,
			// enablePaletteLayout: "Flyout",
			// emptyCanvasContent: emptyCanvasDiv,
			// enableMoveNodesOnSupernodeResize: true,
			// tipConfig: {
			// 	"palette": true,
			// 	"nodes": true,
			// 	"ports": true,
			// 	"links": true
			// },
			// schemaValidation: false,
			// enableDisplayFullLabelOnHover: false,
			// enableBoundingRectangles: false,
			// enableDropZoneOnExternalDrag: false,
			// dropZoneCanvasContent: dropZoneCanvasDiv,
			// enableSaveZoom: "LocalStorage",
			// enableZoomIntoSubFlows: true
		};

		const toolbarConfig = [
			{ action: "palette", label: "Palette", enable: true },
			// { divider: true },
			// { action: "stop", label: "Stop Execution", enable: false },
			// { action: "run", label: "Run Pipeline", enable: true },
			// { divider: true },
			{ action: "undo", label: "Undo", enable: true },
			{ action: "redo", label: "Redo", enable: true },
			{ action: "cut", label: "Cut", enable: true },
			{ action: "copy", label: "Copy", enable: true },
			{ action: "paste", label: "Paste", enable: true },
			{ action: "createAutoComment", label: "Add Comment", enable: true },
			{ action: "deleteSelectedObjects", label: "Delete", enable: true },
			{ action: "arrangeHorizontally", label: "Arrange Horizontally", enable: true }
			// { action: "arrangeVertically", label: "Arrange Vertically", enable: true }
		];

		const notificationConfig = {
			action: "notification",
			label: "Notifications",
			enable: true,
			notificationHeader: "Notifications"
		};

		const contextMenuConfig = {
			enableCreateSupernodeNonContiguous: false,
			defaultMenuEntries: {
				saveToPalette: false
			}
		};

		const keyboardConfig = {
			actions: {
				delete: true,
				cutToClipboard: true,
				copyToClipboard: true,
				pasteFromClipboard: true
			}
		};

		const commonCanvas = (
			<IntlProvider>
				<CommonCanvas
					canvasController={this.canvasController}

					config={commonCanvasConfig}
					toolbarConfig={toolbarConfig}
					notificationConfig={notificationConfig}
					contextMenuConfig={contextMenuConfig}
					keyboardConfig={keyboardConfig}

					contextMenuHandler={this.contextMenuHandler}
					editActionHandler= {this.editActionHandler}
					clickActionHandler= {this.clickActionHandler}
					decorationActionHandler= {this.decorationActionHandler}
					selectionChangeHandler={this.selectionChangeHandler}
					layoutHandler={this.layoutHandler}
					tipHandler={this.tipHandler}
					idGenerationHandler={this.idGenerationHandler}
				/>
			</IntlProvider>);

		return (
			<div id="harness-app-container">
				{commonCanvas}
			</div>
		);
	}
}

export default App;
