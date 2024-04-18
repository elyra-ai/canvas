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

import React, { Component } from "react";
import PropTypes from "prop-types";
import PropertiesButtons from "./../properties-buttons";

export default class PropertiesEditor extends Component {

	render() {
		const classSize = (typeof this.props.bsSize === "undefined") ? "large" : this.props.bsSize;
		const propertyEditingClass = "properties-editing properties-" + classSize;
		const buttons = (<PropertiesButtons
			okHandler={this.props.okHandler}
			cancelHandler={this.props.cancelHandler}
			applyLabel={this.props.applyLabel}
			rejectLabel={this.props.rejectLabel}
			showPropertiesButtons={this.props.showPropertiesButtons}
		/>);

		return (
			<div className={propertyEditingClass} >
				<h2>{this.props.title}</h2>
				<div className="properties-body">
					{this.props.children}
				</div>
				{buttons}
			</div>
		);
	}
}

PropertiesEditor.propTypes = {
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	bsSize: PropTypes.string,
	title: PropTypes.string,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	children: PropTypes.element,
	showPropertiesButtons: PropTypes.bool
};
