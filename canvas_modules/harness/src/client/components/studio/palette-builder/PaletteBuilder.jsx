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
import { Button } from "@carbon/react";
import { Add, ChevronDown, ChevronUp, Edit, TrashCan } from "@carbon/react/icons";
import { v4 as uuid4 } from "uuid";
import CategoryForm from "./CategoryForm";
import NodeTypeForm from "./NodeTypeForm";

export default class PaletteBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			expandedCategories: {},
			editingNodeId: null
		};
		this.addCategory = this.addCategory.bind(this);
		this.removeCategory = this.removeCategory.bind(this);
		this.toggleCategory = this.toggleCategory.bind(this);
		this.updateCategory = this.updateCategory.bind(this);
		this.addNodeType = this.addNodeType.bind(this);
		this.removeNodeType = this.removeNodeType.bind(this);
		this.updateNodeType = this.updateNodeType.bind(this);
		this.selectNode = this.selectNode.bind(this);
		this.closeNodeForm = this.closeNodeForm.bind(this);
	}

	addCategory() {
		const newCategory = {
			studioId: uuid4(),
			label: "New Category",
			description: "",
			image: "/images/carbon/gears.svg",
			is_open: true,
			nodeTypes: []
		};
		const expanded = { ...this.state.expandedCategories, [newCategory.studioId]: true };
		this.setState({ expandedCategories: expanded });
		this.props.onCategoriesChange([...this.props.categories, newCategory]);
	}

	removeCategory(studioId) {
		this.props.onCategoriesChange(this.props.categories.filter((c) => c.studioId !== studioId));
		const expanded = { ...this.state.expandedCategories };
		delete expanded[studioId];
		this.setState({ expandedCategories: expanded });
	}

	toggleCategory(studioId) {
		const expanded = { ...this.state.expandedCategories };
		expanded[studioId] = !expanded[studioId];
		this.setState({ expandedCategories: expanded });
	}

	updateCategory(updatedCategory) {
		const categories = this.props.categories.map((c) =>
			(c.studioId === updatedCategory.studioId ? updatedCategory : c)
		);
		this.props.onCategoriesChange(categories);
	}

	addNodeType(categoryStudioId) {
		const newNode = {
			studioId: uuid4(),
			label: "New Node",
			op: "",
			description: "",
			image: "/images/carbon/gears.svg",
			type: "execution_node",
			inputs: [{ portId: uuid4(), label: "Input", cardinalityMin: 0, cardinalityMax: 1 }],
			outputs: [{ portId: uuid4(), label: "Output", cardinalityMin: 0, cardinalityMax: -1 }]
		};
		const categories = this.props.categories.map((c) => {
			if (c.studioId === categoryStudioId) {
				return { ...c, nodeTypes: [...(c.nodeTypes || []), newNode] };
			}
			return c;
		});
		this.props.onCategoriesChange(categories);
		this.setState({ editingNodeId: newNode.studioId });
		this.props.onSelectNode(newNode.studioId);
	}

	removeNodeType(categoryStudioId, nodeStudioId) {
		const categories = this.props.categories.map((c) => {
			if (c.studioId === categoryStudioId) {
				return { ...c, nodeTypes: c.nodeTypes.filter((n) => n.studioId !== nodeStudioId) };
			}
			return c;
		});
		this.props.onCategoriesChange(categories);
		if (this.state.editingNodeId === nodeStudioId) {
			this.setState({ editingNodeId: null });
		}
		if (this.props.selectedNodeStudioId === nodeStudioId) {
			this.props.onSelectNode(null);
		}
	}

	updateNodeType(categoryStudioId, updatedNode) {
		const categories = this.props.categories.map((c) => {
			if (c.studioId === categoryStudioId) {
				return { ...c, nodeTypes: c.nodeTypes.map((n) => (n.studioId === updatedNode.studioId ? updatedNode : n)) };
			}
			return c;
		});
		this.props.onCategoriesChange(categories);
		this.props.onNodeTypeUpdate(updatedNode);
	}

	selectNode(nodeStudioId) {
		const editing = this.state.editingNodeId === nodeStudioId ? null : nodeStudioId;
		this.setState({ editingNodeId: editing });
		this.props.onSelectNode(editing);
	}

	closeNodeForm() {
		this.setState({ editingNodeId: null });
	}

	renderNodeTypeItem(category, nodeType) {
		const isEditing = this.state.editingNodeId === nodeType.studioId;
		return (
			<div key={nodeType.studioId}>
				<div
					className={`studio-node-type-item${nodeType.studioId === this.props.selectedNodeStudioId ? " studio-node-type-item--selected" : ""}`}
					onClick={() => this.selectNode(nodeType.studioId)}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => e.key === "Enter" && this.selectNode(nodeType.studioId)}
				>
					<div className="studio-node-type-label">
						{nodeType.image && <img src={nodeType.image} alt="" className="studio-node-icon-preview" />}
						<span>{nodeType.label || "Unnamed Node"}</span>
					</div>
					<div className="studio-node-type-actions" onClick={(e) => e.stopPropagation()}>
						<Button
							kind="ghost"
							size="sm"
							hasIconOnly
							renderIcon={Edit}
							iconDescription="Edit node"
							onClick={() => this.selectNode(nodeType.studioId)}
						/>
						<Button
							kind="ghost"
							size="sm"
							hasIconOnly
							renderIcon={TrashCan}
							iconDescription="Delete node"
							onClick={() => this.removeNodeType(category.studioId, nodeType.studioId)}
						/>
					</div>
				</div>
				{isEditing && (
					<NodeTypeForm
						nodeType={nodeType}
						onChange={(updated) => this.updateNodeType(category.studioId, updated)}
						onClose={this.closeNodeForm}
					/>
				)}
			</div>
		);
	}

	renderCategory(category) {
		const isExpanded = Boolean(this.state.expandedCategories[category.studioId]);
		return (
			<div key={category.studioId} className="studio-category-item">
				<div className="studio-category-header">
					<div
						className="studio-category-label"
						onClick={() => this.toggleCategory(category.studioId)}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => e.key === "Enter" && this.toggleCategory(category.studioId)}
					>
						{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
						{category.image && <img src={category.image} alt="" className="studio-category-icon-preview" />}
						<span>{category.label || "Unnamed Category"}</span>
					</div>
					<div className="studio-category-actions">
						<Button
							kind="ghost"
							size="sm"
							hasIconOnly
							renderIcon={TrashCan}
							iconDescription="Delete category"
							onClick={(e) => {
								e.stopPropagation();
								this.removeCategory(category.studioId);
							}}
						/>
					</div>
				</div>

				{isExpanded && (
					<div className="studio-category-body">
						<CategoryForm
							category={category}
							onChange={this.updateCategory}
						/>
						<div className="studio-node-type-list">
							<div className="studio-node-type-list-header">
								<span>Node Types ({(category.nodeTypes || []).length})</span>
								<Button
									kind="ghost"
									size="sm"
									renderIcon={Add}
									onClick={() => this.addNodeType(category.studioId)}
								>
									Add Node
								</Button>
							</div>
							{(category.nodeTypes || []).map((nodeType) =>
								this.renderNodeTypeItem(category, nodeType)
							)}
						</div>
					</div>
				)}
			</div>
		);
	}

	render() {
		return (
			<div className="studio-palette-builder">
				<div className="studio-section-actions">
					<Button kind="primary" size="sm" renderIcon={Add} onClick={this.addCategory}>
						Add Category
					</Button>
				</div>
				{this.props.categories.length === 0 && (
					<div className="studio-no-node-placeholder">
						<p>No categories yet.</p>
						<p>Click &quot;Add Category&quot; to get started.</p>
					</div>
				)}
				{this.props.categories.map((cat) => this.renderCategory(cat))}
			</div>
		);
	}
}

PaletteBuilder.propTypes = {
	categories: PropTypes.array.isRequired,
	selectedNodeStudioId: PropTypes.string,
	onCategoriesChange: PropTypes.func.isRequired,
	onSelectNode: PropTypes.func.isRequired,
	onNodeTypeUpdate: PropTypes.func.isRequired
};
