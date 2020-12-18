/*
 * Copyright 2017-2020 Elyra Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint complexity: ["error", 27] */
/* eslint max-len: ["error", 200] */
/* eslint max-depth: ["error", 5] */
/* eslint no-alert: "off" */

import React from "react";
import Isvg from "react-inlinesvg";
import ReactTooltip from "react-tooltip";
import ReactFileDownload from "react-file-download";
import { FormattedMessage, IntlProvider } from "react-intl";
import { isEmpty, has, forIn } from "lodash";
import { hot } from "react-hot-loader/root";

import { getMessages } from "../intl/intl-utils";
import * as HarnessBundles from "../intl/locales";
import CommandActionsBundles from "@elyra/canvas/locales/command-actions/locales";
import CommonCanvasBundles from "@elyra/canvas/locales/common-canvas/locales";
import CommonPropsBundles from "@elyra/canvas/locales/common-properties/locales";
import PaletteBundles from "@elyra/canvas/locales/palette/locales";
import ToolbarBundles from "@elyra/canvas/locales/toolbar/locales";

import { CommonCanvas, CanvasController, CommonProperties } from "common-canvas";
import CommonCanvasPackage from "@elyra/canvas/package.json";

import FlowsCanvas from "./components/custom-canvases/flows/flows-canvas";
import TablesCanvas from "./components/custom-canvases/tables/tables-canvas";
import DetachedCanvas from "./components/custom-canvases/detached-links/detached-canvas";
import ExplainCanvas from "./components/custom-canvases/explain/explain-canvas";
import Explain2Canvas from "./components/custom-canvases/explain2/explain2-canvas";
import StreamsCanvas from "./components/custom-canvases/streams/streams-canvas";
import BlueEllipsesCanvas from "./components/custom-canvases/blue-ellipses/blue-ellipses-canvas";

import Breadcrumbs from "./components/breadcrumbs.jsx";
import Console from "./components/console.jsx";
import SidePanel from "./components/sidepanel.jsx";

import CustomSliderPanel from "./components/custom-panels/CustomSliderPanel";
import CustomTogglePanel from "./components/custom-panels/CustomTogglePanel";
import CustomButtonPanel from "./components/custom-panels/CustomButtonPanel";
import CustomDatasetsPanel from "./components/custom-panels/CustomDatasetsPanel";
import EMMeansPanel from "./components/custom-panels/EMMeansPanel";
import CustomToggleControl from "./components/custom-controls/CustomToggleControl";
import CustomTableControl from "./components/custom-controls/CustomTableControl";
import CustomEmmeansDroplist from "./components/custom-controls/CustomEmmeansDroplist";
import FixedEffectsPanel from "./components/custom-panels/FixedEffectsPanel";
import RandomEffectsPanel from "./components/custom-panels/RandomEffectsPanel";
import AddtlCmptsTest from "./components/custom-components/AddtlCmptsTest";
import CustomSubjectsPanel from "./components/custom-panels/CustomSubjectsPanel";

import * as CustomOpMax from "./custom/condition-ops/customMax";
import * as CustomOpSyntaxCheck from "./custom/condition-ops/customSyntaxCheck";

import BlankCanvasImage from "../../assets/images/blank_canvas.svg";

import { Edit32, Play32, StopFilledAlt32 } from "@carbon/icons-react";

import { InlineLoading, Checkbox, Button } from "carbon-components-react";

import {
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_MODAL,
	SIDE_PANEL_API,
	SIDE_PANEL,
	CHOOSE_FROM_LOCATION,
	INTERACTION_MOUSE,
	PORTS_CONNECTION,
	VERTICAL_FORMAT,
	NONE_SAVE_ZOOM,
	CURVE_LINKS,
	DIRECTION_LEFT_RIGHT,
	LINK_SELECTION_NONE,
	ASSOC_STRAIGHT,
	UNDERLAY_NONE,
	EXAMPLE_APP_NONE,
	EXAMPLE_APP_FLOWS,
	EXAMPLE_APP_BLUE_ELLIPSES,
	EXAMPLE_APP_DETACHED,
	EXAMPLE_APP_EXPLAIN,
	EXAMPLE_APP_EXPLAIN2,
	EXAMPLE_APP_STREAMS,
	EXAMPLE_APP_TABLES,
	CUSTOM,
	PALETTE_FLYOUT,
	PROPERTIES_FLYOUT,
	NONE_DRAG,
	INPUT_PORT,
	OUTPUT_PORT,
	NOTIFICATION_MESSAGE_TYPE,
	FORMS,
	PARAMETER_DEFS,
	PRIMARY,
	TOOLBAR_LAYOUT_TOP,
	TOOLBAR_TYPE_DEFAULT,
	TOOLBAR_TYPE_SINGLE_BAR,
	TOOLBAR_TYPE_BEFORE_AFTER,
	TOOLBAR_TYPE_CUSTOM_RIGHT_SIDE,
	TOOLBAR_TYPE_CARBON_BUTTONS,
	TOOLBAR_TYPE_CUSTOM_ACTIONS
} from "./constants/constants.js";

import listview32 from "../graphics/list-view_32.svg";
import download32 from "../graphics/save_32.svg";
import justify32 from "../graphics/justify_32.svg";
import api32 from "../graphics/api_32.svg";
import template32 from "ibm-design-icons/dist/svg/object-based/template_32.svg";
import FormsService from "./services/FormsService";

import ExpressionInfo from "./constants/json/functionlist.json";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			breadcrumbsDef: [],
			consoleout: [],
			consoleOpened: false,
			contextMenuInfo: {},
			openSidepanelCanvas: false,
			openSidepanelModal: false,
			openSidepanelAPI: false,

			// Common canvas state variables
			paletteOpened: false,
			showPropertiesDialog: false,
			showPropertiesDialog2: false,
			canvasFileChooserVisible: false,
			canvasFileChooserVisible2: false,
			paletteFileChooserVisible: false,
			paletteFileChooserVisible2: false,
			canvasDiagram: "",
			canvasDiagram2: "",
			selectedCanvasDropdownFile: "",
			selectedCanvasDropdownFile2: "",
			selectedPaletteDropdownFile: "",
			selectedPaletteDropdownFile2: "",
			canvasPalette: "",
			canvasPalette2: "",
			selectedInternalObjectModel: true,
			selectedDragWithoutSelect: false,
			selectedAssocLinkCreation: false,
			selectedSnapToGridType: NONE_DRAG,
			enteredSnapToGridX: "",
			enteredSnapToGridY: "",
			selectedInteractionType: INTERACTION_MOUSE,
			selectedConnectionType: PORTS_CONNECTION,
			selectedNodeFormat: VERTICAL_FORMAT,
			selectedToolbarLayout: TOOLBAR_LAYOUT_TOP,
			selectedToolbarType: TOOLBAR_TYPE_DEFAULT,
			selectedSaveZoom: NONE_SAVE_ZOOM,
			selectedZoomIntoSubFlows: false,
			selectedLinkType: CURVE_LINKS,
			selectedLinkDirection: DIRECTION_LEFT_RIGHT,
			selectedLinkSelection: LINK_SELECTION_NONE,
			selectedAssocLinkType: ASSOC_STRAIGHT,
			selectedCanvasUnderlay: UNDERLAY_NONE,
			selectedExampleApp: EXAMPLE_APP_NONE,
			selectedPaletteLayout: PALETTE_FLYOUT,
			selectedTipConfig: {
				"palette": true,
				"nodes": true,
				"ports": true,
				"links": true
			},
			selectedRightFlyoutUnderToolbar: false,
			selectedPanIntoViewOnOpen: false,
			selectedExtraCanvasDisplayed: false,
			selectedSaveToPalette: false,
			selectedDropZoneOnExternalDrag: false,
			selectedDisplayCustomizedDropZoneContent: false,
			selectedDisplayCustomizedEmptyCanvasContent: true,
			selectedInsertNodeDroppedOnLink: false,
			selectedHightlightNodeOnNewLinkDrag: false,
			selectedCreateSupernodeNonContiguous: false,
			selectedMoveNodesOnSupernodeResize: true,
			selectedDisplayFullLabelOnHover: false,
			selectedPositionNodeOnRightFlyoutOpen: false,
			selectedNarrowPalette: true,
			selectedSchemaValidation: true,
			selectedBoundingRectangles: false,
			selectedNodeLayout: null,
			selectedCanvasLayout: null,

			// Common properties state variables
			propertiesInfo: {},
			propertiesInfo2: {},
			propertiesJson: null,
			selectedPanel: null,
			propertiesContainerType: PROPERTIES_FLYOUT,
			displayAdditionalComponents: false,
			applyOnBlur: true,
			expressionBuilder: true,
			expressionValidate: true,
			heading: false,

			apiSelectedOperation: "",
			selectedPropertiesDropdownFile: "",
			selectedPropertiesFileCategory: "",
			propertiesFileChooserVisible: false,

			notificationConfig: {
				action: "notification",
				label: "Notifications",
				notificationHeader: "Notification Center",
				notificationSubtitle: "subtitle",
				enable: true,
				emptyMessage: "You don't have any notifications right now.",
				clearAllMessage: "Clear all",
				keepOpen: true
			},
			notificationConfig2: {
				action: "notification",
				label: "Notifications",
				notificationHeader: "Notification Center Canvas 2",
				notificationSubtitle: "subtitle",
				enable: true,
				emptyMessage: "You don't have any notifications right now.",
				clearAllMessage: "Clear all",
				keepOpen: true
			}
		};

		// There are several functions and variables with the identifiers name and name2. This is needed
		// to support two canvases displayed in the test harness simultaneously.
		this.currentEditorId = null;
		this.currentEditorId2 = null;

		this.consoleout = [];
		this.availableForms = [];
		this.availableParamDefs = [];

		this.openConsole = this.openConsole.bind(this);
		this.log = this.log.bind(this);
		this.download = this.download.bind(this);
		this.setDiagramJSON = this.setDiagramJSON.bind(this);
		this.setPaletteJSON = this.setPaletteJSON.bind(this);
		this.setDiagramJSON2 = this.setDiagramJSON2.bind(this);
		this.setPaletteJSON2 = this.setPaletteJSON2.bind(this);
		this.setPropertiesJSON = this.setPropertiesJSON.bind(this);
		this.setFlowNotificationMessages = this.setFlowNotificationMessages.bind(this);
		this.setFlowNotificationMessages2 = this.setFlowNotificationMessages2.bind(this);
		this.setNotificationMessages = this.setNotificationMessages.bind(this);
		this.setNotificationMessages2 = this.setNotificationMessages2.bind(this);
		this.appendNotificationMessages = this.appendNotificationMessages.bind(this);
		this.clearNotificationMessages = this.clearNotificationMessages.bind(this);
		this.setCanvasConfig = this.setCanvasConfig.bind(this);

		this.setBreadcrumbsDefinition = this.setBreadcrumbsDefinition.bind(this);
		this.sidePanelCanvas = this.sidePanelCanvas.bind(this);
		this.sidePanelModal = this.sidePanelModal.bind(this);
		this.sidePanelAPI = this.sidePanelAPI.bind(this);
		this.closeSidePanelModal = this.closeSidePanelModal.bind(this);
		this.setCanvasDropdownFile = this.setCanvasDropdownFile.bind(this);
		this.setCanvasDropdownFile2 = this.setCanvasDropdownFile2.bind(this);
		this.setPaletteDropdownSelect = this.setPaletteDropdownSelect.bind(this);
		this.setPaletteDropdownSelect2 = this.setPaletteDropdownSelect2.bind(this);

		this.setStateValue = this.setStateValue.bind(this);
		this.getStateValue = this.getStateValue.bind(this);
		this.useApplyOnBlur = this.useApplyOnBlur.bind(this);
		this.useExpressionBuilder = this.useExpressionBuilder.bind(this);
		this.useExpressionValidate = this.useExpressionValidate.bind(this);
		this.useDisplayAdditionalComponents = this.useDisplayAdditionalComponents.bind(this);
		this.useHeading = this.useHeading.bind(this);

		this.clearSavedZoomValues = this.clearSavedZoomValues.bind(this);
		this.usePropertiesContainerType = this.usePropertiesContainerType.bind(this);
		this.getPipelineFlow = this.getPipelineFlow.bind(this);
		this.setPipelineFlow = this.setPipelineFlow.bind(this);
		this.addNodeTypeToPalette = this.addNodeTypeToPalette.bind(this);
		this.getCanvasInfo = this.getCanvasInfo.bind(this);
		this.setNodeLabel = this.setNodeLabel.bind(this);
		this.setPortLabel = this.setPortLabel.bind(this);
		this.setNodeDecorations = this.setNodeDecorations.bind(this);
		this.setLinkDecorations = this.setLinkDecorations.bind(this);
		this.getZoomToReveal = this.getZoomToReveal.bind(this);
		this.zoomCanvas = this.zoomCanvas.bind(this);
		this.getPropertyDefName = this.getPropertyDefName.bind(this);

		// common-canvas
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
		this.beforeEditActionHandler = this.beforeEditActionHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.extraCanvasEditActionHandler = this.extraCanvasEditActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.extraCanvasClickActionHandler = this.extraCanvasClickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.selectionChangeHandler = this.selectionChangeHandler.bind(this);
		this.selectionChangeHandler2 = this.selectionChangeHandler2.bind(this);
		this.tipHandler = this.tipHandler.bind(this);

		this.getNodeForm = this.getNodeForm.bind(this);
		this.refreshContent = this.refreshContent.bind(this);

		// common-properties
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.closePropertiesEditorDialog = this.closePropertiesEditorDialog.bind(this);
		this.closePropertiesEditorDialog2 = this.closePropertiesEditorDialog2.bind(this);
		this.setPropertiesDropdownSelect = this.setPropertiesDropdownSelect.bind(this);
		this.validateProperties = this.validateProperties.bind(this);
		// properties callbacks
		this.applyPropertyChanges = this.applyPropertyChanges.bind(this);
		this.buttonHandler = this.buttonHandler.bind(this);
		this.propertyListener = this.propertyListener.bind(this);
		this.propertyActionHandler = this.propertyActionHandler.bind(this);
		this.propertiesControllerHandler = this.propertiesControllerHandler.bind(this);
		this.propertiesControllerHandler2 = this.propertiesControllerHandler2.bind(this);

		this.helpClickHandler = this.helpClickHandler.bind(this);

		this.setApiSelectedOperation = this.setApiSelectedOperation.bind(this);

		this.harnessNotificationMessages = [];
		this.flowNotificationMessages = [];

		try {
			this.canvasController = new CanvasController();
			this.canvasController2 = new CanvasController();
		} catch (err) {
			console.error("Error setting up canvas controllers: " + err);
		}

		// Add these methods to the global document object so they can be called
		// from the Chimp test cases.
		document.setCanvasConfig = this.setCanvasConfig;
		document.canvasController = this.canvasController;
		document.canvasController2 = this.canvasController2;
		document.setCanvasDropdownFile = this.setCanvasDropdownFile;
		document.setCanvasDropdownFile2 = this.setCanvasDropdownFile2;
		document.setPaletteDropdownSelect = this.setPaletteDropdownSelect;
		document.setPaletteDropdownSelect2 = this.setPaletteDropdownSelect2;
		document.setPropertiesDropdownSelect = this.setPropertiesDropdownSelect;
		this.locale = "en";
		this.initLocale();
	}

	componentDidMount() {
		this.setBreadcrumbsDefinition(this.canvasController.getPrimaryPipelineId());
		const that = this;
		FormsService.getFiles(FORMS)
			.then(function(res) {
				that.availableForms = res;
			});
		FormsService.getFiles(PARAMETER_DEFS)
			.then(function(res) {
				that.availableParamDefs = res;
			});
	}

	// Sets the state to the config passed in. This is called by the Cypress
	// testcases to set the test harness state in one go.
	setCanvasConfig(config) {
		this.setState(config);
	}

	setCanvasDropdownFile(selectedCanvasDropdownFile) {
		if (selectedCanvasDropdownFile === CHOOSE_FROM_LOCATION) {
			this.setState({
				canvasFileChooserVisible: true,
				selectedCanvasDropdownFile: CHOOSE_FROM_LOCATION
			});
		} else {
			var that = this;
			this.setState({
				selectedCanvasDropdownFile: selectedCanvasDropdownFile,
				canvasDiagram: "",
				canvasFileChooserVisible: false
			}, function() {
				that.log("Submit canvas diagram", that.state.selectedCanvasDropdownFile);
				FormsService.getFileContent("diagrams", that.state.selectedCanvasDropdownFile)
					.then(function(res) {
						that.setDiagramJSON(res);
					});
			});
		}
	}

	setCanvasDropdownFile2(selectedCanvasDropdownFile2) {
		if (selectedCanvasDropdownFile2 === CHOOSE_FROM_LOCATION) {
			this.setState({
				canvasFileChooserVisible2: true,
				selectedCanvasDropdownFile2: CHOOSE_FROM_LOCATION
			});
		} else {
			var that = this;
			this.setState({
				selectedCanvasDropdownFile2: selectedCanvasDropdownFile2,
				canvasDiagram2: "",
				canvasFileChooserVisible2: false
			}, function() {
				that.log("Submit canvas diagram", that.state.selectedCanvasDropdownFile2);
				FormsService.getFileContent("diagrams", that.state.selectedCanvasDropdownFile2)
					.then(function(res) {
						that.setDiagramJSON2(res);
					});
			});
		}
	}

	setPaletteDropdownSelect(selectedPaletteDropdownFile) {
		if (selectedPaletteDropdownFile === CHOOSE_FROM_LOCATION) {
			this.setState({
				paletteFileChooserVisible: true,
				selectedPaletteDropdownFile: CHOOSE_FROM_LOCATION
			});
		} else {
			var that = this;
			this.setState({
				selectedPaletteDropdownFile: selectedPaletteDropdownFile,
				canvasPalette: "",
				paletteFileChooserVisible: false
			}, function() {
				that.log("Submit canvas palette", that.state.selectedPaletteDropdownFile);
				FormsService.getFileContent("palettes", that.state.selectedPaletteDropdownFile)
					.then(function(res) {
						that.setPaletteJSON(res);
					});
			});
		}
	}

	setPaletteDropdownSelect2(selectedPaletteDropdownFile2) {
		if (selectedPaletteDropdownFile2 === CHOOSE_FROM_LOCATION) {
			this.setState({
				paletteFileChooserVisible2: true,
				selectedPaletteDropdownFile2: CHOOSE_FROM_LOCATION
			});
		} else {
			var that = this;
			this.setState({
				selectedPaletteDropdownFile2: selectedPaletteDropdownFile2,
				canvasPalette2: "",
				paletteFileChooserVisible2: false
			}, function() {
				that.log("Submit canvas palette", that.state.selectedPaletteDropdownFile2);
				FormsService.getFileContent("palettes", that.state.selectedPaletteDropdownFile2)
					.then(function(res) {
						that.setPaletteJSON2(res);
					});
			});
		}
	}

	setPropertiesDropdownSelect(selectedPropertiesDropdownFile, selectedPropertiesFileCategory) {
		// close any existing properties before opening a new properties file
		this.closePropertiesEditorDialog();

		if (selectedPropertiesDropdownFile === CHOOSE_FROM_LOCATION) {
			this.setState({
				propertiesFileChooserVisible: true,
				selectedPropertiesDropdownFile: CHOOSE_FROM_LOCATION
			});
		} else {
			const that = this;
			this.setState({
				selectedPropertiesDropdownFile: selectedPropertiesDropdownFile,
				selectedPropertiesFileCategory: selectedPropertiesFileCategory,
				propertiesFileChooserVisible: false
			}, function() {
				that.log("Submit common properties file", that.state.selectedPropertiesDropdownFile);
				if (selectedPropertiesFileCategory === PARAMETER_DEFS) {
					FormsService.getFileContent(PARAMETER_DEFS, that.state.selectedPropertiesDropdownFile)
						.then(function(res) {
							that.setPropertiesJSON(res);
						});
				} else {
					FormsService.getFileContent(FORMS, that.state.selectedPropertiesDropdownFile)
						.then(function(res) {
							that.setPropertiesJSON(res);
						});
				}
				that.closeSidePanelModal();
			});
		}
	}
	getLabel(labelId, defaultLabel) {
		return (<FormattedMessage id={ labelId } defaultMessage={ defaultLabel } />);
	}

	getPropertyDefName(node) {
		if (node.op) {
			let foundName = this.availableForms.find((name) => name.startsWith(node.op));
			if (foundName) {
				return {
					fileName: foundName,
					type: FORMS
				};
			}
			foundName = this.availableParamDefs.find((name) => name.startsWith(node.op));
			if (foundName) {
				return {
					fileName: foundName,
					type: PARAMETER_DEFS
				};
			}
		}
		return {
			fileName: "default.json",
			type: FORMS
		};
	}

	getNodeForm(nodeId, pipelineId, canvasController, callback) {
		// set current parameterSet
		// get the current parameters for the node from the internal ObjectModel
		const node = canvasController.getNode(nodeId, pipelineId);
		const propertyDef = this.getPropertyDefName(node);
		FormsService.getFileContent(propertyDef.type, propertyDef.fileName)
			.then(function(res) {
				const response = res;
				if (node) {
					if (response.formData) {
						if (!isEmpty(node.parameters)) {
							response.formData.data.currentParameters = node.parameters;
						}
						if (!isEmpty(node.uiParameters)) {
							response.formData.data.uiCurrentParameters = node.uiParameters;
						}
						response.formData.label = node.label;
					} else {
						if (!isEmpty(node.parameters)) {
							response.current_parameters = node.parameters;
						}
						if (!isEmpty(node.uiParameters)) {
							response.current_ui_parameters = node.uiParameters;
						}
						if (!response.titleDefinition) {
							response.titleDefinition = {};
						}
						response.titleDefinition.title = node.label;
					}
				}
				callback(response);
			});
	}

	setDiagramJSON(canvasJson) {
		this.canvasController.getCommandStack().clearCommandStack();
		if (canvasJson) {
			this.canvasController.setPipelineFlow(canvasJson);
			this.setFlowNotificationMessages();
			this.setBreadcrumbsDefinition(this.canvasController.getPrimaryPipelineId());
			this.log("Canvas diagram set");
		} else {
			this.log("Canvas diagram cleared");
		}
	}

	setDiagramJSON2(canvasJson) {
		this.canvasController2.getCommandStack().clearCommandStack();
		if (canvasJson) {
			this.canvasController2.setPipelineFlow(canvasJson);
			this.setFlowNotificationMessages2();
			this.log("Canvas diagram set 2");
		} else {
			this.log("Canvas diagram cleared 2");
		}
	}

	setFlowNotificationMessages() {
		let flowErrorMessages = [];
		let flowWarningMessages = [];

		// Generate notification messages for all the nodes within the current pipeline.
		const currentPipelineId = this.canvasController.getCurrentBreadcrumb().pipelineId;
		const nodeMessages = this.canvasController.getFlowMessages(currentPipelineId);
		const nodeNotificationMessages = this.generateNodeNotificationMessages(nodeMessages, currentPipelineId);

		const nodeErrorMessages = nodeNotificationMessages.errorMessages;
		const nodeWarningMessages = nodeNotificationMessages.warningMessages;

		const currentFlowSupernodes = this.canvasController.getSupernodes(currentPipelineId);
		currentFlowSupernodes.forEach((supernode) => {
			const supernodeSubflowMessages = this.generateFlowNotificationMessages(supernode.subflow_ref.pipeline_id_ref, supernode.label, currentPipelineId);
			flowErrorMessages = flowErrorMessages.concat(supernodeSubflowMessages.errorMessages);
			flowWarningMessages = flowWarningMessages.concat(supernodeSubflowMessages.warningMessages);
		});

		// Generate notification messages for all the pipelines within the pipeline flow.
		const primaryPipelineId = this.canvasController.getPrimaryPipelineId();
		const flowNotificationMessages = this.generateFlowNotificationMessages(primaryPipelineId, "Primary", currentPipelineId);

		flowErrorMessages = flowErrorMessages.concat(flowNotificationMessages.errorMessages);
		flowWarningMessages = flowWarningMessages.concat(flowNotificationMessages.warningMessages);

		const notificationMessages = nodeErrorMessages.concat(flowErrorMessages)
			.concat(nodeWarningMessages)
			.concat(flowWarningMessages);

		this.flowNotificationMessages = notificationMessages;
		this.setNotificationMessages(this.flowNotificationMessages.concat(this.harnessNotificationMessages));
	}

	setNotificationMessages(messages) {
		this.canvasController.setNotificationMessages(messages);
		this.log("Set Notification Message", "Set " + messages.length + " notification messages");
	}

	setFlowNotificationMessages2(pipelineId) {
		const notificationMessages = [];
		const nodeMessages = this.canvasController2.getFlowMessages(pipelineId);
		for (const nodeId in nodeMessages) {
			if (has(nodeMessages, nodeId)) {
				const node = nodeMessages[nodeId];
				const errors = node.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.ERROR;
				});

				const warnings = node.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.WARNING;
				});

				const type = errors.length > 0 ? NOTIFICATION_MESSAGE_TYPE.ERROR : NOTIFICATION_MESSAGE_TYPE.WARNING;
				let generatedMessage = this.canvasController2.getNode(nodeId, pipelineId).label + " node has ";
				if (errors.length > 0) {
					generatedMessage += errors.length + " errors";
					if (warnings.length > 0) {
						generatedMessage += " and ";
					}
				}
				if (warnings.length > 0) {
					generatedMessage += warnings.length + " warnings";
				}

				const summarizedMessage = {
					id: "notification-" + nodeId,
					title: this.canvasController2.getNode(nodeId, pipelineId).label,
					type: type,
					content: generatedMessage,
					callback: this.nodeNotificationMessageCallback.bind(this, nodeId, pipelineId, true)
				};

				notificationMessages.push(summarizedMessage);
			}
		}
		this.setNotificationMessages2(notificationMessages);
	}

	setNotificationMessages2(messages) {
		this.canvasController2.setNotificationMessages(messages);
		this.log("Set Notification Message", "Canvas2 Set " + messages.length + " notification messages");
	}

	setBreadcrumbsDefinition(currentPipelineId) {
		const breadcrumbs = this.canvasController.getAncestorPipelineIds(currentPipelineId);
		breadcrumbs[0].label = PRIMARY;
		this.setState({ breadcrumbsDef: breadcrumbs });
	}

	setPaletteJSON(paletteJson) {
		this.canvasController.setPipelineFlowPalette(paletteJson);
		this.log("Palette set");
	}

	setPaletteJSON2(paletteJson) {
		this.canvasController2.setPipelineFlowPalette(paletteJson);
		this.log("Palette set 2");
	}

	setPropertiesJSON(propertiesJson) {
		this.setState({ propertiesJson: propertiesJson });
		this.openPropertiesEditorDialog();
		this.log("Properties set");
	}

	// Called by canvas sidepanel to set state variables
	setStateValue(field, value) {
		const data = {};
		data[field] = value;
		this.setState(data);
		this.log(field + " = " + value);
	}

	// Called by canvas sidepanel to get state variables
	getStateValue(field) {
		return this.state[field];
	}

	setPipelineFlow(flow) {
		this.canvasController.setPipelineFlow(flow);
		this.log("Updated pipeline flow");
	}

	setApiSelectedOperation(operation) {
		this.setState({ apiSelectedOperation: operation });
		this.log("API Operation Selected");
	}

	getPipelineFlow(canvController) {
		const canvasController = canvController ? canvController : this.canvasController;
		try {
			return canvasController.getPipelineFlow();
		} catch (err) {
			this.log("Schema validation error: " + err);
			return "Schema validation error";
		}
	}

	getCanvasInfo() {
		return this.canvasController.getObjectModel().getCanvasInfoPipeline();
	}

	setNodeLabel(nodeId, newLabel) {
		this.canvasController.setNodeLabel(nodeId, newLabel);
		this.log("Set new node label", { nodeId: nodeId, nodeLabel: newLabel });
	}

	setPortLabel(nodeId, portId, newLabel, portType) {
		if (portType === INPUT_PORT) {
			this.canvasController.setInputPortLabel(nodeId, portId, newLabel);
		} else if (portType === OUTPUT_PORT) {
			this.canvasController.setOutputPortLabel(nodeId, portId, newLabel);
		}
		this.log("Set new port label", { nodeId: nodeId, portLabel: newLabel, portType: portType });
	}

	setNodeDecorations(nodeId, newDecorations) {
		let newDecs = JSON.parse(newDecorations);
		if (isEmpty(newDecs)) {
			newDecs = null;
		}
		this.canvasController.setNodeDecorations(nodeId, newDecs);
		this.log("Set new node decorations", { nodeId: nodeId, newDecorations: newDecs });
	}

	setLinkDecorations(linkId, newDecorations) {
		let newDecs = JSON.parse(newDecorations);
		if (isEmpty(newDecs)) {
			newDecs = null;
		}
		this.canvasController.setLinkDecorations(linkId, newDecs);
		this.log("Set new link decorations", { linkId: linkId, newDecorations: newDecs });
	}

	getZoomToReveal(nodeId, xOffset, yOffset) {
		this.log("Zoom object requested");
		return this.canvasController.getZoomToReveal([nodeId], xOffset, yOffset); // Need to pass node Id in an array
	}

	initLocale() {
		const languages = { "en": "en", "eo": "eo" };
		// Get locale from browser
		const browserLocale = navigator.language.toLowerCase();
		const browserLocaleWithoutRegionCode = browserLocale.split(/[-_]/)[0];

		if (browserLocale in languages) {
			this.locale = languages[browserLocale];
		} else if (browserLocaleWithoutRegionCode in languages) {
			this.locale = languages[browserLocaleWithoutRegionCode];
		}
	}

	zoomCanvas(zoomObject, nodeId) {
		const pipelineId = this.canvasController.getPrimaryPipelineId();
		const stylePipelineObj = {};
		stylePipelineObj[pipelineId] = [nodeId];
		const styleSpec = { body: { default: "fill: coral; stroke: red;", hover: "fill: cornflowerblue; stroke: blue;" } };
		this.canvasController.removeAllStyles(true);
		this.canvasController.setObjectsStyle(stylePipelineObj, styleSpec, true);
		this.canvasController.zoomTo(zoomObject);
		this.log("Zoomed canvas");
	}

	clearSavedZoomValues() {
		this.canvasController.clearSavedZoomValues();
		this.canvasController2.clearSavedZoomValues();
	}

	generateNodeNotificationMessages(nodeMessages, currentPipelineId) {
		const nodeErrorMessages = [];
		const nodeWarningMessages = [];

		for (const nodeId in nodeMessages) {
			if (has(nodeMessages, nodeId)) {
				const nodeMessage = nodeMessages[nodeId];
				const errors = nodeMessage.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.ERROR;
				});

				const warnings = nodeMessage.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.WARNING;
				});

				const node = this.canvasController.getNode(nodeId, currentPipelineId);
				let generatedMessage = node.label + " node has ";
				if (errors.length > 0) {
					generatedMessage += errors.length + " errors";
					if (warnings.length > 0) {
						generatedMessage += " and ";
					}
				}
				if (warnings.length > 0) {
					generatedMessage += warnings.length + " warnings";
				}

				const type = errors.length > 0 ? NOTIFICATION_MESSAGE_TYPE.ERROR : NOTIFICATION_MESSAGE_TYPE.WARNING;
				const summarizedMessage = {
					id: "notification-" + nodeId,
					title: node.label,
					type: type,
					content: generatedMessage,
					callback: this.nodeNotificationMessageCallback.bind(this, nodeId, currentPipelineId, false)
				};

				if (type === NOTIFICATION_MESSAGE_TYPE.ERROR) {
					nodeErrorMessages.push(summarizedMessage);
				} else {
					nodeWarningMessages.push(summarizedMessage);
				}
			}
		}

		return {
			errorMessages: nodeErrorMessages,
			warningMessages: nodeWarningMessages
		};
	}

	generateFlowNotificationMessages(pipelineId, flowLabel, currentPipelineId) {
		let flowErrorMessages = [];
		let flowWarningMessages = [];

		if (pipelineId !== currentPipelineId) {
			const nodesInFlow = this.canvasController.getNodes(pipelineId);
			let flowErrorCount = 0;
			let flowWarningCount = 0;
			nodesInFlow.forEach((node) => {
				if (has(node, "subflow_ref.pipeline_id_ref")) {
					const subflowMessages = this.generateFlowNotificationMessages(node.subflow_ref.pipeline_id_ref, node.label, currentPipelineId);
					flowErrorMessages = flowErrorMessages.concat(subflowMessages.errorMessages);
					flowWarningMessages = flowWarningMessages.concat(subflowMessages.warningMessages);
				}

				const nodeMessages = this.canvasController.getNodeMessages(node.id, pipelineId);
				if (nodeMessages && nodeMessages.length > 0) {
					let errors = 0;
					let warnings = 0;
					forIn(nodeMessages, (nodeMessage) => {
						if (nodeMessage.type === NOTIFICATION_MESSAGE_TYPE.ERROR) {
							errors++;
						} else if (nodeMessage.type === NOTIFICATION_MESSAGE_TYPE.WARNING) {
							warnings++;
						}
					});
					if (errors > 0) {
						flowErrorCount++;
					} else if (warnings > 0) {
						flowWarningCount++;
					}
				}
			});

			if (flowErrorCount > 0 || flowWarningCount > 0) {
				let generatedMessage = flowLabel + " flow has ";
				if (flowErrorCount > 0) {
					generatedMessage += flowErrorCount + " errors";
					if (flowWarningCount > 0) {
						generatedMessage += " and ";
					}
				}
				if (flowWarningCount > 0) {
					generatedMessage += flowWarningCount + " warnings";
				}

				const type = flowErrorCount > 0 ? NOTIFICATION_MESSAGE_TYPE.ERROR : NOTIFICATION_MESSAGE_TYPE.WARNING;
				const summarizedMessage = {
					id: "notification-flow-" + pipelineId,
					title: flowLabel,
					type: type,
					content: generatedMessage,
					callback: this.flowNotificationMessageCallback.bind(this, pipelineId)
				};

				if (type === NOTIFICATION_MESSAGE_TYPE.ERROR) {
					flowErrorMessages.push(summarizedMessage);
				} else {
					flowWarningMessages.push(summarizedMessage);
				}
			}
		}

		return {
			errorMessages: flowErrorMessages,
			warningMessages: flowWarningMessages
		};
	}

	appendNotificationMessages(message) {
		this.harnessNotificationMessages = this.harnessNotificationMessages.concat(message);
		this.canvasController.setNotificationMessages(this.canvasController.getNotificationMessages().concat(message));
		this.log("Set Notification Messages", "Set " + (this.canvasController.getNotificationMessages().length) + " notification messages");
	}

	addNodeTypeToPalette(nodeTypeObj, category, categoryLabel) {
		this.canvasController.addNodeTypeToPalette(nodeTypeObj, category, categoryLabel);
		this.log("Added nodeType to palette", { nodeTypeObj: nodeTypeObj, category: category, categoryLabel: categoryLabel });
	}

	clearNotificationMessages(messageId) {
		this.harnessNotificationMessages = [];
		this.flowNotificationMessages = [];
		this.canvasController.clearNotificationMessages();
		this.log("Cleared Notification Message");
	}

	// Open node editor on notification message click
	nodeNotificationMessageCallback(nodeId, pipelineId, inExtraCanvas) {
		if (inExtraCanvas) {
			this.canvasController2.setSelections([nodeId], pipelineId);
			this.canvasController2.closeNotificationPanel();
			this.editNodeHandler(nodeId, pipelineId, inExtraCanvas);
		} else {
			this.canvasController.setSelections([nodeId], pipelineId);
			this.canvasController.closeNotificationPanel();
			this.editNodeHandler(nodeId, pipelineId);
		}
	}

	// Open the flow on notification message click
	flowNotificationMessageCallback(pipelineId) {
		this.canvasController.displaySubPipeline({ pipelineId: pipelineId });
		this.setBreadcrumbsDefinition(pipelineId);
		this.canvasController.closeNotificationPanel();
	}

	sidePanelCanvas() {
		this.setState({
			openSidepanelCanvas: !this.state.openSidepanelCanvas,
			openSidepanelModal: false,
			openSidepanelAPI: false,
			selectedPanel: SIDE_PANEL_CANVAS
		});
	}

	sidePanelModal() {
		this.setState({
			openSidepanelModal: !this.state.openSidepanelModal,
			openSidepanelCanvas: false,
			openSidepanelAPI: false,
			selectedPanel: SIDE_PANEL_MODAL
		});
	}

	sidePanelAPI() {
		this.setState({
			openSidepanelAPI: !this.state.openSidepanelAPI,
			openSidepanelCanvas: false,
			openSidepanelModal: false,
			selectedPanel: SIDE_PANEL_API
		});
	}

	isSidePanelOpen() {
		return this.state.openSidepanelCanvas || this.state.openSidepanelModal || this.state.openSidepanelAPI;
	}

	closeSidePanelModal() {
		this.setState({
			openSidepanelModal: false,
			openSidepanelCanvas: false,
			openSidepanelAPI: false,
			selectedPanel: null
		});
	}

	log(evt, data) {
		const now = new Date();
		const event = {
			"timestamp": now.toLocaleString() + " " + now.getMilliseconds(),
			"event": evt,
			"data": data
		};

		this.consoleout.push(event);

		// Add consoleoutput to the global document so the test harness can access it
		document.eventLog = this.consoleout;

		this.setState({ consoleout: this.consoleout });

		if (this.state.consoleOpened) {
			const objDiv = document.getElementsByClassName("harness-app-console")[0];
			objDiv.scrollTop = objDiv.scrollHeight;
		}
	}

	openConsole() {
		this.setState({ consoleOpened: !this.state.consoleOpened });
	}

	download() {
		const pipelineFlow = this.canvasRef ? this.canvasRef.current.canvasController.getPipelineFlow() : this.getPipelineFlow();
		var canvas = JSON.stringify(pipelineFlow, null, 2);
		ReactFileDownload(canvas, "canvas.json");
	}

	useApplyOnBlur(enabled) {
		this.setState({ applyOnBlur: enabled });
		this.log("apply changes on blur", enabled);
	}

	useExpressionBuilder(enabled) {
		this.setState({ expressionBuilder: enabled });
		this.log("use expression builder", enabled);
	}

	useExpressionValidate(enabled) {
		this.setState({ expressionValidate: enabled });
		this.log("use expression validate link", enabled);
	}

	useDisplayAdditionalComponents(enabled) {
		this.setState({ displayAdditionalComponents: enabled });
		this.log("additional components display", enabled);
	}

	usePropertiesContainerType(type) {
		this.setState({ propertiesContainerType: type });
		this.log("set properties container", type);
	}

	useHeading(enabled) {
		this.setState({ heading: enabled });
		this.log("show heading", enabled);
	}

	// common-canvas
	clickActionHandler(source) {
		this.log("clickActionHandler()", source);
		if (source.objectType === "node" &&
				((this.state.selectedDragWithoutSelect &&
					source.clickType === "SINGLE_CLICK" &&
					this.canvasController.getSelectedObjectIds().length === 1) ||
					(!this.state.selectedDragWithoutSelect &&
						source.clickType === "DOUBLE_CLICK"))) {
			this.editNodeHandler(source.id, source.pipelineId);
		}
	}

	extraCanvasClickActionHandler(source) {
		this.log("extraCanvasClickActionHandler()", source);
		if (source.objectType === "node" &&
				((this.state.selectedDragWithoutSelect &&
					source.clickType === "SINGLE_CLICK" &&
					this.canvasController2.getSelectedObjectIds().length === 1) ||
					(!this.state.selectedDragWithoutSelect &&
						source.clickType === "DOUBLE_CLICK"))) {
			this.editNodeHandler(source.id, source.pipelineId, true);
		}
	}

	applyPropertyChanges(form, appData, additionalInfo, undoInfo, uiProperties) {
		const data = {
			form: form,
			appData: appData,
			messages: additionalInfo.messages,
			title: additionalInfo.title,
			uiProperties: uiProperties
		};
		this.log("applyPropertyChanges()", data);

		if (appData && appData.nodeId) {
			const currentEditorNodeId = (appData.inExtraCanvas) ? this.currentEditorId2 : this.currentEditorId;
			const canvasController = (appData.inExtraCanvas) ? this.canvasController2 : this.canvasController;
			const propertiesController = (appData.inExtraCanvas) ? this.propertiesController2 : this.propertiesController;

			// store parameters in case properties were opened from canvas
			canvasController.setNodeParameters(appData.nodeId, form, appData.pipelineId);
			canvasController.setNodeLabel(appData.nodeId, additionalInfo.title, appData.pipelineId);
			canvasController.setNodeMessages(appData.nodeId, additionalInfo.messages, appData.pipelineId);
			canvasController.setNodeUiParameters(appData.nodeId, uiProperties, appData.pipelineId);


			// set notification message if errors/warnings
			this.setFlowNotificationMessages();

			// undo/redo was clicked so reapply settings
			if (appData.nodeId === currentEditorNodeId) {
				propertiesController.setPropertyValues(undoInfo.properties);
				propertiesController.setErrorMessages(undoInfo.messages);
				propertiesController.setTitle(additionalInfo.title);
			}
		}
	}

	buttonHandler(data) {
		this.log("buttonHandler()", data);

		// Trigger conditions to show an error
		if (data.propertyId.name === "readonlyTableError") {
			this.propertiesController.validateInput(data.propertyId);
		}
	}

	helpClickHandler(nodeTypeId, helpData, appData) {
		this.log("helpClickHandler()", { nodeTypeId, helpData, appData });
	}

	contextMenuHandler(source, defaultMenu) {
		let defMenu = defaultMenu;
		// Add custom menu items at proper positions: open, preview & execute
		if (source.type === "node" && source.selectedObjectIds.length === 1) {
			defMenu.unshift({ action: "editNode", label: this.getLabel("node_editNode", "CMI: Open") });
			defMenu.splice(2, 0, { action: "previewNode", label: this.getLabel("node_previewNode", "CMI: Preview") });
			defMenu.splice(8, 0, { action: "executeNode", label: this.getLabel("node_executeNode", "CMI: Execute") });
			defMenu.splice(9, 0, { divider: true });
		}
		// Add custom menu items validate flow and stream properties if source is canvas
		if (source.type === "canvas") {
			defMenu = defMenu.concat([{ action: "streamProperties", label: this.getLabel("canvas_streamProperties", "CMI: Options") }]);

		} else if (source.type === "input_port") {
			const portName = source.port.label ? source.port.label : source.port.id;
			defMenu = defMenu.concat({ action: "inputPortAction", label: this.getLabel("canvas_inputPortAction", "CMI: Input Port action for '" + portName + "'") });

		} else if (source.type === "output_port") {
			const portName = source.port.label ? source.port.label : source.port.id;
			defMenu = defMenu.concat({ action: "outputPortAction", label: this.getLabel("canvas_outputPortAction", "CMI: Output Port action for '" + portName + "'") });
		}
		return defMenu;
	}

	beforeEditActionHandler(cmndData, command) {
		const data = cmndData;
		// Uncomment to play with setting the command data.
		// if (data && data.editType === "editComment") {
		// 	data.content += " -- Added text";
		// }
		return data;
	}

	editActionHandler(data, command, inExtraCanvas) {
		let canvasController = this.canvasController;

		if (inExtraCanvas) {
			canvasController = this.canvasController2;
		}

		if (data.editType === "displaySubPipeline" || data.editType === "displayPreviousPipeline") {
			this.setFlowNotificationMessages();
			this.setBreadcrumbsDefinition(data.pipelineInfo.pipelineId);

		} else if (data.editType === "createTestHarnessNode") {
			const nodeTemplate = canvasController.getPaletteNode(data.op);
			if (nodeTemplate) {
				data.editType = "createNode";
				data.nodeTemplate = canvasController.convertNodeTemplate(nodeTemplate);
				canvasController.editActionHandler(data);
			}

		} else if (data.editType === "createFromExternalObject") {
			const nodeTemplate = canvasController.getPaletteNode("variablefile");
			if (nodeTemplate) {
				data.editType = "createNode";
				data.nodeTemplate = canvasController.convertNodeTemplate(nodeTemplate);
				data.nodeTemplate.label = data.dataTransfer.files[0].name;
				canvasController.editActionHandler(data);
			}

		} else if (data.editType === "editNode") {
			this.editNodeHandler(data.targetObject.id, data.pipelineId, inExtraCanvas);

		} else if (data.editType === "runit") {
			if (this.state.selectedCanvasDropdownFile === "allTypesCanvas.json" ||
					this.state.selectedCanvasDropdownFile === "stylesCanvas.json") {
				this.runProgress();
			}
		}
		this.log("editActionHandler(): " + data.editType, data);
	}

	extraCanvasEditActionHandler(data, command) {
		this.editActionHandler(data, command, true);
	}

	decorationActionHandler(object, id, pipelineId) {
		this.log("decorationHandler() Decoration ID = " + id, id, "Object ID = " + object.id + " pipeline ID = " + pipelineId);
		if (id === "supernodeZoomIn") {
			this.refreshContent("this.state.stream.id", "node.subDiagramId");
		}
	}

	decorationHandler(node) {
		var decorators = [];

		if (node.subDiagramId) {
			decorators.push({
				className: "supernode-zoom-in",
				position: "top-left",
				actionHandler: this.decorationAction.bind(this, node, "supernodeZoomIn") });
		}

		if (node.cacheState !== "disabled") {
			decorators.push({
				className: "cache-" + node.cacheState,
				position: "top-right" });
		}
		return decorators;
	}

	editNodeHandler(nodeId, activePipelineId, inExtraCanvas) {
		this.log("action: editNode", nodeId);
		const canvasController = (inExtraCanvas) ? this.canvasController2 : this.canvasController;
		const currentEditorNodeId = (inExtraCanvas) ? this.currentEditorId2 : this.currentEditorId;
		const commonPropertiesRef = (inExtraCanvas) ? this.CommonProperties2 : this.CommonProperties;
		if (nodeId && currentEditorNodeId !== nodeId) {
			// apply properties from previous node if node selection has changed w/o closing editor
			if (currentEditorNodeId && canvasController.getNode(currentEditorNodeId, activePipelineId)) {
				commonPropertiesRef.applyPropertiesEditing(false);
			}
			if (inExtraCanvas) {
				this.currentEditorId2 = nodeId;
			} else {
				this.currentEditorId = nodeId;
			}
			// currentEditorNodeId = nodeId; // set new node
			const appData = { nodeId: nodeId, inExtraCanvas: inExtraCanvas, pipelineId: activePipelineId };
			this.getNodeForm(nodeId, activePipelineId, canvasController, (properties) => {
				const messages = canvasController.getNodeMessages(nodeId, activePipelineId);
				const additionalComponents = this.state.displayAdditionalComponents ? { "toggle-panel": <AddtlCmptsTest /> } : properties.additionalComponents;
				const expressionInfo = this.state.expressionBuilder ? ExpressionInfo : null;
				if (expressionInfo !== null) {
					expressionInfo.validateLink = this.state.expressionValidate;
				}
				const propsInfo = {
					title: <FormattedMessage id={ "dialog.nodePropertiesTitle" } />,
					messages: messages,
					formData: properties.formData,
					parameterDef: properties,
					appData: appData,
					additionalComponents: additionalComponents,
					expressionInfo: expressionInfo
				};

				if (inExtraCanvas) {
					this.setState({ showPropertiesDialog2: true, propertiesInfo2: propsInfo });
				} else {
					this.setState({ showPropertiesDialog: true, propertiesInfo: propsInfo });
				}
			});
		}
	}

	selectionChangeHandler(data) {
		this.log("selectionChangeHandler", data);
		// apply properties from previous node if node selection has to more than one node
		if (this.currentEditorId) {
			// don't apply changes if node has been removed
			if (this.canvasController.getNode(this.currentEditorId, data.selectedPipelineId) &&
					this.CommonProperties) {
				this.CommonProperties.applyPropertiesEditing(false);
			}
			this.setState({ showPropertiesDialog: false });
			this.currentEditorId = null;
		}
	}

	selectionChangeHandler2(data) {
		this.log("selectionChangeHandler2", data);
		// apply properties from previous node if node selection has to more than one node
		if (this.currentEditorId2) {
			// don't apply changes if node has been removed
			if (this.canvasController2.getNode(this.currentEditorId2, data.selectedPipelineId) &&
					this.CommonProperties2) {
				this.CommonProperties2.applyPropertiesEditing(false);
			}
			this.setState({ showPropertiesDialog2: false });
			this.currentEditorId2 = null;
		}
	}

	tipHandler(tipType, data) {
		if (tipType === "tipTypeLink") {
			let sourceString = data.link.type === "commentLink" ? "comment" : "detached source";
			if (data.link.src && data.link.src.outputs) {
				const srcPort = !data.link.src.outputs ? null : data.link.src.outputs.find(function(port) {
					return port.id === data.link.srcPortId;
				});
				sourceString = `'${data.link.src.label}'` + (srcPort && srcPort.label ? `, port '${srcPort.label}'` : "");
			}

			let targetString = "detached target";
			if (data.link.trg && data.link.trg.inputs) {
				const trgPort = data.link.trg.inputs.find(function(port) {
					return port.id === data.link.trgPortId;
				});
				targetString = `'${data.link.trg.label}'` + (trgPort && trgPort.label ? `, port '${trgPort.label}'` : "");
			}

			return `Link from ${sourceString} to ${targetString}`;
		}
		return null;
	}

	refreshContent(streamId, diagramId) {
		this.log("refreshContent()");
	}

	// common-properties
	openPropertiesEditorDialog() {
		var properties = this.state.propertiesJson;
		const additionalComponents = this.state.displayAdditionalComponents ? { "toggle-panel": <AddtlCmptsTest /> } : properties.additionalComponents;
		const expressionInfo = this.state.expressionBuilder ? ExpressionInfo : null;
		if (expressionInfo !== null) {
			expressionInfo.validateLink = this.state.expressionValidate;
		}
		const propsInfo = {
			title: <FormattedMessage id={ "dialog.nodePropertiesTitle" } />,
			formData: properties.formData,
			parameterDef: properties,
			additionalComponents: additionalComponents,
			expressionInfo: expressionInfo
		};

		this.setState({ showPropertiesDialog: true, propertiesInfo: propsInfo });
	}

	closePropertiesEditorDialog() {
		this.currentEditorId = null;
		this.canvasController.setSelections([]); // clear selection
		this.setState({ showPropertiesDialog: false, propertiesInfo: {} });
	}

	closePropertiesEditorDialog2() {
		this.currentEditorId2 = null;
		this.canvasController2.setSelections([]); // clear selection
		this.setState({ showPropertiesDialog2: false, propertiesInfo2: {} });
	}

	validateProperties() {
		if (this.propertiesController) {
			this.propertiesController.validatePropertiesValues();
		}
		if (this.propertiesController2) {
			this.propertiesController2.validatePropertiesValues();
		}
	}

	handleEmptyCanvasLinkClick() {
		window.alert("Sorry the tour is not included with the test harness. :-( But " +
			"this is a good example of how a host app could add their own link to " +
			"the empty canvas objects!");
	}

	propertiesControllerHandler(propertiesController) {
		this.log("propertiesControllerHandler()");
		this.propertiesController = propertiesController;
		this.propertiesController.setCommandStack(this.canvasController.getCommandStack());
	}

	propertiesControllerHandler2(propertiesController) {
		this.log("propertiesControllerHandler2()");
		this.propertiesController2 = propertiesController;
		this.propertiesController2.setCommandStack(this.canvasController2.getCommandStack());
	}

	propertyListener(data) {
		// This is an empty callback.  Logging creates a performance issue.
	}

	propertyActionHandler(actionId, appData, data) {
		const propertiesController = (appData && appData.inExtraCanvas) ? this.propertiesController2 : this.propertiesController;

		if (actionId === "increment") {
			const propertyId = { name: data.parameter_ref };
			let value = propertiesController.getPropertyValue(propertyId);
			propertiesController.updatePropertyValue(propertyId, value += 1);
		}
		if (actionId === "decrement") {
			const propertyId = { name: data.parameter_ref };
			let value = propertiesController.getPropertyValue(propertyId);
			propertiesController.updatePropertyValue(propertyId, value -= 1);
		}
		if (actionId === "dm-update") {
			const dm = propertiesController.getDatasetMetadata();
			// Add field to the first schema
			const newFieldName = "Added Field " + (dm[0].fields.length);
			const newField = {
				"name": newFieldName,
				"type": "string",
				"metadata": {
					"description": "",
					"measure": "discrete",
					"modeling_role": "target"
				}
			};
			dm[0].fields.push(newField);
			propertiesController.setDatasetMetadata(dm);
		}
		if (actionId === "summer") {
			const propertyId = { name: data.parameter_ref };
			propertiesController.updatePropertyValue(propertyId, "Summer: hot, sunny");
		}
		if (actionId === "winter") {
			const propertyId = { name: data.parameter_ref };
			propertiesController.updatePropertyValue(propertyId, "Winter: cold, snowy");
		}
		if (actionId === "fall") {
			const propertyId = { name: data.parameter_ref };
			propertiesController.updatePropertyValue(propertyId, "Fall: cool, frosty");
		}
		if (actionId === "spring") {
			const propertyId = { name: data.parameter_ref };
			propertiesController.updatePropertyValue(propertyId, "Spring: mild, rainy");
		}
		if (actionId === "moon") {
			const propertyId = { name: data.parameter_ref };
			let value = propertiesController.getPropertyValue(propertyId);
			switch (value) {
			case "Full" :
				value = "Waning";
				break;
			case "Waning" :
				value = "New";
				break;
			case "New" :
				value = "Waxing";
				break;
			default:
				value = "Full";
			}
			propertiesController.updatePropertyValue(propertyId, value);
		}
		if (actionId === "meteor") {
			const propertyId = { name: data.parameter_ref };
			let value = propertiesController.getPropertyValue(propertyId);
			switch (value) {
			case "Perseids" :
				value = "Orionids";
				break;
			case "Orionids" :
				value = "Leonids";
				break;
			case "Leonids" :
				value = "Geminids";
				break;
			case "Geminids" :
				value = "Lyrids";
				break;

			default:
				value = "Perseids";
			}
			propertiesController.updatePropertyValue(propertyId, value);
		}
		if (actionId === "image_cond_disable" || actionId === "button_cond_disable") {
			const propertyId = { name: data.parameter_ref };
			let value = propertiesController.getPropertyValue(propertyId);
			if (value === "The disable action has been pressed.") {
				value = "The disable action has been pressed once more.";
			} else {
				value = "The disable action has been pressed.";
			}
			propertiesController.updatePropertyValue(propertyId, value);
		}


		this.log("propertyActionHandler() " + actionId);
	}

	runProgress() {
		const nodeAnimation =
			"animation-duration:1000ms; animation-name:wiggle2; " +
			"animation-iteration-count:infinite; fill: skyblue;";

		const nodeStyle = {
			body: { default: nodeAnimation, hover: "fill: orange; stroke: coralred; stroke-width: 5;" },
			// selection_outline: { default: animation },
			image: { default: null },
			label: { default: "fill: blue" },
			text: { default: "fill: white" }
		};

		const removeNodeStyle = {
			body: { default: null, hover: null },
			// selection_outline: { default: animation },
			image: { default: null },
			label: { default: null },
			text: { default: null }
		};

		// Note: The pipelineId uses special characters for testing purposes.
		const pipelineId = "`~!@#$%^&*()_+=-{}][|:;<,>.9?/";

		const bindingEntryNode = "id8I6RH2V91XW";
		const executionNode = "|:;<,>.9?/`~!@#$%^&*()_+=-{}]["; // The executiion node id uses special characters for testing.
		const superNode = "nodeIDSuperNodePE";
		const modelNode = "id125TTEEIK7V";
		const bindingExitNode = "id5KIRGGJ3FYT";

		const objects1 = [];
		const objects2 = [];
		const objects3 = [];
		const objects4 = [];

		objects1[pipelineId] = [bindingEntryNode];
		objects2[pipelineId] = [executionNode];
		objects3[pipelineId] = [superNode];
		objects4[pipelineId] = [modelNode, bindingExitNode];

		const linkAnimation =
			"animation-duration:1000ms; animation-name:blink; " +
			"animation-iteration-count:infinite; animation-direction: alternate";

		const linkStyle = {
			line: { default: linkAnimation, hover: "stroke: yellow; stroke-width: 2" }
		};

		const removeLinkStyle = {
			line: { default: null, hover: null }
		};

		const lnk1 = this.canvasController.getNodeDataLinkFromInfo(bindingEntryNode, "outPort", executionNode, "inPort");
		const lnk2 = this.canvasController.getNodeDataLinkFromInfo(executionNode, null, superNode, "input2SuperNodePE");
		const lnk3 = this.canvasController.getNodeDataLinkFromInfo(superNode, null, modelNode, "inPort");
		const lnk4 = this.canvasController.getNodeDataLinkFromInfo(superNode, "output1SuperNodePE", bindingExitNode, "inPort");

		const link1 = [];
		const link2 = [];
		const link3 = [];

		link1[pipelineId] = [lnk1.id];
		link2[pipelineId] = [lnk2.id];
		link3[pipelineId] = [lnk3.id, lnk4.id];

		const that = this;

		that.canvasController.setObjectsStyle(objects1, nodeStyle, true);

		setTimeout(() => {
			that.canvasController.setLinksStyle(link1, linkStyle, true);
			that.canvasController.setObjectsStyle(objects2, nodeStyle, true);
		}, 2000);

		setTimeout(() => {
			that.canvasController.setObjectsStyle(objects1, removeNodeStyle, true);
			that.canvasController.setLinksStyle(link1, removeLinkStyle, true);
		}, 4000);

		setTimeout(() => {
			that.canvasController.setLinksStyle(link2, linkStyle, true);
			that.canvasController.setObjectsStyle(objects3, nodeStyle, true);
		}, 6000);

		setTimeout(() => {
			that.canvasController.setObjectsStyle(objects2, removeNodeStyle, true);
			that.canvasController.setLinksStyle(link2, removeLinkStyle, true);
		}, 8000);

		setTimeout(() => {
			that.canvasController.setLinksStyle(link3, linkStyle, true);
			that.canvasController.setObjectsStyle(objects4, nodeStyle, true);
		}, 10000);

		setTimeout(() => {
			that.canvasController.setLinksStyle(link3, removeLinkStyle, true);
			that.canvasController.setObjectsStyle(objects3, removeNodeStyle, true);
		}, 12000);

		setTimeout(() => {
			that.canvasController.setObjectsStyle(objects4, removeNodeStyle, true);
		}, 14000);
	}

	render() {
		const currentPipelineId = this.canvasController.getCurrentBreadcrumb().pipelineId;
		const breadcrumbs = (<Breadcrumbs
			canvasController={this.canvasController}
			breadcrumbsDef={this.state.breadcrumbsDef}
			currentPipelineId={currentPipelineId}
		/>);

		const navBar = (<header aria-label="Common Canvas Header" role="banner">
			<div className="harness-app-navbar">
				<ul className="harness-app-navbar-items">
					<li className="harness-navbar-li">
						<span className="harness-title">Common Canvas</span>
						<span className="harness-version">{"v" + CommonCanvasPackage.version}</span>
					</li>
					<li className="harness-navbar-li harness-nav-divider" data-tip="console">
						<a onClick={this.openConsole.bind(this) }>
							<Isvg src={listview32} />
						</a>
					</li>
					<li className="harness-navbar-li" data-tip="download">
						<a onClick={this.download.bind(this) }>
							<Isvg src={download32} />
						</a>
					</li>
					<li className="harness-navbar-li harness-pipeline-breadcrumbs-container">
						{breadcrumbs}
					</li>
					<li id="harness-action-bar-sidepanel-api" className="harness-navbar-li harness-nav-divider harness-action-bar-sidepanel" data-tip="API">
						<a onClick={this.sidePanelAPI.bind(this) }>
							<Isvg src={api32} />
						</a>
					</li>
					<li id="harness-action-bar-sidepanel-modal" className="harness-navbar-li harness-action-bar-sidepanel" data-tip="Common Properties Modal">
						<a onClick={this.sidePanelModal.bind(this) }>
							<Isvg src={template32} />
						</a>
					</li>
					<li id="harness-action-bar-sidepanel-canvas" className="harness-navbar-li harness-nav-divider harness-action-bar-sidepanel" data-tip="Common Canvas">
						<a onClick={this.sidePanelCanvas.bind(this) }>
							<Isvg src={justify32} />
						</a>
					</li>
				</ul>
			</div>
		</header>);

		let emptyCanvasDiv = null;
		if (this.state.selectedDisplayCustomizedEmptyCanvasContent) {
			emptyCanvasDiv = (
				<div>
					<Isvg src={BlankCanvasImage} className="harness-empty-image" />
					<span className="harness-empty-text">
						<FormattedMessage
							id={ "canvas.emptyText" }
							values={{ br: <br /> }}
						/>
					</span>
					<span className="harness-empty-link"
						onClick={this.handleEmptyCanvasLinkClick}
					><FormattedMessage id={ "canvas.emptyLink"} /></span>
				</div>);
		}

		let dropZoneCanvasDiv = null;
		if (this.state.selectedDisplayCustomizedDropZoneContent) {
			dropZoneCanvasDiv = (
				<div>
					<div className="dropzone-canvas" />
					<div className="dropzone-canvas-rect" />
					<span className="dropzone-canvas-text">Drop a data object here<br />to add to canvas.</span>
				</div>);
		}

		let parentClass = "";
		if (this.state.selectedNodeFormat === "Vertical") {
			parentClass = "classic-vertical";
			if (this.state.selectedConnectionType === "Halo") {
				parentClass = "classic-halo";
			}
		}

		const commonCanvasConfig = {
			enableInteractionType: this.state.selectedInteractionType,
			enableSnapToGridType: this.state.selectedSnapToGridType,
			enableSnapToGridX: this.state.enteredSnapToGridX,
			enableSnapToGridY: this.state.enteredSnapToGridY,
			enableConnectionType: this.state.selectedConnectionType,
			enableNodeFormatType: this.state.selectedNodeFormat,
			enableLinkType: this.state.selectedLinkType,
			enableLinkDirection: this.state.selectedLinkDirection,
			enableAssocLinkType: this.state.selectedAssocLinkType,
			enableParentClass: parentClass,
			enableHightlightNodeOnNewLinkDrag: this.state.selectedHightlightNodeOnNewLinkDrag,
			enableInternalObjectModel: this.state.selectedInternalObjectModel,
			enableDragWithoutSelect: this.state.selectedDragWithoutSelect,
			enableLinkSelection: this.state.selectedLinkSelection,
			enableAssocLinkCreation: this.state.selectedAssocLinkCreation,
			enablePaletteLayout: this.state.selectedPaletteLayout,
			enableToolbarLayout: this.state.selectedToolbarLayout,
			enableInsertNodeDroppedOnLink: this.state.selectedInsertNodeDroppedOnLink,
			enableMoveNodesOnSupernodeResize: this.state.selectedMoveNodesOnSupernodeResize,
			enablePositionNodeOnRightFlyoutOpen: this.state.selectedPositionNodeOnRightFlyoutOpen,
			tipConfig: this.state.selectedTipConfig,
			schemaValidation: this.state.selectedSchemaValidation,
			enableNarrowPalette: this.state.selectedNarrowPalette,
			enableDisplayFullLabelOnHover: this.state.selectedDisplayFullLabelOnHover,
			enableBoundingRectangles: this.state.selectedBoundingRectangles,
			enableCanvasUnderlay: this.state.selectedCanvasUnderlay,
			enableDropZoneOnExternalDrag: this.state.selectedDropZoneOnExternalDrag,
			enableRightFlyoutUnderToolbar: this.state.selectedRightFlyoutUnderToolbar,
			enablePanIntoViewOnOpen: this.state.selectedPanIntoViewOnOpen,
			dropZoneCanvasContent: dropZoneCanvasDiv,
			emptyCanvasContent: emptyCanvasDiv,
			enableSaveZoom: this.state.selectedSaveZoom,
			enableZoomIntoSubFlows: this.state.selectedZoomIntoSubFlows,
			enableNodeLayout: this.state.selectedNodeLayout,
			enableCanvasLayout: this.state.selectedCanvasLayout
		};

		const decorationActionHandler = this.decorationActionHandler;
		const editActionHandler = this.editActionHandler;

		const commonCanvasConfig2 = {
			enableConnectionType: this.state.selectedConnectionType,
			enableNodeFormatType: this.state.selectedNodeFormat,
			enableLinkType: this.state.selectedLinkType,
			enableParentClass: parentClass,
			enableInternalObjectModel: this.state.selectedInternalObjectModel,
			enableDragWithoutSelect: this.state.selectedDragWithoutSelect,
			enablePaletteLayout: this.state.selectedPaletteLayout,
			emptyCanvasContent: emptyCanvasDiv,
			selectedMoveNodesOnSupernodeResize: true,
			tipConfig: this.state.selectedTipConfig,
			schemaValidation: this.state.selectedSchemaValidation,
			enableBoundingRectangles: this.state.selectedBoundingRectangles,
			enableNarrowPalette: this.state.selectedNarrowPalette
		};

		let toolbarConfig = null;
		if (this.state.selectedToolbarType === TOOLBAR_TYPE_DEFAULT) {
			toolbarConfig = null;

		} else if (this.state.selectedToolbarType === TOOLBAR_TYPE_SINGLE_BAR) {
			toolbarConfig = [
				{ action: "palette", label: "Palette", enable: true },
				{ divider: true },
				{ action: "stopit", label: "Stop", enable: false, incLabelWithIcon: "before", iconEnabled: (<StopFilledAlt32 />) },
				{ action: "runit", label: "Run", enable: true, incLabelWithIcon: "before", kind: "primary", iconEnabled: (<Play32 />) },
				{ divider: true },
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true },
				{ action: "cut", label: "Cut", enable: true, tooltip: "Cut from clipboard" },
				{ action: "copy", label: "Copy", enable: true, tooltip: "Copy from clipboard" },
				{ action: "paste", label: "Paste", enable: true, tooltip: "Paste to canvas" },
				{ action: "createAutoComment", label: "Add Comment", enable: true },
				{ action: "deleteSelectedObjects", label: "Delete", enable: true },
				{ action: "arrangeHorizontally", label: "Arrange Horizontally", enable: true },
				{ action: "arrangeVertically", label: "Arrange Vertically", enable: true }
			];

		} else if (this.state.selectedToolbarType === TOOLBAR_TYPE_BEFORE_AFTER) {
			toolbarConfig = {
				leftBar: [
					{ action: "before-enabled", incLabelWithIcon: "before", label: "Before - enabled", enable: true, iconEnabled: (<Edit32 />), iconDisabled: (<Edit32 />) },
					{ action: "before-disabled", incLabelWithIcon: "before", label: "Before - disbaled", enable: false, iconEnabled: (<Edit32 />), iconDisabled: (<Edit32 />) },
					{ action: "after-enabled", incLabelWithIcon: "after", label: "After - enabled", enable: true, iconEnabled: (<Edit32 />), iconDisabled: (<Edit32 />) },
					{ action: "after-disabled", incLabelWithIcon: "after", label: "After - disbaled", enable: false, iconEnabled: (<Edit32 />), iconDisabled: (<Edit32 />) },
				],
				rightBar: [
					{ divider: true },
					{ divider: true },
					{ action: "zoomIn", label: this.getLabel("toolbar.zoomIn"), enable: true },
					{ action: "zoomOut", label: this.getLabel("toolbar.zoomOut"), enable: true },
					{ action: "zoomToFit", label: this.getLabel("toolbar.zoomToFit"), enable: true }
				]
			};

		} else if (this.state.selectedToolbarType === TOOLBAR_TYPE_CUSTOM_RIGHT_SIDE) {
			toolbarConfig = {
				leftBar: [
				],
				rightBar: [
					{ action: "zoomIn", label: this.getLabel("toolbar.zoomIn"), enable: true },
					{ action: "zoomOut", label: this.getLabel("toolbar.zoomOut"), enable: true },
					{ action: "zoomToFit", label: this.getLabel("toolbar.zoomToFit"), enable: true },
					{ divider: true },
					{ action: "undo", label: "Undo", enable: true },
					{ action: "redo", label: "Redo", enable: true },
					{ divider: true },
					{ action: "cut", label: "Cut", enable: true },
					{ action: "copy", label: "Copy", enable: true },
					{ action: "paste", label: "Paste", enable: true },
					{ divider: true },
					{ action: "createAutoComment", label: "Add Comment", enable: true },
					{ action: "deleteSelectedObjects", label: "Delete", enable: true },
					{ divider: true },
					{ action: "arrangeHorizontally", label: "Arrange Horizontally", enable: true },
					{ action: "arrangeVertically", label: "Arrange Vertically", enable: true }
				]
			};

		} else if (this.state.selectedToolbarType === TOOLBAR_TYPE_CARBON_BUTTONS) {
			toolbarConfig = {
				leftBar: [
					{ action: "primary", label: "Primary", enable: true, incLabelWithIcon: "before", kind: "primary", iconEnabled: (<Edit32 />) },
					{ action: "danger", label: "Danger", enable: true, incLabelWithIcon: "before", kind: "danger", iconEnabled: (<Edit32 />) },
					{ action: "secondary", label: "Secondary", enable: true, incLabelWithIcon: "before", kind: "secondary", iconEnabled: (<Edit32 />) },
					{ action: "tertiary", label: "Tertiary", enable: true, incLabelWithIcon: "before", kind: "tertiary", iconEnabled: (<Edit32 />) },
					{ action: "ghost", label: "Ghost", enable: true, incLabelWithIcon: "before", kind: "ghost", iconEnabled: (<Edit32 />) },
					{ action: "default", label: "Default", enable: true, incLabelWithIcon: "before", iconEnabled: (<Edit32 />) },
				],
				rightBar: [
					{ action: "dis-primary", label: "Primary", enable: false, incLabelWithIcon: "before", kind: "primary", iconEnabled: (<Edit32 />) },
					{ action: "dis-danger", label: "Danger", enable: false, incLabelWithIcon: "before", kind: "danger", iconEnabled: (<Edit32 />) },
					{ action: "dis-secondary", label: "Secondary", enable: false, incLabelWithIcon: "before", kind: "secondary", iconEnabled: (<Edit32 />) },
					{ action: "dis-ghost", label: "Ghost", enable: false, incLabelWithIcon: "before", kind: "ghost", iconEnabled: (<Edit32 />) },
					{ action: "dis-default", label: "Default", enable: false, incLabelWithIcon: "before", iconEnabled: (<Edit32 />) },
				]
			};

		} else if (this.state.selectedToolbarType === TOOLBAR_TYPE_CUSTOM_ACTIONS) {
			// This example shows how custom JSX can be provided to the toolbar in the
			// jsx field to replace the content specified in the other fields. The JSX
			// added can be customized using the host applications own CSS.
			toolbarConfig = {
				leftBar: [
					{ action: "undo", label: "Undo", enable: true },
					{ action: "redo", label: "Redo", enable: true },
					{ divider: true },
					{ action: "custom-loading",
						jsx: (<div style={{ padding: "0 11px" }}><InlineLoading status="active" description="Loading..." /></div>) },
					{ divider: true },
					{ action: "custom-checkbox",
						jsx: (<div style={{ padding: "0 11px" }}><Checkbox id={"chk1"} defaultChecked labelText={"Check it out"} /></div>) },
					{ divider: true },
					{ action: "custom-button",
						tooltip: "A custom button of type primary!",
						jsx: (<div className="toolbar-custom-button"><Button id={"btn1"} size="field" kind="primary">Custom button </Button></div>) },
					{ divider: true }
				]
			};
		}

		const contextMenuConfig = {
			enableCreateSupernodeNonContiguous: this.state.selectedCreateSupernodeNonContiguous,
			defaultMenuEntries: {
				saveToPalette: this.state.selectedSaveToPalette,
				createSupernode: true
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

		const propertiesConfig = {
			containerType: this.state.propertiesContainerType === PROPERTIES_FLYOUT ? CUSTOM : this.state.propertiesContainerType,
			rightFlyout: this.state.propertiesContainerType === PROPERTIES_FLYOUT,
			applyOnBlur: this.state.applyOnBlur,
			heading: this.state.heading
		};
		const callbacks = {
			controllerHandler: this.propertiesControllerHandler,
			propertyListener: this.propertyListener,
			actionHandler: this.propertyActionHandler,
			applyPropertyChanges: this.applyPropertyChanges,
			closePropertiesDialog: this.closePropertiesEditorDialog,
			helpClickHandler: this.helpClickHandler,
			buttonHandler: this.buttonHandler
		};
		const callbacks2 = {
			controllerHandler: this.propertiesControllerHandler2,
			propertyListener: this.propertyListener,
			actionHandler: this.propertyActionHandler,
			applyPropertyChanges: this.applyPropertyChanges,
			closePropertiesDialog: this.closePropertiesEditorDialog2,
			helpClickHandler: this.helpClickHandler
		};
		const commonProperties = (
			<CommonProperties
				ref={(instance) => {
					this.CommonProperties = instance;
				} }
				propertiesInfo={this.state.propertiesInfo}
				propertiesConfig={propertiesConfig}
				customPanels={[CustomSliderPanel, CustomTogglePanel,
					CustomButtonPanel, CustomDatasetsPanel, EMMeansPanel, FixedEffectsPanel,
					RandomEffectsPanel, CustomSubjectsPanel]}
				callbacks={callbacks}
				customControls={[CustomToggleControl, CustomTableControl, CustomEmmeansDroplist]}
				customConditionOps={[CustomOpMax, CustomOpSyntaxCheck]}
			/>);

		const commonProperties2 = (
			<CommonProperties
				ref={(instance) => {
					this.CommonProperties2 = instance;
				} }
				propertiesInfo={this.state.propertiesInfo2}
				propertiesConfig={propertiesConfig}
				customPanels={[CustomSliderPanel, CustomTogglePanel, CustomButtonPanel, CustomDatasetsPanel,
					EMMeansPanel, FixedEffectsPanel, RandomEffectsPanel, CustomSubjectsPanel]}
				callbacks={callbacks2}
				customControls={[CustomToggleControl, CustomTableControl, CustomEmmeansDroplist]}
				customConditionOps={[CustomOpMax, CustomOpSyntaxCheck]}
			/>);

		let commonPropertiesContainer = null;
		let rightFlyoutContent = null;
		let rightFlyoutContent2 = null;
		let showRightFlyoutProperties = false;
		let showRightFlyoutProperties2 = false;
		if (this.state.propertiesContainerType === PROPERTIES_FLYOUT) {
			rightFlyoutContent = commonProperties;
			rightFlyoutContent2 = commonProperties2;
			showRightFlyoutProperties = this.state.showPropertiesDialog && this.state.propertiesContainerType === PROPERTIES_FLYOUT;
			showRightFlyoutProperties2 = this.state.showPropertiesDialog2 && this.state.propertiesContainerType === PROPERTIES_FLYOUT;
		} else {
			commonPropertiesContainer = (
				<div className="harness-common-properties">
					{commonProperties}
				</div>);
		}

		var firstCanvas = (
			<CommonCanvas
				config={commonCanvasConfig}
				contextMenuHandler={this.contextMenuHandler}
				beforeEditActionHandler= {this.beforeEditActionHandler}
				editActionHandler= {editActionHandler}
				clickActionHandler= {this.clickActionHandler}
				decorationActionHandler= {decorationActionHandler}
				selectionChangeHandler={this.selectionChangeHandler}
				layoutHandler={this.layoutHandler}
				tipHandler={this.tipHandler}
				toolbarConfig={toolbarConfig}
				notificationConfig={this.state.notificationConfig}
				contextMenuConfig={contextMenuConfig}
				keyboardConfig={keyboardConfig}
				rightFlyoutContent={rightFlyoutContent}
				showRightFlyout={showRightFlyoutProperties}
				canvasController={this.canvasController}
			/>);

		if (this.state.selectedExampleApp === EXAMPLE_APP_NONE) {
			this.canvasRef = null;
		} else {
			this.canvasRef = React.createRef();
		}
		if (this.state.selectedExampleApp === EXAMPLE_APP_FLOWS) {
			firstCanvas = (
				<FlowsCanvas
					ref={this.canvasRef}
					config={commonCanvasConfig}
					canvasController={this.canvasController}
				/>
			);
		} else if (this.state.selectedExampleApp === EXAMPLE_APP_TABLES) {
			firstCanvas = (
				<TablesCanvas
					ref={this.canvasRef}
					config={commonCanvasConfig}
				/>
			);
		} else if (this.state.selectedExampleApp === EXAMPLE_APP_DETACHED) {
			firstCanvas = (
				<DetachedCanvas
					ref={this.canvasRef}
					config={commonCanvasConfig}
				/>
			);
		} else if (this.state.selectedExampleApp === EXAMPLE_APP_EXPLAIN) {
			firstCanvas = (
				<ExplainCanvas
					ref={this.canvasRef}
					config={commonCanvasConfig}
				/>
			);
		} else if (this.state.selectedExampleApp === EXAMPLE_APP_EXPLAIN2) {
			firstCanvas = (
				<Explain2Canvas
					ref={this.canvasRef}
					config={commonCanvasConfig}
				/>
			);
		} else if (this.state.selectedExampleApp === EXAMPLE_APP_STREAMS) {
			firstCanvas = (
				<StreamsCanvas
					ref={this.canvasRef}
					config={commonCanvasConfig}
				/>
			);
		} else if (this.state.selectedExampleApp === EXAMPLE_APP_BLUE_ELLIPSES) {
			firstCanvas = (
				<BlueEllipsesCanvas
					ref={this.canvasRef}
					config={commonCanvasConfig}
				/>
			);
		}

		const canvasContainerWidth = this.isSidePanelOpen() === false ? "100%" : "calc(100% - " + SIDE_PANEL.MAXIMIXED + ")";

		let commonCanvas;
		if (this.state.selectedExtraCanvasDisplayed === true) {
			commonCanvas = (
				<div className="harness-canvas-container double" style={{ width: canvasContainerWidth }}>
					<div className="harness-canvas-single">
						{firstCanvas}
					</div>
					<div className="harness-canvas-single">
						<CommonCanvas
							config={commonCanvasConfig2}
							contextMenuHandler={this.contextMenuHandler}
							editActionHandler= {this.extraCanvasEditActionHandler}
							clickActionHandler= {this.extraCanvasClickActionHandler}
							toolbarConfig={this.toolbarConfig}
							canvasController={this.canvasController2}
							notificationConfig={this.state.notificationConfig2}
							rightFlyoutContent={rightFlyoutContent2}
							showRightFlyout={showRightFlyoutProperties2}
							selectionChangeHandler={this.selectionChangeHandler2}
						/>
					</div>
				</div>);
		} else {
			commonCanvas = (
				<div className="harness-canvas-container" style={{ width: canvasContainerWidth }}>
					{firstCanvas}
				</div>);
		}

		const sidePanelCanvasConfig = {
			setDiagramJSON: this.setDiagramJSON,
			setPaletteJSON: this.setPaletteJSON,
			setDiagramJSON2: this.setDiagramJSON2,
			setPaletteJSON2: this.setPaletteJSON2,
			canvasFileChooserVisible: this.state.canvasFileChooserVisible,
			canvasFileChooserVisible2: this.state.canvasFileChooserVisible2,
			paletteFileChooserVisible: this.state.paletteFileChooserVisible,
			paletteFileChooserVisible2: this.state.paletteFileChooserVisible2,
			setCanvasDropdownFile: this.setCanvasDropdownFile,
			setCanvasDropdownFile2: this.setCanvasDropdownFile2,
			selectedCanvasDropdownFile: this.state.selectedCanvasDropdownFile,
			selectedCanvasDropdownFile2: this.state.selectedCanvasDropdownFile2,
			setPaletteDropdownSelect: this.setPaletteDropdownSelect,
			setPaletteDropdownSelect2: this.setPaletteDropdownSelect2,
			selectedPaletteDropdownFile: this.state.selectedPaletteDropdownFile,
			selectedPaletteDropdownFile2: this.state.selectedPaletteDropdownFile2,
			clearSavedZoomValues: this.clearSavedZoomValues
		};

		const sidePanelPropertiesConfig = {
			closePropertiesEditorDialog: this.closePropertiesEditorDialog,
			openPropertiesEditorDialog: this.openPropertiesEditorDialog,
			validateProperties: this.validateProperties,
			setPropertiesJSON: this.setPropertiesJSON,
			showPropertiesDialog: this.state.showPropertiesDialog,
			usePropertiesContainerType: this.usePropertiesContainerType,
			propertiesContainerType: this.state.propertiesContainerType,
			closeSidePanelModal: this.closeSidePanelModal,
			applyOnBlur: this.state.applyOnBlur,
			useApplyOnBlur: this.useApplyOnBlur,
			expressionBuilder: this.state.expressionBuilder,
			useExpressionBuilder: this.useExpressionBuilder,
			expressionValidate: this.state.expressionValidate,
			useExpressionValidate: this.useExpressionValidate,
			displayAdditionalComponents: this.state.displayAdditionalComponents,
			useDisplayAdditionalComponents: this.useDisplayAdditionalComponents,
			heading: this.state.heading,
			useHeading: this.useHeading,
			selectedPropertiesDropdownFile: this.state.selectedPropertiesDropdownFile,
			selectedPropertiesFileCategory: this.state.selectedPropertiesFileCategory,
			fileChooserVisible: this.state.propertiesFileChooserVisible,
			setPropertiesDropdownSelect: this.setPropertiesDropdownSelect
		};

		const sidePanelAPIConfig = {
			getCanvasInfo: this.getCanvasInfo,
			setApiSelectedOperation: this.setApiSelectedOperation,
			getPipelineFlow: this.getPipelineFlow,
			setPipelineFlow: this.setPipelineFlow,
			addNodeTypeToPalette: this.addNodeTypeToPalette,
			setNodeLabel: this.setNodeLabel,
			setPortLabel: this.setPortLabel,
			setNodeDecorations: this.setNodeDecorations,
			setLinkDecorations: this.setLinkDecorations,
			getZoomToReveal: this.getZoomToReveal,
			zoomCanvas: this.zoomCanvas,
			appendNotificationMessages: this.appendNotificationMessages,
			clearNotificationMessages: this.clearNotificationMessages,
			selectedOperation: this.state.apiSelectedOperation
		};

		let consoleView = null;
		if (this.state.consoleOpened) {
			consoleView = (
				<Console
					consoleOpened={this.state.consoleOpened}
					logs={this.state.consoleout}
				/>
			);
		}

		const mainView = (<div id="harness-app-container">
			{navBar}
			<SidePanel
				canvasConfig={sidePanelCanvasConfig}
				propertiesConfig={sidePanelPropertiesConfig}
				apiConfig={sidePanelAPIConfig}
				openSidepanelCanvas={this.state.openSidepanelCanvas}
				openSidepanelModal={this.state.openSidepanelModal}
				openSidepanelAPI={this.state.openSidepanelAPI}
				selectedPanel={this.state.selectedPanel}
				log={this.log}
				setStateValue={this.setStateValue}
				getStateValue={this.getStateValue}
			/>
			{ !isEmpty(this.state.propertiesInfo) ? commonPropertiesContainer : null }
			{commonCanvas}
			{consoleView}

			<ReactTooltip place="bottom" effect="solid" />
		</div>);

		return (
			<IntlProvider locale={this.locale} defaultLocale="en" messages={getMessages(this.locale, [HarnessBundles,
				CommandActionsBundles, CommonCanvasBundles, CommonPropsBundles, PaletteBundles, ToolbarBundles])}
			>
				<div>{mainView}</div>
			</IntlProvider>
		);
	}
}

export default hot(App);
