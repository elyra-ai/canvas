/*
 * Copyright 2017-2020 IBM Corporation
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
import { Modal } from "carbon-components-react";
import classNames from "classnames";
import { Portal } from "react-portal";

export default class PropertiesModal extends Component {

	render() {

		return (
			<Portal>
				<Modal
					className={classNames("properties-modal", this.props.bsSize, { "noButtons": this.props.showPropertiesButtons === false })}
					open
					modalHeading={this.props.title}
					primaryButtonText={this.props.applyLabel}
					secondaryButtonText={this.props.rejectLabel}
					onRequestSubmit={this.props.okHandler}
					onSecondarySubmit={this.props.cancelHandler}
					aria-label=""
				>
					<div className="properties-modal-children">
						{this.props.children}
					</div>
				</Modal>
			</Portal>
		);
	}
}

PropertiesModal.propTypes = {
	cancelHandler: PropTypes.func,
	okHandler: PropTypes.func,
	bsSize: PropTypes.string,
	title: PropTypes.string,
	children: PropTypes.element,
	showPropertiesButtons: PropTypes.bool,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
};
