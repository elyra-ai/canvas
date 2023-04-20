/*
 * Copyright 2017-2022 Elyra Authors
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

import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { CommonCanvas, CanvasController, CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved
import { isEmpty } from "lodash";
import FlowsCanvasFlow from "./flowsCanvas.json";
import FlowsPalette from "./flowsPalette.json";
import FlowsLoadingPalette from "./flowsLoadingPalette.json";
import FormsService from "../../../services/FormsService";
import { FORMS, PARAMETER_DEFS, CUSTOM } from "../../../constants/constants.js";
import CustomTableControl from "../../../components/custom-controls/CustomTableControl";

export default class FlowsCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPropertiesDialog: false,
			propertiesInfo: {},
			light: true
		};
		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(FlowsCanvasFlow);
		this.canvasController.setPipelineFlowPalette(FlowsLoadingPalette);
		this.availableForms = [];
		this.availableParamDefs = [];

		this.activateLoadingCanvas();

		this.getConfig = this.getConfig.bind(this);
		this.decorationActionHandler = this.decorationActionHandler.bind(this);
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.getNodeForm = this.getNodeForm.bind(this);
		this.getPropertyDefName = this.getPropertyDefName.bind(this);
		this.applyPropertyChanges = this.applyPropertyChanges.bind(this);
		this.closePropertiesEditorDialog = this.closePropertiesEditorDialog.bind(this);
	}

	componentDidMount() {
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

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "flows",
			enableNodeFormatType: "Vertical",
			enableLinkType: "Straight",
			enableLinkDirection: "LeftRight",
			enableSaveZoom: "LocalStorage",
			enableSnapToGridType: "After",
			enableLinkSelection: "None",
			enableLinkReplaceOnNewConnection: true,
			paletteInitialState: true,
			enableDropZoneOnExternalDrag: true,
			enableHighlightNodeOnNewLinkDrag: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			},
			enableNodeLayout: {
				drawNodeLinkLineFromTo: "image_center",
				drawCommentLinkLineTo: "image_center",
				defaultNodeWidth: 72,
				defaultNodeHeight: 72,
				selectionPath: "M 8 0 L 64 0 64 56 8 56 8 0",
				ellipsisWidth: 12,
				ellipsisHeight: 16,
				ellipsisPosY: -1,
				ellipsisPosX: 64.5,
				imageWidth: 48,
				imageHeight: 48,
				imagePosX: 12,
				imagePosY: 4,
				labelEditable: true,
				labelPosX: 36,
				labelPosY: 56,
				labelWidth: 120,
				labelHeight: 18,
				portRadius: 10,
				inputPortDisplay: false,
				outputPortRightPosX: 5,
				outputPortRightPosY: 30,
				outputPortObject: "image",
				outputPortImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg",
				outputPortWidth: 20,
				outputPortHeight: 20,
				outputPortGuideObject: "image",
				outputPortGuideImage: "/images/custom-canvases/flows/decorations/dragStateArrow.svg"
			},
			enableCanvasLayout: {
				dataLinkArrowHead: true,
				linkGap: 4,
				displayLinkOnOverlap: false
			}
		});
		return config;
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

	getPropertiesConfig() {
		return {
			containerType: CUSTOM,
			rightFlyout: true,
			schemaValidation: true,
			applyPropertiesWithoutEdit: false,
			applyOnBlur: false,
			convertValueDataTypes: false,
			disableSaveOnRequiredErrors: true,
			trimSpaces: true,
			heading: true,
			showRequiredIndicator: true,
			returnValueFiltering: [],
			maxLengthForMultiLineControls: 1024,
			maxLengthForSingleLineControls: 128,
			locale: "en"
		};
	}

	getCommonProperties() {
		if (isEmpty(this.state.propertiesInfo)) {
			return null;
		}

		const propertiesConfig = this.getPropertiesConfig();

		const callbacks = {
			applyPropertyChanges: this.applyPropertyChanges,
			closePropertiesDialog: this.closePropertiesEditorDialog
		};

		const commonProperties = (
			<CommonProperties
				ref={(instance) => {
					this.CommonProperties = instance;
				}}
				propertiesInfo={this.state.propertiesInfo}
				propertiesConfig={propertiesConfig}
				customControls={[CustomTableControl]}
				callbacks={callbacks}
				light={this.state.light}
			/>);

		return commonProperties;
	}

	decorationActionHandler() {
		this.canvasController.displaySubPipeline({
			pipelineId: "75ed071a-ba8d-4212-a2ad-41a54198dd6b",
			pipelineFlowId: "ac3d3e04-c3d2-4da7-ab5a-2b9573e5e159"
		});
	}

	clickActionHandler(source) {
		if (source.objectType === "node" &&
			((source.clickType === "SINGLE_CLICK" &&
				this.canvasController.getSelectedObjectIds().length === 1) ||
				(source.clickType === "DOUBLE_CLICK"))) {
			this.editNodeHandler(source.id, source.pipelineId);
		}
	}

	editNodeHandler(nodeId, activePipelineId) {
		const canvasController = this.canvasController;
		const currentEditorNodeId = this.currentEditorId;
		const commonPropertiesRef = this.CommonProperties;
		if (nodeId && currentEditorNodeId !== nodeId) {
			// apply properties from previous node if node selection has changed w/o closing editor
			if (currentEditorNodeId && canvasController.getNode(currentEditorNodeId, activePipelineId)) {
				commonPropertiesRef.applyPropertiesEditing(false);
			}

			this.currentEditorId = nodeId;
			const appData = { nodeId: nodeId, inExtraCanvas: false, pipelineId: activePipelineId };
			this.getNodeForm(nodeId, activePipelineId, canvasController, (properties) => {
				const messages = canvasController.getNodeMessages(nodeId, activePipelineId);
				const propsInfo = {
					title: <FormattedMessage id={"dialog.nodePropertiesTitle"} />,
					messages: messages,
					formData: properties.formData,
					parameterDef: properties,
					appData: appData,
					initialEditorSize: "small"
				};

				this.setState({ showPropertiesDialog: true, propertiesInfo: propsInfo });
			});
		}
	}

	closePropertiesEditorDialog() {
		this.currentEditorId = null;
		this.canvasController.setSelections([]); // clear selection
		this.setState({ showPropertiesDialog: false, propertiesInfo: {} });
	}

	applyPropertyChanges(form, appData, additionalInfo, undoInfo, uiProperties) {
		if (appData && appData.nodeId) {
			const canvasController = this.canvasController;

			// store parameters in case properties were opened from canvas
			canvasController.setNodeParameters(appData.nodeId, form, appData.pipelineId);
			canvasController.setNodeLabel(appData.nodeId, additionalInfo.title, appData.pipelineId);
			canvasController.setNodeMessages(appData.nodeId, additionalInfo.messages, appData.pipelineId);
			canvasController.setNodeUiParameters(appData.nodeId, uiProperties, appData.pipelineId);
		}
	}

	activateLoadingCanvas() {
		this.canvasController.setCategoryLoadingText("recordOp", "Loading record ops");
		this.canvasController.setCategoryLoadingText("fieldOp", "Loading field ops");
		this.canvasController.setCategoryLoadingText("modeling", "Loading modeling");
		this.canvasController.setCategoryLoadingText("TextMining", "Loading text mining");
		this.canvasController.setCategoryLoadingText("graph", "Loading graphs");
		this.canvasController.setCategoryLoadingText("output", "Loading outputs");
		this.canvasController.setCategoryLoadingText("export", "Loading exports");
		this.canvasController.setCategoryLoadingText("models", "Loading models");
		setTimeout(() => {
			this.canvasController.setPipelineFlowPalette(FlowsPalette);
		}, 3000);
	}

	render() {
		const config = this.getConfig();
		let rightFlyoutContentProperties = null;
		const showRightFlyoutProperties = this.state.showPropertiesDialog;
		if (showRightFlyoutProperties) {
			rightFlyoutContentProperties = this.getCommonProperties();
		}

		const rightFlyoutContent = rightFlyoutContentProperties
			? rightFlyoutContentProperties
			: null;

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				decorationActionHandler={this.decorationActionHandler}
				config={config}
				clickActionHandler={this.clickActionHandler}
				showRightFlyout={showRightFlyoutProperties}
				rightFlyoutContent={rightFlyoutContent}
			/>
		);
	}
}

FlowsCanvas.propTypes = {
	config: PropTypes.object
};
