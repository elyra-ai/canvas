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
import { TextInput } from "@carbon/react";

const ICON_TABS = [
	{
		label: "General",
		icons: [
			"analytics", "chart--column", "chart--line", "chart--scatter",
			"data-collection", "data-table", "db2--database", "document--export",
			"document--import", "document", "filter", "gears", "join--inner",
			"merge", "object-storage", "partition--specific", "scales",
			"sort--ascending"
		].map((n) => ({ name: n, path: `/images/carbon/${n}.svg` }))
	},
	{
		label: "Sources",
		icons: [
			{ name: "user_input", path: "/images/common_node_icons/sources/source_user_input.svg" },
			{ name: "var_import", path: "/images/common_node_icons/sources/source_var_import.svg" }
		]
	},
	{
		label: "Models",
		icons: [
			"model_c50", "model_cart_build", "model_feature_selection",
			"model_linear_regression", "model_logistic_regression",
			"model_neural_network", "model_random_forest"
		].map((n) => ({ name: n, path: `/images/common_node_icons/models/${n}.svg` }))
	},
	{
		label: "Operations",
		icons: [
			"operation_aggregate", "operation_append", "operation_balance",
			"operation_binning", "operation_derive", "operation_distinct",
			"operation_ensemble", "operation_field_reorganize", "operation_filler",
			"operation_filter"
		].map((n) => ({ name: n, path: `/images/common_node_icons/operations/${n}.svg` }))
	},
	{
		label: "Output",
		icons: [
			"output_data_audit", "output_evaluate", "output_histogram",
			"output_table", "output_var_export"
		].map((n) => ({ name: n, path: `/images/common_node_icons/output/${n}.svg` }))
	},
	{
		label: "URL",
		icons: []
	}
];

export default class IconPicker extends React.Component {
	constructor(props) {
		super(props);
		this.state = { activeTab: 0 };
		this.handleTabClick = this.handleTabClick.bind(this);
	}

	handleTabClick(index) {
		this.setState({ activeTab: index });
	}

	render() {
		const { value, onChange } = this.props;
		const { activeTab } = this.state;
		const tab = ICON_TABS[activeTab];
		const isUrlTab = tab.label === "URL";

		return (
			<div className="studio-icon-picker">
				<div className="studio-icon-picker-tabs">
					{ICON_TABS.map((t, i) => (
						<div
							key={t.label}
							className={`studio-icon-tab${activeTab === i ? " studio-icon-tab--active" : ""}`}
							onClick={() => this.handleTabClick(i)}
							role="tab"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && this.handleTabClick(i)}
						>
							{t.label}
						</div>
					))}
				</div>
				{isUrlTab ? (
					<div className="studio-icon-custom-url">
						<TextInput
							id="studio-icon-custom-url-input"
							labelText="Image URL"
							placeholder="https://example.com/icon.svg"
							value={value || ""}
							size="sm"
							onChange={(e) => onChange(e.target.value)}
						/>
					</div>
				) : (
					<div className="studio-icon-grid">
						{tab.icons.map((icon) => (
							<div
								key={icon.path}
								className={`studio-icon-cell${value === icon.path ? " studio-icon-cell--selected" : ""}`}
								onClick={() => onChange(icon.path)}
								role="button"
								tabIndex={0}
								title={icon.name}
								onKeyDown={(e) => e.key === "Enter" && onChange(icon.path)}
							>
								<img src={icon.path} alt={icon.name} />
							</div>
						))}
					</div>
				)}
			</div>
		);
	}
}

IconPicker.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired
};
