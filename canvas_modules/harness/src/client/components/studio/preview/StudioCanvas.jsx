/*
 * Copyright 2017-2026 Elyra Authors
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
import { Button, Select, SelectItem, Toggle } from "@carbon/react";
import { Close } from "@carbon/react/icons";
import { CommonCanvas, CanvasController, CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved
import propertiesGenerator from "../utils/properties-generator";

const LINK_TYPES = ["Curve", "Elbow", "Straight", "Parallax"];
const LINK_DIRECTIONS = ["LeftRight", "TopBottom", "BottomTop", "RightLeft"];
const LINK_METHODS = ["Ports", "Freeform"];
const SNAP_TYPES = ["None", "During", "After"];

export default class StudioCanvas extends React.Component {
	constructor(props) {
		super(props);
		this.canvasController = new CanvasController();
		this.state = {
			showProperties: false,
			propertiesData: null,
			propertiesNodeLabel: "",
			currentPropertiesStudioId: null,
			savedValues: {}
		};
		this.clickActionHandler = this.clickActionHandler.bind(this);
		this.editActionHandler = this.editActionHandler.bind(this);
	}

	componentDidMount() {
		if (this.props.paletteJSON) {
			this.canvasController.setPipelineFlowPalette(this.props.paletteJSON);
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.paletteJSON !== this.props.paletteJSON) {
			this.canvasController.setPipelineFlowPalette(this.props.paletteJSON);
		}
		if (prevProps.importedFlow !== this.props.importedFlow && this.props.importedFlow) {
			this.canvasController.setPipelineFlow(this.props.importedFlow);
			setTimeout(() => this.canvasController.zoomToFit(), 50);
			this.props.onFlowImported();
		}
	}

	getFlow() {
		return this.canvasController.getPipelineFlow();
	}

	getCanvasConfig() {
		const { canvasConfig } = this.props;
		return {
			enableParentClass: "studio-canvas",
			enableSnapToGridType: canvasConfig.enableSnapToGridType || "None",
			enableLinkType: canvasConfig.enableLinkType || "Curve",
			enableLinkDirection: canvasConfig.enableLinkDirection || "LeftRight",
			enableLinkMethod: canvasConfig.enableLinkMethod || "Ports",
			enablePaletteLayout: canvasConfig.enablePaletteLayout || "Flyout",
			enableNarrowPalette: Boolean(canvasConfig.enableNarrowPalette),
			paletteInitialState: true,
			enableRightFlyoutUnderToolbar: true,
			tipConfig: { palette: true, nodes: true, ports: false, links: false }
		};
	}

	clickActionHandler(source) {
		if (source.clickType === "DOUBLE_CLICK" && source.objectType === "node") {
			const node = this.canvasController.getNode(source.id, this.canvasController.getPrimaryPipelineId());
			if (node) {
				// Canvas node instances get a fresh UUID as their id — match back to the
				// node type definition via op (which equals studioId when no op was set).
				const nodeOp = node.op;
				let matchedStudioId = null;
				let nodeLabel = "";
				let matchedOp = "";
				(this.props.categories || []).forEach((cat) => {
					(cat.nodeTypes || []).forEach((nt) => {
						if ((nt.op || nt.studioId) === nodeOp) {
							matchedStudioId = nt.studioId;
							nodeLabel = nt.label;
							matchedOp = nt.op;
						}
					});
				});
				const paramDef = matchedStudioId && this.props.paramDefs && this.props.paramDefs[matchedStudioId];
				if (paramDef) {
					let propertiesData = propertiesGenerator(paramDef, nodeLabel, matchedOp);
					const saved = this.state.savedValues[matchedStudioId];
					if (saved) {
						propertiesData = {
							...propertiesData,
							current_parameters: { ...propertiesData.current_parameters, ...saved }
						};
					}
					this.setState({
						showProperties: true,
						currentPropertiesStudioId: matchedStudioId,
						propertiesNodeLabel: nodeLabel || matchedOp || "Node Properties",
						propertiesData
					});
				}
			}
		}
	}

	editActionHandler() {
		this.props.onFlowChange(this.canvasController.getPipelineFlow());
		return null;
	}

	render() {
		const { canvasConfig, onCanvasConfigChange } = this.props;
		const { showProperties, propertiesData, propertiesNodeLabel, currentPropertiesStudioId } = this.state;
		const closeProperties = () => this.setState({ showProperties: false, propertiesData: null });
		const saveProperties = (paramValues) => this.setState((prev) => ({
			savedValues: { ...prev.savedValues, [currentPropertiesStudioId]: paramValues }
		}));

		return (
			<div className="studio-canvas-column">
				<div className="studio-canvas-config">
					<div className="studio-config-row">
						<span>Snap:</span>
						<Select id="config-snap" labelText="" value={canvasConfig.enableSnapToGridType || "None"} size="sm"
							onChange={(e) => onCanvasConfigChange("enableSnapToGridType", e.target.value)}
						>
							{SNAP_TYPES.map((v) => <SelectItem key={v} value={v} text={v} />)}
						</Select>
					</div>
					<div className="studio-config-row">
						<span>Links:</span>
						<Select id="config-link-type" labelText="" value={canvasConfig.enableLinkType || "Curve"} size="sm"
							onChange={(e) => onCanvasConfigChange("enableLinkType", e.target.value)}
						>
							{LINK_TYPES.map((v) => <SelectItem key={v} value={v} text={v} />)}
						</Select>
					</div>
					<div className="studio-config-row">
						<span>Direction:</span>
						<Select id="config-link-dir" labelText="" value={canvasConfig.enableLinkDirection || "LeftRight"} size="sm"
							onChange={(e) => onCanvasConfigChange("enableLinkDirection", e.target.value)}
						>
							{LINK_DIRECTIONS.map((v) => <SelectItem key={v} value={v} text={v} />)}
						</Select>
					</div>
					<div className="studio-config-row">
						<span>Method:</span>
						<Select id="config-link-method" labelText="" value={canvasConfig.enableLinkMethod || "Ports"} size="sm"
							onChange={(e) => onCanvasConfigChange("enableLinkMethod", e.target.value)}
						>
							{LINK_METHODS.map((v) => <SelectItem key={v} value={v} text={v} />)}
						</Select>
					</div>
					<div className="studio-config-row">
						<Toggle
							id="config-narrow-palette"
							labelText="Narrow palette"
							toggled={Boolean(canvasConfig.enableNarrowPalette)}
							size="sm"
							onToggle={(v) => onCanvasConfigChange("enableNarrowPalette", v)}
						/>
					</div>
				</div>

				<div className="studio-canvas-preview">
					<CommonCanvas
						canvasController={this.canvasController}
						config={this.getCanvasConfig()}
						clickActionHandler={this.clickActionHandler}
						editActionHandler={this.editActionHandler}
						rightFlyoutContent={showProperties && propertiesData ? (
							<div className="studio-flyout-panel">
								<div className="studio-flyout-header">
									<span className="studio-flyout-title">{propertiesNodeLabel}</span>
									<button
										type="button"
										className="studio-flyout-close-btn"
										aria-label="Close"
										title="Close"
										onClick={closeProperties}
									>
										<Close size={16} />
									</button>
								</div>
								<CommonProperties
									propertiesInfo={{ parameterDef: propertiesData }}
									propertiesConfig={{ containerType: "Custom", rightFlyout: true, applyOnBlur: true }}
									callbacks={{ closePropertiesDialog: closeProperties, applyPropertyChanges: saveProperties }}
								/>
								<div className="studio-flyout-footer">
									<Button kind="secondary" onClick={closeProperties}>Cancel</Button>
									<Button kind="primary" onClick={closeProperties}>Save</Button>
								</div>
							</div>
						) : null}
						showRightFlyout={showProperties && propertiesData !== null}
					/>
				</div>
			</div>
		);
	}
}

StudioCanvas.propTypes = {
	paletteJSON: PropTypes.object,
	paramDefs: PropTypes.object,
	categories: PropTypes.array,
	canvasConfig: PropTypes.object.isRequired,
	onCanvasConfigChange: PropTypes.func.isRequired,
	importedFlow: PropTypes.object,
	onFlowChange: PropTypes.func.isRequired,
	onFlowImported: PropTypes.func.isRequired
};
