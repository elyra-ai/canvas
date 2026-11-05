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
import { Button, TextInput } from "@carbon/react";
import { Add, TrashCan } from "@carbon/react/icons";
import { v4 as uuid4 } from "uuid";

export default class PortsEditor extends React.Component {
	constructor(props) {
		super(props);
		this.handleLabelChange = this.handleLabelChange.bind(this);
		this.handleCardinalityChange = this.handleCardinalityChange.bind(this);
		this.addPort = this.addPort.bind(this);
		this.removePort = this.removePort.bind(this);
	}

	handleLabelChange(portId, label) {
		const ports = this.props.ports.map((p) =>
			(p.portId === portId ? { ...p, label } : p)
		);
		this.props.onChange(ports);
	}

	handleCardinalityChange(portId, field, value) {
		const numVal = parseInt(value, 10);
		let stored = null;
		if (value !== "") {
			stored = isNaN(numVal) ? 0 : numVal;
		}
		const ports = this.props.ports.map((p) =>
			(p.portId === portId ? { ...p, [field]: stored } : p)
		);
		this.props.onChange(ports);
	}

	addPort() {
		const portIndex = this.props.ports.length;
		const newPort = {
			portId: uuid4(),
			label: `${this.props.portType === "input" ? "Input" : "Output"} ${portIndex}`,
			cardinalityMin: 0,
			cardinalityMax: 1
		};
		this.props.onChange([...this.props.ports, newPort]);
	}

	removePort(portId) {
		this.props.onChange(this.props.ports.filter((p) => p.portId !== portId));
	}

	render() {
		const { ports, portType } = this.props;
		const label = portType === "input" ? "Inputs" : "Outputs";

		return (
			<div className="studio-ports-editor">
				<div className="studio-ports-section-label">{label}</div>
				{ports.map((port) => (
					<div key={port.portId} className="studio-port-row">
						<TextInput
							id={`port-label-${port.portId}`}
							labelText="Label"
							value={port.label}
							size="sm"
							onChange={(e) => this.handleLabelChange(port.portId, e.target.value)}
						/>
						<div className="studio-port-num">
							<label className="studio-port-num-label" htmlFor={`port-min-${port.portId}`}>Min</label>
							<input
								id={`port-min-${port.portId}`}
								type="number"
								className="studio-port-num-input"
								value={port.cardinalityMin ?? ""}
								min={0}
								onChange={(e) => this.handleCardinalityChange(port.portId, "cardinalityMin", e.target.value)}
							/>
						</div>
						<div className="studio-port-num">
							<label className="studio-port-num-label" htmlFor={`port-max-${port.portId}`}>Max (-1=∞)</label>
							<input
								id={`port-max-${port.portId}`}
								type="number"
								className="studio-port-num-input"
								value={port.cardinalityMax ?? ""}
								min={-1}
								onChange={(e) => this.handleCardinalityChange(port.portId, "cardinalityMax", e.target.value)}
							/>
						</div>
						<Button
							kind="ghost"
							size="sm"
							iconDescription="Remove port"
							hasIconOnly
							renderIcon={TrashCan}
							onClick={() => this.removePort(port.portId)}
						/>
					</div>
				))}
				<Button
					kind="ghost"
					size="sm"
					renderIcon={Add}
					className="studio-add-port-btn"
					onClick={this.addPort}
				>
					Add {portType}
				</Button>
			</div>
		);
	}
}

PortsEditor.propTypes = {
	ports: PropTypes.array.isRequired,
	portType: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired
};
