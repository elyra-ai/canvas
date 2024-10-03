/*
 * Copyright 2017-2023 Elyra Authors
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
import { CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved
import { isEmpty } from "lodash";
import FormsService from "../../../services/FormsService";
import { PARAMETER_DEFS, CUSTOM } from "../../../constants/harness-constants.js";
import CustomTableControl from "../../../components/custom-controls/CustomTableControl";

export default class FlowsProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPropertiesDialog: false,
			propertiesInfo: {},
			light: true
		};
		this.availableParamDefs = [];
		this.getNodeForm = this.getNodeForm.bind(this);
		this.getPropertyDefName = this.getPropertyDefName.bind(this);
		this.applyPropertyChanges = this.applyPropertyChanges.bind(this);
		this.closePropertiesEditorDialog = this.closePropertiesEditorDialog.bind(this);
	}
	componentDidMount() {
		const that = this;
		FormsService.getFiles(PARAMETER_DEFS)
			.then(function(res) {
				that.availableParamDefs = res;
			});
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
				callback(response);
			});
	}

	getPropertyDefName(node) {
		if (node.op) {
			const foundName = this.availableParamDefs.find((name) => name.startsWith(node.op));
			if (foundName) {
				return {
					fileName: foundName,
					type: PARAMETER_DEFS
				};
			}
		}
		return {
			fileName: "default.json",
			type: PARAMETER_DEFS
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
			showAlertsTab: true,
			returnValueFiltering: [],
			maxLengthForMultiLineControls: 1024,
			maxLengthForSingleLineControls: 128,
			locale: "en",
			iconSwitch: false
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

	editNodeHandler(nodeId, activePipelineId) {
		const canvasController = this.props.canvasController;
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
		this.props.canvasController.setSelections([]); // clear selection
		this.setState({ showPropertiesDialog: false, propertiesInfo: {} });
	}

	applyPropertyChanges(form, appData, additionalInfo, undoInfo, uiProperties) {
		if (appData && appData.nodeId) {
			const canvasController = this.props.canvasController;

			// store parameters in case properties were opened from canvas
			canvasController.setNodeParameters(appData.nodeId, form, appData.pipelineId);
			canvasController.setNodeLabel(appData.nodeId, additionalInfo.title, appData.pipelineId);
			canvasController.setNodeMessages(appData.nodeId, additionalInfo.messages, appData.pipelineId);
			canvasController.setNodeUiParameters(appData.nodeId, uiProperties, appData.pipelineId);
		}
	}

	render() {
		if (!this.state.showPropertiesDialog) {
			return null;
		}

		return this.getCommonProperties();
	}

}
FlowsProperties.propTypes = {
	canvasController: PropTypes.object
};
