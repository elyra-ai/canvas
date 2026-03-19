/*
 * Copyright 2017-2023 Elyra Authors
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
import { formatMessage } from "./../../util/property-utils";
import { MESSAGE_KEYS } from "./../../constants/constants";
import { ControlType } from "./../../constants/form-constants";
import { Add, Edit } from "@carbon/react/icons";
import { Button } from "@carbon/react";

export default class EmptyTable extends React.Component {
	constructor(props) {
		super(props);

		this.getEmptyTableText = this.getEmptyTableText.bind(this);
		this.isReadonlyTable = this.isReadonlyTable.bind(this);
	}

	getEmptyTableText() {
		// Empty table text can be customized
		const overrideEmptyTableTextKey = `${this.props.control.name}.empty.table.text`;
		const defaultEmptyTableText = formatMessage(
			this.props.controller.getReactIntl(),
			MESSAGE_KEYS.PROPERTIES_EMPTY_TABLE_TEXT,
			{ button_label: this.props.emptyTableButtonLabel }
		);
		return this.props.controller.getResource(overrideEmptyTableTextKey, defaultEmptyTableText);
	}

	isReadonlyTable() {
		return this.props.control.controlType === ControlType.READONLYTABLE;
	}

	render() {
		const emptyTableText = this.getEmptyTableText();
		const emptyTableContent = (
			<div className="properties-empty-table" disabled={this.props.disabled}>
				<span aria-disabled={this.props.disabled}>{emptyTableText}</span>
				<br />
				<Button
					className="properties-empty-table-button"
					kind="tertiary"
					size="sm"
					renderIcon={this.isReadonlyTable() ? Edit : Add}
					onClick={this.props.emptyTableButtonClickHandler}
					disabled={this.props.disabled}
				>
					{this.props.emptyTableButtonLabel}
				</Button>
			</div>
		);
		return emptyTableContent;
	}
}

EmptyTable.propTypes = {
	control: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	emptyTableButtonLabel: PropTypes.string,
	emptyTableButtonClickHandler: PropTypes.func,
	disabled: PropTypes.bool,
};
