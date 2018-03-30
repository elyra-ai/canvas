/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import Icon from "../../icons/icon.jsx";
import TextField from "ap-components-react/dist/components/TextField";

export default class TitleEditor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			propertiesTitleReadOnly: true
		};
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
		this.helpClickHandler = this.helpClickHandler.bind(this);
	}
	setPropertiesTitleReadOnlyMode(mode) {
		let bottomBorderStyle = "2px solid #c7c7c7";
		if (mode) {
			bottomBorderStyle = "none";
		}
		this.setState({
			propertiesTitleReadOnly: mode,
			propertiesTitleEditStyle: { borderBottom: bottomBorderStyle }
		});
	}

	_handleKeyPress(e) {
		if (e.key === "Enter") {
			this.setPropertiesTitleReadOnlyMode(true);
		}
	}

	editTitleClickHandler() {
		this.setPropertiesTitleReadOnlyMode(false);
	}

	helpClickHandler() {
		if (this.props.helpClickHandler) {
			this.props.helpClickHandler(
				this.props.controller.getForm().componentId,
				this.props.controller.getForm().help.data,
				this.props.controller.getAppData());
		}
	}

	render() {
		const propertiesTitleEdit = this.props.labelEditable === false ? <div />
			: (<a className="title-edit-right-flyout-panel" onClick={this.editTitleClickHandler}>
				<Icon type="edit" />
			</a>);

		const helpButton = this.props.help
			? (<a className="title-help-right-flyout-panel" onClick={this.helpClickHandler}>
				<Icon type="info" />
			</a>)
			: <div />;
		return (
			<div className="node-title-container-right-flyout-panel">
				<div className="node-title-right-flyout-panel">
					<TextField
						id="node-title-editor-right-flyout-panel"
						value={this.props.controller.getTitle()}
						onChange={(e) => this.props.controller.setTitle(e.target.value)}
						onBlur={(e) => this.setPropertiesTitleReadOnlyMode(true)}
						onKeyPress={(e) => this._handleKeyPress(e)}
						readOnly={this.state.propertiesTitleReadOnly}
						style={this.state.propertiesTitleEditStyle}
					/>
				</div>
				{propertiesTitleEdit}
				{helpButton}
			</div>
		);
	}
}

TitleEditor.propTypes = {
	helpClickHandler: PropTypes.func,
	controller: PropTypes.object,
	labelEditable: PropTypes.bool,
	help: PropTypes.object
};
