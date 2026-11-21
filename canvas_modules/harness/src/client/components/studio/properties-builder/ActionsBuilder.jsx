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
import { Button, TextInput, Select, SelectItem } from "@carbon/react";
import { Add, ChevronDown, ChevronUp, TrashCan } from "@carbon/react/icons";
import { v4 as uuid4 } from "uuid";

export default class ActionsBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.state = { expanded: {} };
		this.addAction = this.addAction.bind(this);
		this.removeAction = this.removeAction.bind(this);
		this.updateAction = this.updateAction.bind(this);
		this.updateActionSize = this.updateActionSize.bind(this);
		this.toggleExpanded = this.toggleExpanded.bind(this);
	}

	addAction() {
		const newAction = {
			actionId: uuid4(),
			id: "",
			controlType: "image",
			label: "",
			description: "",
			imageUrl: "",
			placement: "right",
			width: 25,
			height: 20,
			paramRef: ""
		};
		this.props.onChange([...(this.props.actions || []), newAction]);
		this.setState((prev) => ({ expanded: { ...prev.expanded, [newAction.actionId]: true } }));
	}

	removeAction(actionId) {
		this.props.onChange((this.props.actions || []).filter((a) => a.actionId !== actionId));
	}

	updateActionSize(actionId, field, rawValue) {
		const parsed = parseInt(rawValue, 10);
		this.updateAction(actionId, field, rawValue === "" ? null : Math.max(1, parsed || 1));
	}

	updateAction(actionId, field, value) {
		const updated = (this.props.actions || []).map((a) => {
			if (a.actionId !== actionId) {
				return a;
			}
			return { ...a, [field]: value };
		});
		this.props.onChange(updated);
	}

	toggleExpanded(actionId) {
		this.setState((prev) => ({
			expanded: { ...prev.expanded, [actionId]: !prev.expanded[actionId] }
		}));
	}

	render() {
		const { actions } = this.props;
		const { expanded } = this.state;

		return (
			<div className="studio-actions-builder">
				<div className="studio-subsection-header">
					<span>Actions (icon / button beside fields)</span>
					<Button kind="ghost" size="sm" renderIcon={Add} onClick={this.addAction}>
						Add Action
					</Button>
				</div>

				{(!actions || actions.length === 0) && (
					<div className="studio-placeholder-text">
						No actions yet. Actions are image icons or buttons that appear beside a field.
						Add one here, then set its ID on the parameter that should show it.
					</div>
				)}

				{(actions || []).map((action) => (
					<div key={action.actionId} className="studio-action-item">
						<div
							className="studio-action-header"
							onClick={() => this.toggleExpanded(action.actionId)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && this.toggleExpanded(action.actionId)}
						>
							<div className="studio-action-header-label">
								{expanded[action.actionId]
									? <ChevronUp size={14} />
									: <ChevronDown size={14} />
								}
								<span>{action.id || "(unnamed action)"}</span>
								{action.imageUrl && (
									<img src={action.imageUrl} alt="" className="studio-action-img-preview" />
								)}
							</div>
							<Button
								kind="ghost"
								size="sm"
								hasIconOnly
								renderIcon={TrashCan}
								iconDescription="Remove action"
								onClick={(e) => {
									e.stopPropagation();
									this.removeAction(action.actionId);
								}}
							/>
						</div>

						{expanded[action.actionId] && (
							<div className="studio-action-form">
								<div className="studio-form-field">
									<Select
										id={`action-type-${action.actionId}`}
										labelText="Action type"
										value={action.controlType || "image"}
										size="sm"
										onChange={(e) => this.updateAction(action.actionId, "controlType", e.target.value)}
									>
										<SelectItem value="image" text="Image / icon" />
										<SelectItem value="button" text="Button" />
									</Select>
								</div>

								<div className="studio-form-field">
									<TextInput
										id={`action-id-${action.actionId}`}
										labelText="Action ID (referenced by parameter's action_ref)"
										placeholder="moon_right"
										value={action.id || ""}
										size="sm"
										onChange={(e) => this.updateAction(action.actionId, "id", e.target.value.replace(/\s+/g, "_"))}
									/>
								</div>

								<div className="studio-form-field">
									<TextInput
										id={`action-label-${action.actionId}`}
										labelText="Label (tooltip title)"
										value={action.label || ""}
										size="sm"
										onChange={(e) => this.updateAction(action.actionId, "label", e.target.value)}
									/>
								</div>

								<div className="studio-form-field">
									<TextInput
										id={`action-desc-${action.actionId}`}
										labelText="Description (tooltip body)"
										value={action.description || ""}
										size="sm"
										onChange={(e) => this.updateAction(action.actionId, "description", e.target.value)}
									/>
								</div>

								{(action.controlType || "image") === "image" && (
									<>
										<div className="studio-form-field">
											<TextInput
												id={`action-url-${action.actionId}`}
												labelText="Image URL"
												placeholder="/images/moon.jpg"
												value={action.imageUrl || ""}
												size="sm"
												onChange={(e) => this.updateAction(action.actionId, "imageUrl", e.target.value)}
											/>
										</div>

										<div className="studio-form-field">
											<Select
												id={`action-placement-${action.actionId}`}
												labelText="Placement"
												value={action.placement || "right"}
												size="sm"
												onChange={(e) => this.updateAction(action.actionId, "placement", e.target.value)}
											>
												<SelectItem value="right" text="Right of field" />
												<SelectItem value="left" text="Left of field" />
											</Select>
										</div>

										<div className="studio-two-col-row">
											<div className="studio-port-num">
												<label className="studio-port-num-label" htmlFor={`action-width-${action.actionId}`}>Width (px)</label>
												<input
													id={`action-width-${action.actionId}`}
													type="number"
													className="studio-port-num-input"
													value={action.width ?? ""}
													min={1}
													onChange={(e) => this.updateActionSize(action.actionId, "width", e.target.value)}
												/>
											</div>
											<div className="studio-port-num">
												<label className="studio-port-num-label" htmlFor={`action-height-${action.actionId}`}>Height (px)</label>
												<input
													id={`action-height-${action.actionId}`}
													type="number"
													className="studio-port-num-input"
													value={action.height ?? ""}
													min={1}
													onChange={(e) => this.updateActionSize(action.actionId, "height", e.target.value)}
												/>
											</div>
										</div>
									</>
								)}

								{(action.controlType || "image") === "button" && (
									<div className="studio-form-field">
										<TextInput
											id={`action-paramref-${action.actionId}`}
											labelText="Parameter ref (optional — links button to a parameter)"
											placeholder="my_param"
											value={action.paramRef || ""}
											size="sm"
											onChange={(e) => this.updateAction(action.actionId, "paramRef", e.target.value)}
										/>
									</div>
								)}
							</div>
						)}
					</div>
				))}
			</div>
		);
	}
}

ActionsBuilder.propTypes = {
	actions: PropTypes.array,
	onChange: PropTypes.func.isRequired
};
