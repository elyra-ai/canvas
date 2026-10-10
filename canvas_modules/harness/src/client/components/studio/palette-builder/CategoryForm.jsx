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
import { TextInput, Toggle } from "@carbon/react";
import IconPicker from "./IconPicker";

export default class CategoryForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(field, value) {
		this.props.onChange({ ...this.props.category, [field]: value });
	}

	render() {
		const { category } = this.props;

		return (
			<div>
				<div className="studio-form-field">
					<TextInput
						id={`cat-label-${category.studioId}`}
						labelText="Category Label"
						value={category.label || ""}
						size="sm"
						onChange={(e) => this.handleChange("label", e.target.value)}
					/>
				</div>

				<div className="studio-form-field">
					<TextInput
						id={`cat-desc-${category.studioId}`}
						labelText="Description"
						value={category.description || ""}
						size="sm"
						onChange={(e) => this.handleChange("description", e.target.value)}
					/>
				</div>

				<div className="studio-form-field">
					<div style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--cds-text-secondary)", marginBottom: "0.375rem" }}>Icon</div>
					<IconPicker
						value={category.image}
						onChange={(val) => this.handleChange("image", val)}
					/>
				</div>

				<div className="studio-form-field">
					<Toggle
						id={`cat-open-${category.studioId}`}
						labelText="Open by default"
						toggled={Boolean(category.is_open)}
						size="sm"
						onToggle={(checked) => this.handleChange("is_open", checked)}
					/>
				</div>
			</div>
		);
	}
}

CategoryForm.propTypes = {
	category: PropTypes.object.isRequired,
	onChange: PropTypes.func.isRequired
};
