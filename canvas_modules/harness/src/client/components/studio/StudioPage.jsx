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
/* eslint complexity: ["error", 20] */

import React from "react";
import { Button } from "@carbon/react";
import { Close, Download, Save, Upload } from "@carbon/react/icons";
import JavascriptFileDownload from "js-file-download";

import PaletteBuilder from "./palette-builder/PaletteBuilder";
import PropertiesBuilder from "./properties-builder/PropertiesBuilder";
import StudioCanvas from "./preview/StudioCanvas";
import paletteGenerator from "./utils/palette-generator";

const DEFAULT_CANVAS_CONFIG = {
	enableSnapToGridType: "None",
	enableLinkType: "Curve",
	enableLinkDirection: "LeftRight",
	enableLinkMethod: "Ports",
	enablePaletteLayout: "Flyout",
	enableNarrowPalette: true
};

export default class StudioPage extends React.Component {
	constructor(props) {
		super(props);
		this.studioCanvasRef = React.createRef();
		this.state = {
			categories: [],
			paramDefs: {},
			selectedNodeStudioId: null,
			canvasConfig: { ...DEFAULT_CANVAS_CONFIG },
			pipelineFlow: null,
			importedFlow: null,
			paletteCollapsed: false,
			propertiesCollapsed: false
		};
		this.handleCategoriesChange = this.handleCategoriesChange.bind(this);
		this.handleSelectNode = this.handleSelectNode.bind(this);
		this.handleNodeTypeUpdate = this.handleNodeTypeUpdate.bind(this);
		this.handleParamDefChange = this.handleParamDefChange.bind(this);
		this.handleCanvasConfigChange = this.handleCanvasConfigChange.bind(this);
		this.handleFlowChange = this.handleFlowChange.bind(this);
		this.handleFlowImported = this.handleFlowImported.bind(this);
		this.handleExport = this.handleExport.bind(this);
		this.handleImport = this.handleImport.bind(this);
		this.handleSaveToHarness = this.handleSaveToHarness.bind(this);
		this.handleDiscardAndExit = this.handleDiscardAndExit.bind(this);
	}

	componentDidMount() {
		try {
			const saved = localStorage.getItem("elyra-studio-state");
			if (saved) {
				const { categories, paramDefs, canvasConfig, pipelineFlow } = JSON.parse(saved);
				this.setState({
					categories: categories || [],
					paramDefs: paramDefs || {},
					canvasConfig: canvasConfig || { ...DEFAULT_CANVAS_CONFIG },
					pipelineFlow: pipelineFlow || null,
					importedFlow: pipelineFlow || null
				});
			}
		} catch {
			// ignore corrupt localStorage
		}
	}

	componentDidUpdate(_prevProps, prevState) {
		const { categories, paramDefs, canvasConfig, pipelineFlow } = this.state;
		if (
			prevState.categories !== categories ||
			prevState.paramDefs !== paramDefs ||
			prevState.canvasConfig !== canvasConfig ||
			prevState.pipelineFlow !== pipelineFlow
		) {
			try {
				localStorage.setItem("elyra-studio-state", JSON.stringify({ categories, paramDefs, canvasConfig, pipelineFlow }));
			} catch {
				// ignore quota errors
			}
		}
	}

	getCurrentFlow() {
		if (this.studioCanvasRef.current) {
			return this.studioCanvasRef.current.getFlow();
		}
		return this.state.pipelineFlow;
	}

	handleCategoriesChange(categories) {
		this.setState({ categories });
	}

	handleSelectNode(nodeStudioId) {
		this.setState({ selectedNodeStudioId: nodeStudioId });
	}

	handleNodeTypeUpdate(updatedNode) {
		// Keep paramDefs keyed by studioId; if op/label changes, the key stays stable
		// so properties are not lost when renaming a node
		const existing = this.state.paramDefs[updatedNode.studioId];
		if (!existing) {
			const blank = {
				titleDefinition: { title: "", editable: true },
				parameters: [], conditions: [], actions: [],
				groups: [], groupLayout: "flat", resources: {}
			};
			this.setState((prev) => ({
				paramDefs: { ...prev.paramDefs, [updatedNode.studioId]: blank }
			}));
		}
	}

	handleParamDefChange(updatedParamDef) {
		const { selectedNodeStudioId } = this.state;
		if (!selectedNodeStudioId) {
			return;
		}
		this.setState((prev) => ({
			paramDefs: { ...prev.paramDefs, [selectedNodeStudioId]: updatedParamDef }
		}));
	}

	handleCanvasConfigChange(key, value) {
		this.setState((prev) => ({
			canvasConfig: { ...prev.canvasConfig, [key]: value }
		}));
	}

	handleFlowChange(flow) {
		this.setState({ pipelineFlow: flow });
	}

	handleFlowImported() {
		this.setState({ importedFlow: null });
	}

	handleSaveToHarness() {
		const { categories, paramDefs, canvasConfig } = this.state;
		const pipelineFlow = this.getCurrentFlow();
		try {
			localStorage.setItem("elyra-studio-harness-config", JSON.stringify({
				palette: paletteGenerator(categories),
				paramDefs,
				canvasConfig,
				pipelineFlow
			}));
			localStorage.setItem("elyra-studio-state", JSON.stringify({ categories, paramDefs, canvasConfig, pipelineFlow }));
		} catch {
			// ignore quota errors
		}
		window.location.assign("/#/");
	}

	handleDiscardAndExit() {
		try {
			localStorage.removeItem("elyra-studio-state");
		} catch {
			// ignore
		}
		window.location.assign("/#/");
	}

	handleExport() {
		const { categories, paramDefs, canvasConfig } = this.state;
		const pipelineFlow = this.getCurrentFlow();
		const bundle = {
			version: "1.0",
			studio: { categories, paramDefs, canvasConfig, pipelineFlow },
			palette: paletteGenerator(categories)
		};
		JavascriptFileDownload(JSON.stringify(bundle, null, 2), "studio-config.json", "application/json");
	}

	handleImport(e) {
		const file = e.target.files && e.target.files[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (evt) => {
			try {
				const bundle = JSON.parse(evt.target.result);
				if (bundle.studio) {
					this.setState({
						categories: bundle.studio.categories || [],
						paramDefs: bundle.studio.paramDefs || {},
						canvasConfig: bundle.studio.canvasConfig || { ...DEFAULT_CANVAS_CONFIG },
						importedFlow: bundle.studio.pipelineFlow || null,
						selectedNodeStudioId: null
					});
				}
			} catch (err) {
				console.error("Studio: failed to parse imported file", err);
			}
		};
		reader.readAsText(file);
	}

	renderPaletteColumn() {
		const { categories, selectedNodeStudioId, paletteCollapsed } = this.state;
		if (paletteCollapsed) {
			return (
				<div
					className="studio-column studio-column--collapsed"
					role="button"
					tabIndex={0}
					onClick={() => this.setState({ paletteCollapsed: false })}
					onKeyDown={(e) => e.key === "Enter" && this.setState({ paletteCollapsed: false })}
				>
					<span className="studio-column-collapsed-label">Palette Builder</span>
				</div>
			);
		}
		return (
			<div className="studio-column">
				<div className="studio-column-header">
					Palette Builder
					<Button kind="ghost" size="sm" hasIconOnly
						renderIcon={Close} iconDescription="Collapse panel"
						onClick={() => this.setState({ paletteCollapsed: true })}
					/>
				</div>
				<div className="studio-column-content">
					<PaletteBuilder
						categories={categories}
						selectedNodeStudioId={selectedNodeStudioId}
						onCategoriesChange={this.handleCategoriesChange}
						onSelectNode={this.handleSelectNode}
						onNodeTypeUpdate={this.handleNodeTypeUpdate}
					/>
				</div>
			</div>
		);
	}

	renderPropertiesColumn() {
		const { categories, paramDefs, selectedNodeStudioId, propertiesCollapsed } = this.state;
		const emptyParamDef = {
			titleDefinition: { title: "", editable: true },
			parameters: [], conditions: [], actions: [],
			groups: [], groupLayout: "flat", resources: {}
		};
		const selectedParamDef = selectedNodeStudioId ? (paramDefs[selectedNodeStudioId] || emptyParamDef) : null;

		if (propertiesCollapsed) {
			return (
				<div
					className="studio-column studio-column--collapsed"
					role="button"
					tabIndex={0}
					onClick={() => this.setState({ propertiesCollapsed: false })}
					onKeyDown={(e) => e.key === "Enter" && this.setState({ propertiesCollapsed: false })}
				>
					<span className="studio-column-collapsed-label">Node Properties</span>
				</div>
			);
		}
		return (
			<div className="studio-column">
				<div className="studio-column-header">
					Node Properties
					<Button kind="ghost" size="sm" hasIconOnly
						renderIcon={Close} iconDescription="Collapse panel"
						onClick={() => this.setState({ propertiesCollapsed: true })}
					/>
				</div>
				<div className="studio-column-content">
					<PropertiesBuilder
						categories={categories}
						selectedNodeStudioId={selectedNodeStudioId}
						paramDef={selectedParamDef}
						onSelectNode={this.handleSelectNode}
						onParamDefChange={this.handleParamDefChange}
					/>
				</div>
			</div>
		);
	}

	render() {
		const { categories, paramDefs, canvasConfig, paletteCollapsed, propertiesCollapsed } = this.state;
		const paletteJSON = paletteGenerator(categories);
		const bodyStyle = {
			gridTemplateColumns: `${paletteCollapsed ? "40px" : "320px"} ${propertiesCollapsed ? "40px" : "320px"} 1fr`
		};

		return (
			<div className="studio-page">
				<div className="studio-header">
					<div className="studio-header-left">
						<span className="studio-title">Canvas Studio</span>
					</div>
					<div className="studio-header-actions">
						<label htmlFor="studio-import-file" style={{ cursor: "pointer" }}>
							<Button kind="ghost" size="sm" renderIcon={Upload} as="span">Import</Button>
						</label>
						<input
							id="studio-import-file"
							type="file"
							accept=".json"
							style={{ display: "none" }}
							onChange={this.handleImport}
						/>
						<Button kind="ghost" size="sm" renderIcon={Download} onClick={this.handleExport}>
							Export JSON
						</Button>
						<div className="studio-header-divider" />
						<Button kind="ghost" size="sm" onClick={this.handleDiscardAndExit}>
							Exit without saving
						</Button>
						<Button kind="primary" size="sm" renderIcon={Save} onClick={this.handleSaveToHarness}>
							Save to Harness
						</Button>
					</div>
				</div>

				<div className="studio-body" style={bodyStyle}>
					{this.renderPaletteColumn()}
					{this.renderPropertiesColumn()}
					<StudioCanvas
						ref={this.studioCanvasRef}
						paletteJSON={paletteJSON}
						paramDefs={paramDefs}
						categories={categories}
						canvasConfig={canvasConfig}
						onCanvasConfigChange={this.handleCanvasConfigChange}
						importedFlow={this.state.importedFlow}
						onFlowChange={this.handleFlowChange}
						onFlowImported={this.handleFlowImported}
					/>
				</div>
			</div>
		);
	}
}
