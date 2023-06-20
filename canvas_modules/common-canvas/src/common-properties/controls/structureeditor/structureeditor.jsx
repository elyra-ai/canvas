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
import { connect } from "react-redux";
import ControlFactory from "../control-factory";
import * as ControlUtils from "./../../util/control-utils";
import ValidationMessage from "./../../components/validation-message";
import classNames from "classnames";
import { STATES } from "./../../constants/constants.js";
import { cloneDeep } from "lodash";


class StructureEditorControl extends React.Component {
	constructor(props) {
		super(props);
		this.controlFactory = new ControlFactory(this.props.controller);
		this.controlFactory.setFunctions(this.props.openFieldPicker, this.props.buildUIItem);
	}

	/**
	 * Retrieves a sub-control definition by name.
	 *
	 * @param subCtrlName Name of the sub-control def to retrieve
	 * @param a SubControl structure for the given item
	 */
	_getSubControlDef(subCtrlName) {
		for (let i = 0; i < this.props.control.subControls.length; i++) {
			if (this.props.control.subControls[i].name === subCtrlName) {
				return this.props.control.subControls[i];
			}
		}
		return null;
	}

	/**
	 * Retrieves a sub-control index in it's parent structure.
	 *
	 * @param subCtrlName Name of the sub-control index to retrieve
	 * @param The parent index for the given item
	 */
	_getColumnIndex(subCtrlName) {
		for (let i = 0; i < this.props.control.subControls.length; i++) {
			if (this.props.control.subControls[i].name === subCtrlName) {
				return i;
			}
		}
		return null;
	}

	/**
	 * Creates a layout row of controls.
	 *
	 * @param rowCtrlNames String array of sub-control names
	 * @return An array of controls for rendering
	 */
	_makeRow(rowCtrlNames) {
		const row = [];
		for (let y = 0; y < rowCtrlNames.length; y++) {
			const control = this._getSubControlDef(rowCtrlNames[y]);
			if (control && control.visible) {
				const childPropertyId = {
					name: this.props.control.name,
					col: this._getColumnIndex(rowCtrlNames[y])
				};
				const parentPropertyId = cloneDeep(this.props.propertyId);

				let propertyId = childPropertyId;
				if (parentPropertyId.name !== childPropertyId.name) {
					propertyId = this.props.controller.setChildPropertyId(parentPropertyId, childPropertyId);
				}
				row.push(this.controlFactory.createControlItem(control, propertyId));
			}
		}
		return row;
	}

	/**
	 * Creates the sub-controls for rendering.
	 *
	 * @return An array of arrays, each of which contains a row of controls
	 */
	_makeControls() {
		const controls = [];
		// If there is a layout, use that to determine control ordering
		if (Array.isArray(this.props.control.layout)) {
			const layout = this.props.control.layout;
			for (let i = 0; i < layout.length; i++) {
				if (Array.isArray(layout[i])) {
					controls.push(this._makeRow(layout[i]));
				}
			}
		} else {
			// If there is no layout, just arrange the controls in a single ordered column
			for (let i = 0; i < this.props.control.subControls.length; i++) {
				if (this.props.control.subControls[i].visible) {
					const childPropertyId = {
						name: this.props.control.name,
						col: this._getColumnIndex(this.props.control.subControls[i].name)
					};
					const parentPropertyId = cloneDeep(this.props.propertyId);

					let propertyId = childPropertyId;
					if (parentPropertyId.name !== childPropertyId.name) {
						propertyId = this.props.controller.setChildPropertyId(parentPropertyId, childPropertyId);
					}
					controls.push([this.controlFactory.createControlItem(this.props.control.subControls[i], propertyId)]);
				}
			}
		}
		return controls;
	}

	_makeControlTable(controls) {
		const rows = [];
		for (let i = 0; i < controls.length; i++) {
			const row = [];
			for (let j = 0; j < controls[i].length; j++) {
				row.push(<td key={(1 + i) * j} className="properties-structureeditor-cell"><div>{controls[i][j]}</div></td>);
			}
			rows.push(<tr key={1 + i}>{row}</tr>);
		}
		// Added role presentation to fix a11y violation - no headers in the table
		return (<table role="presentation"><tbody>{rows}</tbody></table>);
	}

	render() {
		const controls = this._makeControlTable(this._makeControls());

		return (
			<div data-id={ControlUtils.getDataId(this.props.control, this.props.propertyId)}
				className={classNames("properties-structureeditor ", { "hide": this.props.state === STATES.HIDDEN },
					this.props.messageInfo ? this.props.messageInfo.type : null)}
			>
				{controls}
				<ValidationMessage state={this.props.state} messageInfo={this.props.messageInfo} inTable={false} />
			</div>
		);
	}
}

StructureEditorControl.propTypes = {
	buildUIItem: PropTypes.func,
	control: PropTypes.object,
	propertyId: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	openFieldPicker: PropTypes.func,
	rightFlyout: PropTypes.bool,
	state: PropTypes.string, // passed in by redux
	value: PropTypes.array, // passed in by redux
	messageInfo: PropTypes.object // passed in by redux
};

const mapStateToProps = (state, ownProps) => ({
	value: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(StructureEditorControl);
