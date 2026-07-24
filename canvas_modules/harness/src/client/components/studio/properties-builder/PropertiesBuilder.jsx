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
import { Select, SelectItem, Button, TextInput, Toggle } from "@carbon/react";
import { Add, ChevronDown, ChevronUp, TrashCan } from "@carbon/react/icons";
import { v4 as uuid4 } from "uuid";
import ParameterForm from "./ParameterForm";
import ConditionsBuilder from "./ConditionsBuilder";
import ActionsBuilder from "./ActionsBuilder";
import GroupBuilder from "./GroupBuilder";
import ResourcesEditor from "./ResourcesEditor";
import PropertiesPreview from "./PropertiesPreview";

export default class PropertiesBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.state = { expandedParams: {} };
		this.addParameter = this.addParameter.bind(this);
		this.removeParameter = this.removeParameter.bind(this);
		this.updateParameter = this.updateParameter.bind(this);
		this.moveParameter = this.moveParameter.bind(this);
		this.toggleParam = this.toggleParam.bind(this);
		this.updateField = this.updateField.bind(this);
	}

	getAllNodes() {
		const nodes = [];
		(this.props.categories || []).forEach((cat) => {
			(cat.nodeTypes || []).forEach((node) => {
				nodes.push({ studioId: node.studioId, label: node.label, op: node.op, catLabel: cat.label });
			});
		});
		return nodes;
	}

	getSelectedNode() {
		const nodes = this.getAllNodes();
		return nodes.find((n) => n.studioId === this.props.selectedNodeStudioId) || null;
	}

	updateField(field, value) {
		const paramDef = this.props.paramDef || {};
		this.props.onParamDefChange({ ...paramDef, [field]: value });
	}

	addParameter() {
		const newParam = {
			paramId: uuid4(),
			id: "",
			displayName: "New Parameter",
			description: "",
			actionRef: "",
			type: "string",
			required: false,
			default: "",
			enumValues: []
		};
		const paramDef = this.props.paramDef || {};
		const updated = { ...paramDef, parameters: [...(paramDef.parameters || []), newParam] };
		this.props.onParamDefChange(updated);
		this.setState({ expandedParams: { ...this.state.expandedParams, [newParam.paramId]: true } });
	}

	removeParameter(paramId) {
		const paramDef = this.props.paramDef || {};
		const updated = { ...paramDef, parameters: (paramDef.parameters || []).filter((p) => p.paramId !== paramId) };
		this.props.onParamDefChange(updated);
		const expanded = { ...this.state.expandedParams };
		delete expanded[paramId];
		this.setState({ expandedParams: expanded });
	}

	updateParameter(updatedParam) {
		const paramDef = this.props.paramDef || {};
		const updated = {
			...paramDef,
			parameters: (paramDef.parameters || []).map((p) => (p.paramId === updatedParam.paramId ? updatedParam : p))
		};
		this.props.onParamDefChange(updated);
	}

	moveParameter(index, direction) {
		const paramDef = this.props.paramDef || {};
		const params = [...(paramDef.parameters || [])];
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= params.length) {
			return;
		}
		[params[index], params[targetIndex]] = [params[targetIndex], params[index]];
		this.props.onParamDefChange({ ...paramDef, parameters: params });
	}

	toggleParam(paramId) {
		const expanded = { ...this.state.expandedParams };
		expanded[paramId] = !expanded[paramId];
		this.setState({ expandedParams: expanded });
	}

	renderParameterItem(param, index, parameters, actions) {
		const { expandedParams } = this.state;
		const reqBadge = param.required
			? (
				<span
					className="studio-parameter-type-badge"
					style={{ background: "var(--cds-tag-background-red)", color: "var(--cds-tag-color-red)" }}
				>
					required
				</span>
			)
			: null;

		return (
			<div key={param.paramId} className="studio-parameter-item">
				<div
					className="studio-parameter-header"
					onClick={() => this.toggleParam(param.paramId)}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => e.key === "Enter" && this.toggleParam(param.paramId)}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
						<span className="studio-parameter-label">{param.displayName || "(unnamed)"}</span>
						<span className="studio-parameter-type-badge">{param.type || "string"}</span>
						{reqBadge}
					</div>
					<div className="studio-parameter-actions" onClick={(e) => e.stopPropagation()}>
						<Button
							kind="ghost" size="sm" hasIconOnly
							renderIcon={ChevronUp} iconDescription="Move up"
							disabled={index === 0}
							onClick={() => this.moveParameter(index, -1)}
						/>
						<Button
							kind="ghost" size="sm" hasIconOnly
							renderIcon={ChevronDown} iconDescription="Move down"
							disabled={index === parameters.length - 1}
							onClick={() => this.moveParameter(index, 1)}
						/>
						<Button
							kind="ghost" size="sm" hasIconOnly
							renderIcon={TrashCan} iconDescription="Delete parameter"
							onClick={() => this.removeParameter(param.paramId)}
						/>
					</div>
				</div>
				{expandedParams[param.paramId] && (
					<ParameterForm
						param={param}
						onChange={this.updateParameter}
						availableActions={actions || []}
					/>
				)}
			</div>
		);
	}

	render() {
		const { selectedNodeStudioId, onSelectNode, paramDef } = this.props;
		const allNodes = this.getAllNodes();
		const selectedNode = this.getSelectedNode();
		const parameters = (paramDef && paramDef.parameters) || [];
		const conditions = (paramDef && paramDef.conditions) || [];
		const actions = (paramDef && paramDef.actions) || [];
		const groups = (paramDef && paramDef.groups) || [];
		const groupLayout = (paramDef && paramDef.groupLayout) || "flat";
		const resources = (paramDef && paramDef.resources) || {};
		const titleDef = (paramDef && paramDef.titleDefinition) || { title: "", editable: true };

		return (
			<div className="studio-properties-builder">
				<div className="studio-form-field">
					<Select
						id="studio-node-selector"
						labelText="Configure properties for node"
						value={selectedNodeStudioId || ""}
						size="sm"
						onChange={(e) => onSelectNode(e.target.value || null)}
					>
						<SelectItem value="" text="— Select a node type —" />
						{allNodes.map((node) => (
							<SelectItem
								key={node.studioId}
								value={node.studioId}
								text={`${node.catLabel}: ${node.label || "(unnamed)"}`}
							/>
						))}
					</Select>
				</div>

				{!selectedNodeStudioId && (
					<div className="studio-no-node-placeholder">
						<p>Select a node type above to configure its properties form.</p>
					</div>
				)}

				{selectedNodeStudioId && (
					<div>
						<div className="studio-subsection">
							<div className="studio-subsection-header studio-subsection-header--top">
								<span>Dialog Title</span>
							</div>
							<div className="studio-form-field">
								<TextInput
									id="studio-title-def"
									labelText="Title"
									placeholder="Node Properties"
									value={titleDef.title || ""}
									size="sm"
									onChange={(e) => this.updateField("titleDefinition", { ...titleDef, title: e.target.value })}
								/>
							</div>
							<div className="studio-form-field">
								<Toggle
									id="studio-title-editable"
									labelText="Title editable by user"
									toggled={titleDef.editable !== false}
									size="sm"
									onToggle={(v) => this.updateField("titleDefinition", { ...titleDef, editable: v })}
								/>
							</div>
						</div>

						<div className="studio-subsection">
							<div className="studio-parameter-list">
								<div className="studio-node-type-list-header">
									<span>Parameters ({parameters.length})</span>
									<Button kind="ghost" size="sm" renderIcon={Add} onClick={this.addParameter}>
										Add Parameter
									</Button>
								</div>

								{parameters.length === 0 && (
									<div className="studio-placeholder-text">
										No parameters yet. Click &quot;Add Parameter&quot; to begin.
									</div>
								)}

								{parameters.map((param, index) => this.renderParameterItem(param, index, parameters, actions))}
							</div>
						</div>

						<div className="studio-subsection">
							<ActionsBuilder
								actions={actions}
								onChange={(updated) => this.updateField("actions", updated)}
							/>
						</div>

						<div className="studio-subsection">
							<ConditionsBuilder
								conditions={conditions}
								parameters={parameters}
								onChange={(updated) => this.updateField("conditions", updated)}
							/>
						</div>

						<div className="studio-subsection">
							<GroupBuilder
								groupLayout={groupLayout}
								groups={groups}
								parameters={parameters}
								onLayoutChange={(layout) => this.updateField("groupLayout", layout)}
								onGroupsChange={(updated) => this.updateField("groups", updated)}
							/>
						</div>

						<div className="studio-subsection">
							<ResourcesEditor
								resources={resources}
								onChange={(updated) => this.updateField("resources", updated)}
							/>
						</div>

						<PropertiesPreview
							paramDef={paramDef}
							nodeLabel={selectedNode ? selectedNode.label : ""}
							nodeOp={selectedNode ? selectedNode.op : ""}
						/>
					</div>
				)}
			</div>
		);
	}
}

PropertiesBuilder.propTypes = {
	categories: PropTypes.array.isRequired,
	selectedNodeStudioId: PropTypes.string,
	paramDef: PropTypes.object,
	onSelectNode: PropTypes.func.isRequired,
	onParamDefChange: PropTypes.func.isRequired
};
