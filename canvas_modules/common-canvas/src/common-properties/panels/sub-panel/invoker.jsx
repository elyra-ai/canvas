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

import PropertiesModal from "./../../components/properties-modal";
import WideFlyout from "./../../components/wide-flyout";

export default class SubPanelInvoker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			panel: null,
			title: null,
			hideHandler: null,
			subPanelVisible: false
		};
		this.showSubDialog = this.showSubDialog.bind(this);
		this.hideSubDialog = this.hideSubDialog.bind(this);
	}

	showSubDialog(title, panel, hideHandler) {
		this.props.controller.increaseVisibleSubPanelCounter();
		this.setState({
			panel: panel,
			title: title,
			hideHandler: hideHandler,
			subPanelVisible: true
		});
	}

	hideSubDialog(applyChanges) {
		this.props.controller.decreaseVisibleSubPanelCounter();
		this.state.hideHandler(applyChanges);
		this.setState({
			panel: null,
			title: null,
			hideHandler: null,
			subPanelVisible: false
		});
	}

	render() {
		let propertiesDialog = [];
		if (this.state.subPanelVisible && !this.props.rightFlyout) {
			const className = this.props.controller.isTearsheetContainer() ? "properties-subpanel-modal-in-tearsheet" : "";
			propertiesDialog = (<PropertiesModal
				title={this.state.title}
				okHandler={this.hideSubDialog.bind(this, true)}
				cancelHandler={this.hideSubDialog.bind(this, false)}
				applyLabel={this.props.applyLabel}
				rejectLabel={this.props.rejectLabel}
				classNames={className}
			>
				{this.state.panel}
			</PropertiesModal>);
		} else if (this.props.rightFlyout && this.state.subPanelVisible) {
			propertiesDialog = (<WideFlyout
				cancelHandler={this.hideSubDialog.bind(this, false)}
				okHandler={this.hideSubDialog.bind(this, true)}
				show
				applyLabel={this.props.applyLabel}
				rejectLabel={this.props.rejectLabel}
				title={this.state.title}
				light={this.props.controller.getLight()}
			>
				<div>
					{this.state.panel}
				</div>
			</WideFlyout>);
		}

		return (
			<>
				{propertiesDialog}
				{this.props.children}
			</>
		);
	}
}

SubPanelInvoker.propTypes = {
	children: PropTypes.element,
	applyLabel: PropTypes.string,
	rejectLabel: PropTypes.string,
	rightFlyout: PropTypes.bool,
	controller: PropTypes.object.isRequired
};

SubPanelInvoker.defaultProps = {
	rightFlyout: false
};
