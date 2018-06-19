/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* eslint complexity: ["error", 16] */
/* eslint max-len: ["error", 200] */
/* eslint no-alert: "off" */

import React from "react";
import Isvg from "react-inlinesvg";
import ReactTooltip from "react-tooltip";
import ReactFileDownload from "react-file-download";
import { IntlProvider, FormattedMessage, addLocaleData, injectIntl, intlShape } from "react-intl";
import en from "react-intl/locale-data/en";
var i18nData = require("../intl/en.js");
import isEmpty from "lodash/isEmpty";

import { CommonCanvas, CanvasController, CommonProperties, FlowValidation } from "common-canvas";

import Console from "./components/console.jsx";
import SidePanel from "./components/sidepanel.jsx";
import TestService from "./services/TestService";
import NodeToForm from "./NodeToForm/node-to-form";

import CustomSliderPanel from "./components/custom-panels/CustomSliderPanel";
import CustomTogglePanel from "./components/custom-panels/CustomTogglePanel";
import CustomMapPanel from "./components/custom-panels/CustomMapPanel";
import CustomButtonPanel from "./components/custom-panels/CustomButtonPanel";
import CustomDatasetsPanel from "./components/custom-panels/CustomDatasetsPanel";
import CustomToggleControl from "./components/custom-controls/CustomToggleControl";
import CustomTableControl from "./components/custom-controls/CustomTableControl";
import AddtlCmptsTest from "./components/custom-components/AddtlCmptsTest";

import CustomOpMax from "./custom/condition-ops/customMax";

import BlankCanvasImage from "../../assets/images/blank_canvas.svg";

import {
	SIDE_PANEL_CANVAS,
	SIDE_PANEL_MODAL,
	SIDE_PANEL_API,
	SIDE_PANEL,
	CHOOSE_FROM_LOCATION,
	PORTS_CONNECTION,
	VERTICAL_FORMAT,
	CURVE_LINKS,
	CUSTOM,
	FLYOUT,
	NONE,
	INPUT_PORT,
	OUTPUT_PORT,
	NOTIFICATION_MESSAGE_TYPE,
	FORMS,
	PARAMETER_DEFS
} from "./constants/constants.js";

import listview32 from "../graphics/list-view_32.svg";
import download32 from "../graphics/save_32.svg";
import justify32 from "../graphics/justify_32.svg";
import api32 from "../graphics/api_32.svg";
import template32 from "ibm-design-icons/dist/svg/object-based/template_32.svg";
import FormsService from "./services/FormsService";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			consoleout: [],
			consoleOpened: false,
			contextMenuInfo: {},
			internalObjectModel: true,
			propertiesContainerType: FLYOUT,
			openSidepanelCanvas: false,
			openSidepanelModal: false,
			openSidepanelAPI: false,
			paletteNavEnabled: false,
			paletteOpened: false,
			propertiesInfo: {},
			propertiesInfo2: {},
			propertiesJson: null,
			selectedPanel: null,
			selectedLayout: NONE,
			selectedConnectionType: PORTS_CONNECTION,
			selectedNodeFormat: VERTICAL_FORMAT,
			selectedLinkType: CURVE_LINKS,
			selectedPaletteLayout: FLYOUT,
			showContextMenu: false,
			showPropertiesDialog: false,
			showPropertiesDialog2: false,
			tipConfig: {
				"palette": true,
				"nodes": true,
				"ports": true,
				"links": true
			},
			extraCanvasDisplayed: false,
			displayAdditionalComponents: false,
			applyOnBlur: true,
			validateFlowOnOpen: true,
			narrowPalette: true,
			schemaValidationEnabled: true,
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
			apiSelectedOperation: "",
			selectedPropertiesDropdownFile: "",
			propertiesFileChooserVisible: false
		};

		// There are several functions and variables with the identifiers name and name2. This is needed
		// to support two canvases displayed in the test harness simultaneously.
		this.currentEditorId = null;
		this.currentEditorId2 = null;

		this.openConsole = this.openConsole.bind(this);
		this.log = this.log.bind(this);

		this.download = this.download.bind(this);
		this.postUndoRedo = this.postUndoRedo.bind(this);

		this.enableNavPalette = this.enableNavPalette.bind(this);
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

		this.sidePanelCanvas = this.sidePanelCanvas.bind(this);
		this.sidePanelModal = this.sidePanelModal.bind(this);
		this.sidePanelAPI = this.sidePanelAPI.bind(this);
		this.closeSidePanelModal = this.closeSidePanelModal.bind(this);
		this.setCanvasDropdownFile = this.setCanvasDropdownFile.bind(this);
		this.setCanvasDropdownFile2 = this.setCanvasDropdownFile2.bind(this);
		this.setPaletteDropdownSelect = this.setPaletteDropdownSelect.bind(this);
		this.setPaletteDropdownSelect2 = this.setPaletteDropdownSelect2.bind(this);
		this.setLayoutDirection = this.setLayoutDirection.bind(this);
		this.useInternalObjectModel = this.useInternalObjectModel.bind(this);
		this.useApplyOnBlur = this.useApplyOnBlur.bind(this);
		this.useDisplayAdditionalComponents = this.useDisplayAdditionalComponents.bind(this);
		this.setNarrowPalette = this.setNarrowPalette.bind(this);
		this.schemaValidation = this.schemaValidation.bind(this);
		this.usePropertiesContainerType = this.usePropertiesContainerType.bind(this);
		this.setConnectionType = this.setConnectionType.bind(this);
		this.setNodeFormatType = this.setNodeFormatType.bind(this);
		this.setLinkType = this.setLinkType.bind(this);
		this.setPaletteLayout = this.setPaletteLayout.bind(this);
		this.getPipelineFlow = this.getPipelineFlow.bind(this);
		this.setPipelineFlow = this.setPipelineFlow.bind(this);
		this.setTipConfig = this.setTipConfig.bind(this);
		this.showExtraCanvas = this.showExtraCanvas.bind(this);
		this.validateFlowOnOpen = this.validateFlowOnOpen.bind(this);
		this.addNodeTypeToPalette = this.addNodeTypeToPalette.bind(this);
		this.getCanvasInfo = this.getCanvasInfo.bind(this);
		this.setNodeLabel = this.setNodeLabel.bind(this);
		this.setPortLabel = this.setPortLabel.bind(this);

		// common-canvas
		this.contextMenuHandler = this.contextMenuHandler.bind(this);
		this.contextMenuActionHandler = this.contextMenuActionHandler.bind(this);
		this.toolbarMenuActionHandler = this.toolbarMenuActionHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
		this.extraCanvasActionHandler = this.extraCanvasActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.extraCanvasClickActionHandler = this.extraCanvasClickActionHandler.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.selectionChangeHandler = this.selectionChangeHandler.bind(this);
		this.selectionChangeHandler2 = this.selectionChangeHandler2.bind(this);
		this.tipHandler = this.tipHandler.bind(this);

		this.applyDiagramEdit = this.applyDiagramEdit.bind(this);
		this.validateFlow = this.validateFlow.bind(this);
		this.getNodeForm = this.getNodeForm.bind(this);
		this.refreshContent = this.refreshContent.bind(this);

		// common-properties
		this.openPropertiesEditorDialog = this.openPropertiesEditorDialog.bind(this);
		this.closePropertiesEditorDialog = this.closePropertiesEditorDialog.bind(this);
		this.closePropertiesEditorDialog2 = this.closePropertiesEditorDialog2.bind(this);
		this.setPropertiesDropdownSelect = this.setPropertiesDropdownSelect.bind(this);
		// properties callbacks
		this.applyPropertyChanges = this.applyPropertyChanges.bind(this);
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
	}

	componentDidMount() {
		addLocaleData(en);
		var sessionData = {
			events: {},
			canvas: this.canvasController.getCanvasInfo()
		};
		if (this.state.extraCanvasDisplayed) {
			sessionData.canvas2 = this.canvasController2.getCanvasInfo();
		}
		TestService.postSessionData(sessionData);
		NodeToForm.initialize();
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

	setPropertiesDropdownSelect(selectedPropertiesDropdownFile, selectedFileCategory) {
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
				propertiesFileChooserVisible: false
			}, function() {
				that.log("Submit common properties file", that.state.selectedPropertiesDropdownFile);
				if (selectedFileCategory === PARAMETER_DEFS) {
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

	getLabelString(labelId, defaultLabel) {
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultLabel });
	}

	getLabel(labelId, defaultLabel) {
		return (<FormattedMessage id={ labelId } defaultMessage={ defaultLabel } />);
	}

	getNodeForm(nodeId, pipelineId, canvasController) {
		// if pipelineId is not passed in it will default to the main pipeline being viewed.
		let nodeForm = NodeToForm.getNodeForm(nodeId);
		// if form for node is not loaded then load it and get it.
		if (!nodeForm) {
			NodeToForm.setNodeForm(nodeId, canvasController.getNode(nodeId, pipelineId).operator_id_ref);
			nodeForm = NodeToForm.getNodeForm(nodeId);
		}
		return nodeForm;
	}

	setDiagramJSON(canvasJson) {
		this.canvasController.getCommandStack().clearCommandStack();
		NodeToForm.clearNodeForms();
		if (canvasJson) {
			this.canvasController.setPipelineFlow(canvasJson);
			NodeToForm.setNodeForms(this.canvasController.getNodes());
			if (this.state.validateFlowOnOpen) {
				FlowValidation.validateFlow(this.canvasController, this.getNodeForm);
			}
			this.setFlowNotificationMessages();
			TestService.postCanvas(canvasJson);
			this.log("Canvas diagram set");
		} else {
			this.log("Canvas diagram cleared");
		}
	}

	setDiagramJSON2(canvasJson) {
		this.canvasController2.getCommandStack().clearCommandStack();
		NodeToForm.clearNodeForms();
		if (canvasJson) {
			this.canvasController2.setPipelineFlow(canvasJson);
			NodeToForm.setNodeForms(this.canvasController2.getNodes());
			FlowValidation.validateFlow(this.canvasController2, this.getNodeForm);
			this.setFlowNotificationMessages2();
			TestService.postCanvas2(canvasJson);
			this.log("Canvas diagram set 2");
		} else {
			this.log("Canvas diagram cleared 2");
		}
	}

	setFlowNotificationMessages() {
		const notificationMessages = [];
		const nodeMessages = this.canvasController.getFlowMessages();
		for (const nodeId in nodeMessages) {
			if (nodeMessages.hasOwnProperty(nodeId)) {
				const node = nodeMessages[nodeId];
				const errors = node.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.ERROR;
				});

				const warnings = node.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.WARNING;
				});

				const type = errors.length > 0 ? NOTIFICATION_MESSAGE_TYPE.ERROR : NOTIFICATION_MESSAGE_TYPE.WARNING;
				let generatedMessage = this.canvasController.getNode(nodeId).label + " node has ";
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
					title: this.canvasController.getNode(nodeId).label,
					type: type,
					content: generatedMessage,
					callback: this.notificationmessageCallback.bind(this, nodeId, false)
				};

				notificationMessages.push(summarizedMessage);
			}
		}
		this.flowNotificationMessages = notificationMessages;
		this.setNotificationMessages(this.flowNotificationMessages.concat(this.harnessNotificationMessages));
	}

	setNotificationMessages(messages) {
		this.canvasController.setNotificationMessages(messages);
		this.log("Set Notification Message", "Set " + messages.length + " notification messages");
	}

	setFlowNotificationMessages2() {
		const notificationMessages = [];
		const nodeMessages = this.canvasController2.getFlowMessages();
		for (const nodeId in nodeMessages) {
			if (nodeMessages.hasOwnProperty(nodeId)) {
				const node = nodeMessages[nodeId];
				const errors = node.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.ERROR;
				});

				const warnings = node.filter(function(message) {
					return message.type === NOTIFICATION_MESSAGE_TYPE.WARNING;
				});

				const type = errors.length > 0 ? NOTIFICATION_MESSAGE_TYPE.ERROR : NOTIFICATION_MESSAGE_TYPE.WARNING;
				let generatedMessage = this.canvasController2.getNode(nodeId).label + " node has ";
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
					title: this.canvasController2.getNode(nodeId).label,
					type: type,
					content: generatedMessage,
					callback: this.notificationmessageCallback.bind(this, nodeId, true)
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

	setLayoutDirection(selectedLayout) {
		this.canvasController.setFixedAutoLayout(selectedLayout);
		this.canvasController2.setFixedAutoLayout(selectedLayout);
		this.setState({ selectedLayout: selectedLayout });
		this.log("Layout selected", selectedLayout);
	}

	setConnectionType(selectedConnectionType) {
		this.setState({ selectedConnectionType: selectedConnectionType });
		this.log("Connection Type selected", selectedConnectionType);
	}

	setNodeFormatType(selectedNodeFormat) {
		this.setState({ selectedNodeFormat: selectedNodeFormat });
		this.log("Node Format selected", selectedNodeFormat);
	}

	setLinkType(selectedLinkType) {
		this.setState({ selectedLinkType: selectedLinkType });
		this.log("Link type selected", selectedLinkType);
	}

	setPaletteLayout(selectedPaletteLayout) {
		this.setState({ selectedPaletteLayout: selectedPaletteLayout });
		this.log("Palette Layout selected", selectedPaletteLayout);
	}

	setNarrowPalette(enabled) {
		this.setState({ narrowPalette: enabled });
		this.log("show narrow palette", enabled);
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

	setTipConfig(newTipConfig) {
		this.setState({ tipConfig: newTipConfig });
		this.log("Set tip config", newTipConfig);
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

	schemaValidation(enabled) {
		this.setState({ schemaValidationEnabled: enabled });
		this.log("Schema validation enabled ", enabled);
	}

	appendNotificationMessages(message) {
		this.harnessNotificationMessages = this.harnessNotificationMessages.concat(message);
		this.canvasController.setNotificationMessages(this.flowNotificationMessages.concat(this.harnessNotificationMessages));
		this.log("Set Notification Messages", "Set " + (this.flowNotificationMessages + this.harnessNotificationMessages.length) + " notification messages");
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
	notificationmessageCallback(nodeId, inExtraCanvas) {
		if (inExtraCanvas) {
			this.canvasController2.setSelections([nodeId]);
			this.canvasController2.closeNotificationPanel();
			this.editNodeHandler(nodeId, inExtraCanvas);
		} else {
			this.canvasController.setSelections([nodeId]);
			this.canvasController.closeNotificationPanel();
			this.editNodeHandler(nodeId);
		}
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

	log(evt, data, content) {
		var event = {
			"timestamp": new Date().toLocaleString(),
			"event": evt,
			"data": data,
			"content": content
		};
		var that = this;
		this.setState((state) => {
			state.consoleout = state.consoleout.concat(event);
			return state;
		}, function() {
			var sessionData = {
				events: that.state.consoleout,
				canvas: that.canvasController.getCanvasInfo()
			};
			if (that.state.extraCanvasDisplayed) {
				sessionData.canvas2 = that.canvasController2.getCanvasInfo();
			}
			TestService.postSessionData(sessionData);
		});
		var objDiv = document.getElementById("app-console");
		objDiv.scrollTop = objDiv.scrollHeight;
	}

	openConsole() {
		this.setState({ consoleOpened: !this.state.consoleOpened });
	}

	download() {
		var canvas = JSON.stringify(this.getPipelineFlow(), null, 2);
		ReactFileDownload(canvas, "canvas.json");
	}

	postUndoRedo() {
		var sessionData = {
			events: this.state.consoleout,
			canvas: this.canvasController.getCanvasInfo()
		};
		if (this.state.extraCanvasDisplayed) {
			sessionData.canvas2 = this.canvasController2.getCanvasInfo();
		}
		TestService.postSessionData(sessionData);
	}

	enableNavPalette(enabled) {
		this.setState({ paletteNavEnabled: enabled });
		// this.log("palette in nav bar enabled: " + enabled);
	}

	useInternalObjectModel(enabled) {
		this.setState({ internalObjectModel: enabled });
		this.log("use internal object model", enabled);
	}

	useApplyOnBlur(enabled) {
		this.setState({ applyOnBlur: enabled });
		this.log("apply changes on blur", enabled);
	}

	useDisplayAdditionalComponents(enabled) {
		this.setState({ displayAdditionalComponents: enabled });
		this.log("additional components display", enabled);
	}

	showExtraCanvas(enabled) {
		this.setState({ extraCanvasDisplayed: enabled });
		this.log("show extra canvas", enabled);
	}

	validateFlowOnOpen(enabled) {
		this.setState({ validateFlowOnOpen: enabled });
	}

	usePropertiesContainerType(type) {
		this.setState({ propertiesContainerType: type });
		this.log("set properties container", type);
	}

	// common-canvas
	clickActionHandler(source) {
		this.log("clickActionHandler()", source);
		if (source.clickType === "DOUBLE_CLICK" &&
				source.objectType === "node") {
			this.editNodeHandler(source.id);
		}
	}

	extraCanvasClickActionHandler(source) {
		this.log("extraCanvasClickActionHandler()", source);
		if (source.clickType === "DOUBLE_CLICK" &&
				source.objectType === "node") {
			this.editNodeHandler(source.id, true);
		}
	}

	applyDiagramEdit(data, options) {
		this.log("applyDiagramEdit()", data.editType);
	}

	applyPropertyChanges(form, appData, additionalInfo, undoInfo) {
		const data = {
			form: form,
			appData: appData,
			messages: additionalInfo.messages,
			title: additionalInfo.title
		};
		this.log("applyPropertyChanges()", data);

		if (appData && appData.nodeId) {
			const currentEditorNodeId = (appData.inExtraCanvas) ? this.currentEditorId2 : this.currentEditorId;
			const canvasController = (appData.inExtraCanvas) ? this.canvasController2 : this.canvasController;
			const propertiesController = (appData.inExtraCanvas) ? this.propertiesController2 : this.propertiesController;

			// store parameters in case properties were opened from canvas
			canvasController.setNodeParameters(appData.nodeId, form);
			canvasController.setNodeLabel(appData.nodeId, additionalInfo.title);
			canvasController.setNodeMessages(appData.nodeId, additionalInfo.messages);

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

	helpClickHandler(nodeTypeId, helpData, appData) {
		this.log("helpClickHandler()", { nodeTypeId, helpData, appData });
	}

	validateFlow(source) {
		FlowValidation.validateFlow(this.canvasController, this.getNodeForm);
		this.setFlowNotificationMessages();
	}

	contextMenuHandler(source) {
		const EDIT_SUB_MENU = [
			{ action: "cut", label: this.getLabel("edit-context.cutSelection", "Cut") },
			{ action: "copy", label: this.getLabel("edit-context.copySelection", "Copy") }
		];

		const NODE_CONTEXT_MENU = [
			{ action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
			{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
			{ action: "previewNode", label: this.getLabel("node-context.previewNode", "Preview") },
			{ divider: true },
			{ submenu: true, label: this.getLabelString("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
			{ divider: true },
			{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
			{ divider: true },
			{ action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const APPLY_MODEL_NODE_CONTEXT_MENU = [
			{ action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
			{ action: "viewModel", label: this.getLabel("node-context.viewModel", "View Model") },
			{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
			{ action: "previewNode", label: this.getLabel("node-context.previewNode", "Preview") },
			{ divider: true },
			{ submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
			{ divider: true },
			{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
			{ divider: true },
			{ action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const SUPER_NODE_CONTEXT_MENU = [
			{ action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
			{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
			{ divider: true },
			{ submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
			{ divider: true },
			{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
			{ divider: true },
			{ action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const EXPAND_SUPER_NODE_CONTEXT_MENU = [
			{ divider: true },
			{ action: "expandSuperNodeInPlace", label: this.getLabel("node-context.expandSuperNodeInPlace", "Expand supernode") }
		];

		const COLLAPSE_SUPER_NODE_CONTEXT_MENU = [
			{ divider: true },
			{ action: "collapseSuperNodeInPlace", label: this.getLabel("node-context.collapseSuperNodeInPlace", "Collapse supernode") }
		];

		const MULTI_SELECT_CONTEXT_MENU = [
			{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
			{ divider: true },
			{ submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
			{ divider: true },
			{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") }
		];

		const EMPTY_CLIPBOARD_CANVAS_CONTEXT_MENU = [
			{ action: "addComment", label: this.getLabel("canvas-context.addComment", "New comment") },
			{ action: "selectAll", label: this.getLabel("canvas-context.selectAll", "Select All") },
			{ divider: true },
			{ action: "cut", label: this.getLabel("edit-context.cutSelection", "Cut") },
			{ action: "copy", label: this.getLabel("edit-context.copySelection", "Copy") },
			{ action: "paste", label: this.getLabel("edit-context.pasteSelection", "Paste") },
			{ divider: true },
			{ action: "undo", label: this.getLabel("canvas-context.undo", "Undo") },
			{ action: "redo", label: this.getLabel("canvas-context.redo", "Redo") },
			{ divider: true },
			{ action: "validateFlow", label: this.getLabel("canvas-context.validateFlow", "Validate Flow") },
			{ action: "streamProperties", label: this.getLabel("canvas-context.streamProperties", "Options") }
		];

		const LINK_CONTEXT_MENU = [
			{ action: "deleteLink", label: this.getLabel("link-context.deleteLink", "Delete") }
		];

		const COMMENT_CONTEXT_MENU = [
			{ action: "deleteObjects", label: this.getLabel("comment-context.deleteComment", "Delete") }
		];

		const DEPLOY_CONTEXT_MENU = [
			{ action: "editNode", label: this.getLabel("node-context.editNode", "Open") },
			{ action: "disconnectNode", label: this.getLabel("node-context.disconnectNode", "Disconnect") },
			{ action: "previewNode", label: this.getLabel("node-context.previewNode", "Preview") },
			{ divider: true },
			{ submenu: true, label: this.getLabel("node-context.editMenu", "Edit"), menu: EDIT_SUB_MENU },
			{ divider: true },
			{ action: "deleteObjects", label: this.getLabel("node-context.deleteNode", "Delete") },
			{ divider: true },
			{ action: "deploy", label: this.getLabel("node-context.deploy", "Deploy") },
			{ divider: true },
			{ action: "executeNode", label: this.getLabel("node-context.executeNode", "Execute") }
		];

		const CREATE_SUPERNODE_MENU = [
			{ divider: true },
			{ action: "createSuperNode", label: this.getLabel("node-context.createSuperNode", "Create supernode") }
		];

		let menuDefinition = null;
		if (source.type === "canvas") {
			menuDefinition = EMPTY_CLIPBOARD_CANVAS_CONTEXT_MENU;
		} else if (source.type === "link") {
			if (!source.targetObject || source.targetObject.type !== "associationLink") {
				menuDefinition = LINK_CONTEXT_MENU;
			}
		} else if (source.type === "node") {
			if (source.selectedObjectIds) {
				if (source.selectedObjectIds.length > 1) {
					menuDefinition = MULTI_SELECT_CONTEXT_MENU;
				} else if (source.targetObject.containsModel === true) {
					menuDefinition = APPLY_MODEL_NODE_CONTEXT_MENU;
				} else if (source.targetObject.type === "super_node") {
					menuDefinition = SUPER_NODE_CONTEXT_MENU;
					if (this.canvasController.isSuperNodeExpandedInPlace(source.targetObject.id, source.pipelineId)) {
						menuDefinition = menuDefinition.concat(COLLAPSE_SUPER_NODE_CONTEXT_MENU);
					} else {
						menuDefinition = menuDefinition.concat(EXPAND_SUPER_NODE_CONTEXT_MENU);
					}
				} else if (source.targetObject &&
					source.targetObject.userData &&
					source.targetObject.userData.deployable &&
					(source.targetObject.userData.deployable === true)) {
					menuDefinition = DEPLOY_CONTEXT_MENU;
				} else {
					menuDefinition = NODE_CONTEXT_MENU;
				}

				if (this.canvasController.areSelectedNodesContiguous()) {
					menuDefinition = menuDefinition.concat(CREATE_SUPERNODE_MENU);
				}
			}
		} else if (source.type === "comment") {
			if (source.selectedObjectIds) {
				menuDefinition = COMMENT_CONTEXT_MENU;
			}
		}

		return menuDefinition;
	}

	editActionHandler(data) {
		var type = "";
		if (data.operator_id_ref) {
			type = data.operator_id_ref;
		} else if (data.nodes) {
			if (data.nodes[0].id) {
				type = data.nodes[0].id; // Node link
			} else {
				type = data.nodes[0]; // Comment link
			}
		}

		if (data.targetNodes) {
			if (data.targetNodes[0].id) {
				type += " to " + data.targetNodes[0].id; // Node link
			} else {
				type += " to " + data.targetNodes[0]; // Comment link
			}
		}
		if (data.editType === "createNode") {
			NodeToForm.setNodeForm(data.nodeId, type);
		}

		this.log("editActionHandler() " + data.editType, type, data.label);
	}

	extraCanvasActionHandler(action, source) {
		var sessionData = {
			canvas2: this.canvasController2.getCanvasInfo()
		};
		TestService.postSessionData(sessionData);
		this.contextMenuActionHandler(action, source, true);
	}

	contextMenuActionHandler(action, source, inExtraCanvas) {
		if (action === "streamProperties") {
			this.log("action: streamProperties");
		} else if (action === "addComment") {
			this.applyDiagramEdit({
				editType: "createComment",
				label: " ",
				nodes: source.selectedObjectIds,
				offsetX: source.mousePos.x,
				offsetY: source.mousePos.y,
				width: 0,
				height: 0
			});
		} else if (action === "deleteLink") {
			this.log("action: deleteLink", source.id);
		} else if (action === "editNode") {
			this.editNodeHandler(source.targetObject.id, inExtraCanvas);
		} else if (action === "viewModel") {
			this.log("action: viewModel", source.targetObject.id);
		} else if (action === "disconnectNode") {
			this.log("action: disconnectNode", source.selectedObjectIds, source.targetObject.label);
		} else if (action === "createSuperNode") {
			this.log("action: createSuperNode", source.selectedObjectIds, source.targetObject.label);
		} else if (action === "expandSuperNodeInPlace") {
			this.log("action: expandSuperNodeInPlace", source.targetObject.id);
		} else if (action === "collapseSuperNodeInPlace") {
			this.log("action: collapseSuperNodeInPlace", source.targetObject.id);
		} else if (action === "deleteObjects") {
			this.deleteObjectsActionHandler(source);
		} else if (action === "executeNode") {
			this.log("action: executeNode", source.targetObject.id);
		} else if (action === "previewNode") {
			this.log("action: previewNode", source.targetObject.id);
		} else if (action === "deploy") {
			this.log("action: deploy", source.targetObject.id);
		} else if (action === "validateFlow") {
			this.validateFlow(source);
		}
	}

	toolbarMenuActionHandler(action, source) {
		if (action === "execute") {
			this.log("toolbar action: executeNode");
		} else if (action === "undo") {
			this.postUndoRedo();
			this.log("toolbar action: undo");
		} else if (action === "redo") {
			this.postUndoRedo();
			this.log("toolbar action: redo");
		} else if (action === "addComment") {
			this.log("toolbar action: addComment", source);
		} else if (action === "delete") {
			this.log("toolbar action: delete", source);
		}
	}

	deleteObjectsActionHandler(source) {
		if (typeof source.targetObject.label !== "undefined") {
			this.log("action: deleteObjects", source.selectedObjectIds, source.targetObject.label);
		} else if (typeof source.targetObject.content !== "undefined") {
			this.log("action: deleteObjects", source.selectedObjectIds, source.targetObject.content);
		} else {
			this.log("action: deleteObjects", source.selectedObjectIds, "");
		}
	}

	decorationActionHandler(node, id) {
		this.log("decorationHandler()", id);
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

	editNodeHandler(nodeId, inExtraCanvas) {
		this.log("action: editNode", nodeId);
		const canvasController = (inExtraCanvas) ? this.canvasController2 : this.canvasController;
		const currentEditorNodeId = (inExtraCanvas) ? this.currentEditorId2 : this.currentEditorId;
		const commonPropertiesRef = (inExtraCanvas) ? this.CommonProperties2 : this.CommonProperties;
		if (nodeId && currentEditorNodeId !== nodeId) {
			// apply properties from previous node if node selection has changed w/o closing editor
			if (currentEditorNodeId && canvasController.getNode(currentEditorNodeId)) {
				commonPropertiesRef.getWrappedInstance().applyPropertiesEditing(false);
			}
			if (inExtraCanvas) {
				this.currentEditorId2 = nodeId;
			} else {
				this.currentEditorId = nodeId;
			}
			// currentEditorNodeId = nodeId; // set new node
			const appData = { nodeId: nodeId, inExtraCanvas: inExtraCanvas };
			const properties = this.getNodeForm(nodeId, null, canvasController);

			// set current parameterSet
			// get the current parameters for the node from the internal ObjectModel
			const node = canvasController.getNode(nodeId);
			if (node) {
				if (properties.data.formData) {
					if (!isEmpty(node.parameters)) {
						properties.data.formData.data.currentParameters = node.parameters;
					}
					properties.data.formData.label = node.label;
				} else {
					if (!isEmpty(node.parameters)) {
						properties.data.current_parameters = node.parameters;
					}
					if (!properties.data.titleDefinition) {
						properties.data.titleDefinition = {};
					}
					properties.data.titleDefinition.title = node.label;
				}
			}
			const messages = canvasController.getNodeMessages(nodeId);
			const additionalComponents = this.state.displayAdditionalComponents ? { "toggle-panel": <AddtlCmptsTest /> } : properties.additionalComponents;
			const propsInfo = {
				title: <FormattedMessage id={ "dialog.nodePropertiesTitle" } />,
				messages: messages,
				formData: properties.data.formData,
				parameterDef: properties.data,
				appData: appData,
				additionalComponents: additionalComponents
			};

			if (inExtraCanvas) {
				this.setState({ showPropertiesDialog2: true, propertiesInfo2: propsInfo });
			} else {
				this.setState({ showPropertiesDialog: true, propertiesInfo: propsInfo });
			}
		}
	}

	selectionChangeHandler(data) {
		this.log("selectionChangeHandler", data);
		// apply properties from previous node if node selection has to more than one node
		if (this.currentEditorId) {
			// don't apply changes if node has been removed
			if (this.canvasController.getNode(this.currentEditorId)) {
				this.CommonProperties.getWrappedInstance().applyPropertiesEditing(false);
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
			if (this.canvasController2.getNode(this.currentEditorId2)) {
				this.CommonProperties2.getWrappedInstance().applyPropertiesEditing(false);
			}
			this.setState({ showPropertiesDialog2: false });
			this.currentEditorId2 = null;
		}
	}

	tipHandler(tipType, data) {
		if (tipType === "tipTypeLink") {
			let sourceString = "comment";
			if (data.link.src.output_ports) {
				const srcPort = !data.link.src.output_ports ? null : data.link.src.output_ports.find(function(port) {
					return port.id === data.link.srcPortId;
				});
				sourceString = `'${data.link.src.label}'` + (srcPort && srcPort.label ? `, port '${srcPort.label}'` : "");
			}

			const trgPort = data.link.trg.input_ports.find(function(port) {
				return port.id === data.link.trgPortId;
			});
			const targetString = `'${data.link.trg.label}'` + (trgPort && trgPort.label ? `, port '${trgPort.label}'` : "");

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
		const propsInfo = {
			title: <FormattedMessage id={ "dialog.nodePropertiesTitle" } />,
			formData: properties.formData,
			parameterDef: properties,
			additionalComponents: additionalComponents
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
		if (data.property) {
			this.log("propertyListener() " + data.action + ", propertyId: {name: \"" +
				data.property.name + "\", row: \"" + data.property.row + "\", col: \"" +
				data.property.col + "\"}, value: " + data.value);
		} else {
			this.log("propertyListener() " + data.action);
		}
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
			propertiesController.setDatasetMetadata(dm[0]);
		}
		this.log("propertyActionHandler() " + actionId);
	}

	render() {
		var locale = "en";
		var messages = i18nData.messages;

		var navBar = (<div className="app-navbar">
			<ul className="app-navbar-items">
				<li className="navbar-li">
					<span className="harness-title">Canvas Testbed</span>
				</li>
				<li className="navbar-li nav-divider" data-tip="console">
					<a onClick={this.openConsole.bind(this) }>
						<Isvg id="action-bar-console"
							src={listview32}
						/>
					</a>
				</li>
				<li className="navbar-li" data-tip="download">
					<a onClick={this.download.bind(this) }>
						<Isvg id="action-bar-download"
							src={download32}
						/>
					</a>
				</li>
				<li className="navbar-li nav-divider action-bar-sidepanel"
					id="action-bar-sidepanel-api"	data-tip="API"
				>
					<a onClick={this.sidePanelAPI.bind(this) }>
						<Isvg id="action-bar-panel-api"
							src={api32}
						/>
					</a>
				</li>
				<li className="navbar-li action-bar-sidepanel"
					id="action-bar-sidepanel-modal" data-tip="Common Properties Modal"
				>
					<a onClick={this.sidePanelModal.bind(this) }>
						<Isvg id="action-bar-panel-modal"
							src={template32}
						/>
					</a>
				</li>
				<li className="navbar-li nav-divider action-bar-sidepanel"
					id="action-bar-sidepanel-canvas"	data-tip="Common Canvas"
				>
					<a onClick={this.sidePanelCanvas.bind(this) }>
						<Isvg id="action-bar-panel"
							src={justify32}
						/>
					</a>
				</li>
			</ul>
		</div>);

		var emptyCanvasDiv = (
			<div>
				<img src={BlankCanvasImage} className="empty-harness-image" />
				<span className="empty-harness-text">Welcome to the Common Canvas test harness.<br />Your flow is empty!</span>
				<span className="empty-harness-link"
					onClick={this.handleEmptyCanvasLinkClick}
				>Click here to take a tour</span>
			</div>);

		var commonCanvasConfig = {
			enableConnectionType: this.state.selectedConnectionType,
			enableNodeFormatType: this.state.selectedNodeFormat,
			enableLinkType: this.state.selectedLinkType,
			enableInternalObjectModel: this.state.internalObjectModel,
			enablePaletteLayout: this.state.selectedPaletteLayout,
			emptyCanvasContent: emptyCanvasDiv,
			tipConfig: this.state.tipConfig,
			schemaValidation: this.state.schemaValidationEnabled,
			enableNarrowPalette: this.state.narrowPalette
		};

		var commonCanvasConfig2 = {
			enableConnectionType: this.state.selectedConnectionType,
			enableNodeFormatType: this.state.selectedNodeFormat,
			enableLinkType: this.state.selectedLinkType,
			enableInternalObjectModel: this.state.internalObjectModel,
			enablePaletteLayout: this.state.selectedPaletteLayout,
			emptyCanvasContent: emptyCanvasDiv,
			tipConfig: this.state.tipConfig,
			schemaValidation: this.state.schemaValidationEnabled,
			enableNarrowPalette: this.state.narrowPalette
		};

		var layoutAction = this.state.selectedLayout === NONE;

		var toolbarConfig = [
			{ action: "palette", label: "Palette", enable: true },
			{ divider: true },
			{ action: "stop", label: "Stop Execution", enable: false },
			{ action: "run", label: "Run Pipeline", enable: false },
			{ divider: true },
			{ action: "undo", label: "Undo", enable: true },
			{ action: "redo", label: "Redo", enable: true },
			{ action: "cut", label: "Cut", enable: true },
			{ action: "copy", label: "Copy", enable: true },
			{ action: "paste", label: "Paste", enable: true },
			{ action: "addComment", label: "Add Comment", enable: true },
			{ action: "delete", label: "Delete", enable: true },
			{ action: "arrangeHorizontally", label: "Arrange Horizontally", enable: layoutAction },
			{ action: "arrangeVertically", label: "Arrange Vertically", enable: layoutAction }
		];

		const notificationConfig = { action: "notification", label: "Notifications", enable: true, notificationHeader: "Notifications" };
		const notificationConfig2 = { action: "notification", label: "Notifications", enable: true, notificationHeader: "Notifications Canvas 2" };

		const propertiesConfig = {
			containerType: this.state.propertiesContainerType === FLYOUT ? CUSTOM : this.state.propertiesContainerType,
			rightFlyout: this.state.propertiesContainerType === FLYOUT,
			applyOnBlur: this.state.applyOnBlur,
		};
		const callbacks = {
			controllerHandler: this.propertiesControllerHandler,
			propertyListener: this.propertyListener,
			actionHandler: this.propertyActionHandler,
			applyPropertyChanges: this.applyPropertyChanges,
			closePropertiesDialog: this.closePropertiesEditorDialog,
			helpClickHandler: this.helpClickHandler
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
				customPanels={[CustomSliderPanel, CustomTogglePanel, CustomMapPanel, CustomButtonPanel, CustomDatasetsPanel]}
				callbacks={callbacks}
				customControls={[CustomToggleControl, CustomTableControl]}
				customConditionOps={[CustomOpMax]}
			/>);

		const commonProperties2 = (
			<CommonProperties
				ref={(instance) => {
					this.CommonProperties2 = instance;
				} }
				propertiesInfo={this.state.propertiesInfo2}
				propertiesConfig={propertiesConfig}
				customPanels={[CustomSliderPanel, CustomTogglePanel, CustomMapPanel, CustomButtonPanel, CustomDatasetsPanel]}
				callbacks={callbacks2}
				customControls={[CustomToggleControl, CustomTableControl]}
				customConditionOps={[CustomOpMax]}
			/>);


		let commonPropertiesContainer = null;
		let rightFlyoutContent = null;
		let rightFlyoutContent2 = null;
		let showRightFlyoutProperties = false;
		let showRightFlyoutProperties2 = false;
		if (this.state.propertiesContainerType === FLYOUT) {
			rightFlyoutContent = commonProperties;
			rightFlyoutContent2 = commonProperties2;
			showRightFlyoutProperties = this.state.showPropertiesDialog && this.state.propertiesContainerType === FLYOUT;
			showRightFlyoutProperties2 = this.state.showPropertiesDialog2 && this.state.propertiesContainerType === FLYOUT;
		} else {
			commonPropertiesContainer = (<IntlProvider key="IntlProvider2" locale={ locale } messages={ messages }>
				<div id="common-properties">
					{commonProperties}
				</div>
			</IntlProvider>);
		}

		var firstCanvas = (
			<CommonCanvas
				config={commonCanvasConfig}
				contextMenuHandler={this.contextMenuHandler}
				contextMenuActionHandler= {this.contextMenuActionHandler}
				editActionHandler= {this.editActionHandler}
				clickActionHandler= {this.clickActionHandler}
				decorationActionHandler= {this.decorationActionHandler}
				selectionChangeHandler={this.selectionChangeHandler}
				tipHandler={this.tipHandler}
				toolbarConfig={toolbarConfig}
				notificationConfig={notificationConfig}
				toolbarMenuActionHandler={this.toolbarMenuActionHandler}
				rightFlyoutContent={rightFlyoutContent}
				showRightFlyout={showRightFlyoutProperties}
				closeRightFlyout={this.closePropertiesEditorDialog}
				canvasController={this.canvasController}
			/>);

		const canvasContainerWidth = this.isSidePanelOpen() === false ? "100%" : "calc(100% - " + SIDE_PANEL.MAXIMIXED + ")";

		var commonCanvas;
		if (this.state.extraCanvasDisplayed === true) {
			commonCanvas = (
				<div className="canvas-container double" style={{ width: canvasContainerWidth }}>
					<div className="canvas-single">
						{firstCanvas}
					</div>
					<div className="canvas-single">
						<CommonCanvas
							config={commonCanvasConfig2}
							contextMenuHandler={this.contextMenuHandler}
							contextMenuActionHandler= {this.extraCanvasActionHandler}
							editActionHandler= {this.extraCanvasActionHandler}
							clickActionHandler= {this.extraCanvasClickActionHandler}
							toolbarConfig={toolbarConfig}
							canvasController={this.canvasController2}
							notificationConfig={notificationConfig2}
							rightFlyoutContent={rightFlyoutContent2}
							showRightFlyout={showRightFlyoutProperties2}
							closeRightFlyout={this.closePropertiesEditorDialog2}
							selectionChangeHandler={this.selectionChangeHandler2}
						/>
					</div>
				</div>);
		} else {
			commonCanvas = (
				<div className="canvas-container" style={{ width: canvasContainerWidth }}>
					{firstCanvas}
				</div>);
		}

		const sidePanelCanvasConfig = {
			commonCanvasConfig: commonCanvasConfig,
			enableNavPalette: this.enableNavPalette,
			internalObjectModel: this.state.internalObjectModel,
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
			setLayoutDirection: this.setLayoutDirection,
			selectedLayout: this.state.selectedLayout,
			useInternalObjectModel: this.useInternalObjectModel,
			setRenderingEngine: this.setRenderingEngine,
			setConnectionType: this.setConnectionType,
			selectedConnectionType: this.state.selectedConnectionType,
			setNodeFormatType: this.setNodeFormatType,
			selectedNodeFormat: this.state.selectedNodeFormat,
			setLinkType: this.setLinkType,
			selectedLinkType: this.state.selectedLinkType,
			setPaletteLayout: this.setPaletteLayout,
			selectedPaletteLayout: this.state.selectedPaletteLayout,
			setTipConfig: this.setTipConfig,
			extraCanvasDisplayed: this.state.extraCanvasDisplayed,
			showExtraCanvas: this.showExtraCanvas,
			narrowPalette: this.state.narrowPalette,
			setNarrowPalette: this.setNarrowPalette,
			schemaValidation: this.schemaValidation,
			schemaValidationEnabled: this.state.schemaValidationEnabled,
			validateFlowOnOpen: this.state.validateFlowOnOpen,
			changeValidateFlowOnOpen: this.validateFlowOnOpen
		};

		const sidePanelPropertiesConfig = {
			closePropertiesEditorDialog: this.closePropertiesEditorDialog,
			openPropertiesEditorDialog: this.openPropertiesEditorDialog,
			setPropertiesJSON: this.setPropertiesJSON,
			showPropertiesDialog: this.state.showPropertiesDialog,
			usePropertiesContainerType: this.usePropertiesContainerType,
			propertiesContainerType: this.state.propertiesContainerType,
			closeSidePanelModal: this.closeSidePanelModal,
			applyOnBlur: this.state.applyOnBlur,
			useApplyOnBlur: this.useApplyOnBlur,
			displayAdditionalComponents: this.state.displayAdditionalComponents,
			useDisplayAdditionalComponents: this.useDisplayAdditionalComponents,
			selectedPropertiesDropdownFile: this.state.selectedPropertiesDropdownFile,
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
			appendNotificationMessages: this.appendNotificationMessages,
			clearNotificationMessages: this.clearNotificationMessages,
			selectedOperation: this.state.apiSelectedOperation
		};

		const mainView = (<div id="app-container">
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
			/>
			{/* <IntlProvider key="IntlProvider2" locale={ locale } messages={ messages }>
				{commonProperties}
			</IntlProvider>*/}
			{ !isEmpty(this.state.propertiesInfo) ? commonPropertiesContainer : null }
			<IntlProvider key="IntlProvider" locale={ locale } messages={ messages }>
				{commonCanvas}
			</IntlProvider>


			<Console
				consoleOpened={this.state.consoleOpened}
				logs={this.state.consoleout}
			/>
			<ReactTooltip place="bottom" effect="solid" />
		</div>);

		return (
			<div>{mainView}</div>
		);
	}
}

App.propTypes = {
	intl: intlShape.isRequired
};

export default injectIntl(App);
