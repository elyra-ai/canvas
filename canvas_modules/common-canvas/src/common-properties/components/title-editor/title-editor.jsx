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
import TextInput from "carbon-components-react/lib/components/TextInput";
import { MESSAGE_KEYS, MESSAGE_KEYS_DEFAULTS } from "./../../constants/constants";
import PropertyUtils from "./../../util/property-utils";

import { injectIntl, intlShape } from "react-intl";

class TitleEditor extends Component {
	constructor(props) {
		super(props);
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
		this.helpClickHandler = this.helpClickHandler.bind(this);
		this.id = PropertyUtils.generateId();
		this.labelText = PropertyUtils.formatMessage(props.intl,
			MESSAGE_KEYS.TITLE_EDITOR_LABEL, MESSAGE_KEYS_DEFAULTS.TITLE_EDITOR_LABEL);
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
			: (<button type="button" className="properties-title-editor-btn edit" data-id="edit" onClick={this.editTitleClickHandler}>
				<Icon type="edit" />
			</button>);

		const helpButton = this.props.help
			? (<button type="button" className="properties-title-editor-btn" data-id="help" onClick={this.helpClickHandler}>
				<Icon type="info" />
			</button>)
			: <div />;

		return (
			<div className="properties-title-editor">
				<div className="properties-title-editor-input">
					<TextInput
						id={this.id}
						value={this.props.controller.getTitle()}
						onChange={(e) => this.props.controller.setTitle(e.target.value)}
						onKeyPress={(e) => this._handleKeyPress(e)}
						readOnly={this.props.labelEditable === false}
						labelText={this.labelText}
						hideLabel
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
	help: PropTypes.object,
	intl: intlShape
};

export default injectIntl(TitleEditor);
