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
import { Button, Select, SelectItem, TextInput } from "@carbon/react";
import { Add, TrashCan } from "@carbon/react/icons";
import { v4 as uuid4 } from "uuid";

export default class GroupBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.addGroup = this.addGroup.bind(this);
		this.removeGroup = this.removeGroup.bind(this);
		this.updateGroup = this.updateGroup.bind(this);
		this.toggleParam = this.toggleParam.bind(this);
	}

	addGroup() {
		const groups = [...(this.props.groups || []), { groupId: uuid4(), label: "New Tab", paramRefs: [] }];
		this.props.onGroupsChange(groups);
	}

	removeGroup(groupId) {
		this.props.onGroupsChange((this.props.groups || []).filter((g) => g.groupId !== groupId));
	}

	updateGroup(groupId, field, value) {
		this.props.onGroupsChange(
			(this.props.groups || []).map((g) => (g.groupId === groupId ? { ...g, [field]: value } : g))
		);
	}

	toggleParam(groupId, paramId) {
		const group = (this.props.groups || []).find((g) => g.groupId === groupId);
		if (!group) {
			return;
		}
		const current = group.paramRefs || [];
		const next = current.includes(paramId)
			? current.filter((id) => id !== paramId)
			: [...current, paramId];
		this.updateGroup(groupId, "paramRefs", next);
	}

	render() {
		const { groupLayout, groups, parameters, onLayoutChange } = this.props;
		const paramOptions = (parameters || []).filter((p) => Boolean(p.id));

		return (
			<div className="studio-group-builder">
				<div className="studio-subsection-header">
					<span>Layout</span>
				</div>

				<div className="studio-form-field">
					<Select
						id="studio-group-layout"
						labelText="Panel layout"
						value={groupLayout || "flat"}
						size="sm"
						onChange={(e) => onLayoutChange(e.target.value)}
					>
						<SelectItem value="flat" text="Flat (all parameters in one panel)" />
						<SelectItem value="tabs" text="Tabs" />
					</Select>
				</div>

				{(groupLayout === "tabs") && (
					<div className="studio-groups-list">
						{(!groups || groups.length === 0) && (
							<div className="studio-placeholder-text">
								No tabs yet. Click &quot;Add Tab&quot; to create one, then assign parameters to it.
							</div>
						)}

						{(groups || []).map((group) => (
							<div key={group.groupId} className="studio-group-item">
								<div className="studio-group-header">
									<TextInput
										id={`group-label-${group.groupId}`}
										labelText="Tab label"
										value={group.label || ""}
										size="sm"
										onChange={(e) => this.updateGroup(group.groupId, "label", e.target.value)}
									/>
									<Button
										kind="ghost"
										size="sm"
										hasIconOnly
										renderIcon={TrashCan}
										iconDescription="Remove tab"
										className="studio-group-delete"
										onClick={() => this.removeGroup(group.groupId)}
									/>
								</div>

								<div className="studio-group-params">
									<div className="studio-ports-section-label">Parameters in this tab</div>
									{paramOptions.length === 0 && (
										<div className="studio-placeholder-text">No parameters defined yet.</div>
									)}
									{paramOptions.map((p) => (
										<label key={p.paramId} className="studio-group-param-check">
											<input
												type="checkbox"
												checked={(group.paramRefs || []).includes(p.id)}
												onChange={() => this.toggleParam(group.groupId, p.id)}
											/>
											<span>{p.displayName || p.id}</span>
										</label>
									))}
								</div>
							</div>
						))}

						<Button kind="ghost" size="sm" renderIcon={Add} onClick={this.addGroup}>
							Add Tab
						</Button>
					</div>
				)}
			</div>
		);
	}
}

GroupBuilder.propTypes = {
	groupLayout: PropTypes.string,
	groups: PropTypes.array,
	parameters: PropTypes.array,
	onLayoutChange: PropTypes.func.isRequired,
	onGroupsChange: PropTypes.func.isRequired
};
