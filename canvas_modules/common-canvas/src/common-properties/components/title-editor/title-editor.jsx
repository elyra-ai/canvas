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
import ReactDOM from "react-dom";
import Icon from "./../../../icons/icon.jsx";
import TextField from "ap-components-react/dist/components/TextField";

export default class TitleEditor extends Component {
	constructor(props) {
		super(props);
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
		this.helpClickHandler = this.helpClickHandler.bind(this);
	}

	_handleKeyPress(e) {
		if (e.key === "Enter") {
			ReactDOM.findDOMNode(this).querySelector("input")
				.blur();
		}
	}

	editTitleClickHandler() {
		ReactDOM.findDOMNode(this).querySelector("input")
			.focus();
	}

	helpClickHandler() {
		if (this.props.helpClickHandler) {
			this.props.helpClickHandler(
				this.props.controller.getForm().componentId,
				this.props.help.data,
				this.props.controller.getAppData());
		}
	}

	render() {
		const propertiesTitleEdit = this.props.labelEditable === false ? <div />
			: (<button type="button" className="title-edit-right-flyout-panel" onClick={this.editTitleClickHandler}>
				<Icon type="edit" />
			</button>);

		const helpButton = this.props.help
			? (<button type="button" className="title-help-right-flyout-panel" onClick={this.helpClickHandler}>
				<Icon type="info" />
			</button>)
			: <div />;
		return (
			<div className="node-title-container-right-flyout-panel">
				<div className="node-title-right-flyout-panel">
					<TextField
						id="node-title-editor-right-flyout-panel"
						value={this.props.controller.getTitle()}
						onChange={(e) => this.props.controller.setTitle(e.target.value)}
						onKeyPress={(e) => this._handleKeyPress(e)}
						readOnly={this.props.labelEditable === false}
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
