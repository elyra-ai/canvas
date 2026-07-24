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
import { Download, Upload } from "@carbon/react/icons";
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
		this.state = {
			categories: [],
			paramDefs: {},
			selectedNodeStudioId: null,
			canvasConfig: { ...DEFAULT_CANVAS_CONFIG }
		};
		this.handleCategoriesChange = this.handleCategoriesChange.bind(this);
		this.handleSelectNode = this.handleSelectNode.bind(this);
		this.handleNodeTypeUpdate = this.handleNodeTypeUpdate.bind(this);
		this.handleParamDefChange = this.handleParamDefChange.bind(this);
		this.handleCanvasConfigChange = this.handleCanvasConfigChange.bind(this);
		this.handleExport = this.handleExport.bind(this);
		this.handleImport = this.handleImport.bind(this);
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
			this.setState((prev) => ({
				paramDefs: {
					...prev.paramDefs,
					[updatedNode.studioId]: { titleDefinition: { title: "", editable: true }, parameters: [], conditions: [], actions: [], groups: [], groupLayout: "flat", resources: {} }
				}
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

	handleExport() {
		const { categories, paramDefs, canvasConfig } = this.state;
		const bundle = {
			version: "1.0",
			studio: { categories, paramDefs, canvasConfig },
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
						selectedNodeStudioId: null
					});
				}
			} catch (err) {
				console.error("Studio: failed to parse imported file", err);
			}
		};
		reader.readAsText(file);
	}

	render() {
		const { categories, paramDefs, selectedNodeStudioId, canvasConfig } = this.state;
		const paletteJSON = paletteGenerator(categories);
		const emptyParamDef = { titleDefinition: { title: "", editable: true }, parameters: [], conditions: [], actions: [], groups: [], groupLayout: "flat", resources: {} };
		const selectedParamDef = selectedNodeStudioId ? (paramDefs[selectedNodeStudioId] || emptyParamDef) : null;

		return (
			<div className="studio-page">
				<div className="studio-header">
					<div className="studio-header-left">
						<a href="/#/" className="studio-back-link">← Back to Harness</a>
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
						<Button kind="secondary" size="sm" renderIcon={Download} onClick={this.handleExport}>
							Export JSON
						</Button>
					</div>
				</div>

				<div className="studio-body">
					<div className="studio-column">
						<div className="studio-column-header">Palette Builder</div>
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

					<div className="studio-column">
						<div className="studio-column-header">Node Properties</div>
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

					<StudioCanvas
						paletteJSON={paletteJSON}
						paramDefs={paramDefs}
						categories={categories}
						canvasConfig={canvasConfig}
						onCanvasConfigChange={this.handleCanvasConfigChange}
					/>
				</div>
			</div>
		);
	}
}
