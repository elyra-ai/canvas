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

export default class ResourcesEditor extends React.Component {
	constructor(props) {
		super(props);
		this.addEntry = this.addEntry.bind(this);
		this.removeEntry = this.removeEntry.bind(this);
		this.updateKey = this.updateKey.bind(this);
		this.updateValue = this.updateValue.bind(this);
	}

	getEntries() {
		return Object.entries(this.props.resources || {});
	}

	updateResources(entries) {
		const resources = {};
		entries.forEach(([k, v]) => {
			if (k) {
				resources[k] = v;
			}
		});
		this.props.onChange(resources);
	}

	addEntry() {
		this.updateResources([...this.getEntries(), ["", ""]]);
	}

	removeEntry(index) {
		const entries = this.getEntries().filter((_, i) => i !== index);
		this.updateResources(entries);
	}

	updateKey(index, newKey) {
		const entries = this.getEntries().map(([k, v], i) => (i === index ? [newKey, v] : [k, v]));
		this.updateResources(entries);
	}

	updateValue(index, newValue) {
		const entries = this.getEntries().map(([k, v], i) => (i === index ? [k, newValue] : [k, v]));
		this.updateResources(entries);
	}

	render() {
		const entries = this.getEntries();

		return (
			<div className="studio-resources-editor">
				<div className="studio-subsection-header">
					<span>Localization Resources</span>
					<Button kind="ghost" size="sm" renderIcon={Add} onClick={this.addEntry}>
						Add Resource
					</Button>
				</div>

				{entries.length === 0 && (
					<div className="studio-placeholder-text">
						No resources yet. Resources are key/value string pairs used for localization.
						Reference a key in a field label using its resource_key.
					</div>
				)}

				{entries.map(([key, value], index) => (
					<div key={index} className="studio-resource-row">
						<TextInput
							id={`resource-key-${index}`}
							labelText="Key"
							value={key}
							size="sm"
							placeholder="my.label.key"
							onChange={(e) => this.updateKey(index, e.target.value)}
						/>
						<TextInput
							id={`resource-val-${index}`}
							labelText="Value"
							value={value}
							size="sm"
							placeholder="My Label"
							onChange={(e) => this.updateValue(index, e.target.value)}
						/>
						<Button
							kind="ghost"
							size="sm"
							hasIconOnly
							renderIcon={TrashCan}
							iconDescription="Remove resource"
							className="studio-resource-delete"
							onClick={() => this.removeEntry(index)}
						/>
					</div>
				))}
			</div>
		);
	}
}

ResourcesEditor.propTypes = {
	resources: PropTypes.object,
	onChange: PropTypes.func.isRequired
};
