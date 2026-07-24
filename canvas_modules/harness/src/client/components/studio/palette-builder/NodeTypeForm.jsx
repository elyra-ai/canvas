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
import { TextInput, Button } from "@carbon/react";
import { Close } from "@carbon/react/icons";
import PortsEditor from "./PortsEditor";
import IconPicker from "./IconPicker";

export default class NodeTypeForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(field, value) {
		this.props.onChange({ ...this.props.nodeType, [field]: value });
	}

	render() {
		const { nodeType, onClose } = this.props;

		return (
			<div className="studio-node-type-form">
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<div className="studio-node-type-form-title">Edit Node Type</div>
					<Button kind="ghost" size="sm" hasIconOnly renderIcon={Close} iconDescription="Close" onClick={onClose} />
				</div>

				<div className="studio-form-field">
					<TextInput
						id={`node-label-${nodeType.studioId}`}
						labelText="Label"
						value={nodeType.label || ""}
						size="sm"
						onChange={(e) => this.handleChange("label", e.target.value)}
					/>
				</div>

				<div className="studio-form-field">
					<TextInput
						id={`node-op-${nodeType.studioId}`}
						labelText="Operation ID (op)"
						placeholder="com.example.mynode"
						value={nodeType.op || ""}
						size="sm"
						onChange={(e) => this.handleChange("op", e.target.value)}
					/>
				</div>

				<div className="studio-form-field">
					<TextInput
						id={`node-desc-${nodeType.studioId}`}
						labelText="Description"
						value={nodeType.description || ""}
						size="sm"
						onChange={(e) => this.handleChange("description", e.target.value)}
					/>
				</div>

				<div className="studio-form-field">
					<div style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--cds-text-secondary)", marginBottom: "0.375rem" }}>Icon</div>
					<IconPicker
						value={nodeType.image}
						onChange={(val) => this.handleChange("image", val)}
					/>
				</div>

				<PortsEditor
					ports={nodeType.inputs || []}
					portType="input"
					onChange={(ports) => this.handleChange("inputs", ports)}
				/>

				<PortsEditor
					ports={nodeType.outputs || []}
					portType="output"
					onChange={(ports) => this.handleChange("outputs", ports)}
				/>
			</div>
		);
	}
}

NodeTypeForm.propTypes = {
	nodeType: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired
};
