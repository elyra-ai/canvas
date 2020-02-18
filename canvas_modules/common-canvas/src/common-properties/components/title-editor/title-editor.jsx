/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import { setTitle } from "./../../actions";
import Icon from "./../../../icons/icon.jsx";
import Button from "carbon-components-react/lib/components/Button";
import TextInput from "carbon-components-react/lib/components/TextInput";
import { MESSAGE_KEYS, CARBON_ICONS } from "./../../constants/constants";
import PropertyUtils from "./../../util/property-utils";

class TitleEditor extends Component {
	constructor(props) {
		super(props);
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
		this.helpClickHandler = this.helpClickHandler.bind(this);
		this.id = PropertyUtils.generateId();
		this.labelText = PropertyUtils.formatMessage(props.controller.getReactIntl(),
			MESSAGE_KEYS.TITLE_EDITOR_LABEL);
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
			: (<Button kind="ghost" className="properties-title-editor-btn edit" data-id="edit" onClick={this.editTitleClickHandler}>
				<Icon type={CARBON_ICONS.EDIT} />
			</Button>);

		const helpButton = this.props.help
			? (<Button kind="ghost" className="properties-title-editor-btn" data-id="help" onClick={this.helpClickHandler}>
				<Icon type={CARBON_ICONS.INFORMATION} />
			</Button>)
			: <div />;

		return (
			<div className="properties-title-editor">
				<div className="properties-title-editor-input">
					<TextInput
						id={this.id}
						value={this.props.title}
						onChange={(e) => this.props.setTitle(e.target.value)}
						onKeyPress={(e) => this._handleKeyPress(e)}
						readOnly={this.props.labelEditable === false}
						labelText={this.labelText}
						hideLabel
					/>
					{propertiesTitleEdit}
				</div>
				{helpButton}
			</div>
		);
	}
}

TitleEditor.propTypes = {
	helpClickHandler: PropTypes.func,
	controller: PropTypes.object.isRequired,
	labelEditable: PropTypes.bool,
	help: PropTypes.object,
	title: PropTypes.string, // set by redux
	setTitle: PropTypes.func // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	title: state.componentMetadataReducer.title
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	setTitle: (title) => {
		dispatch(setTitle(title));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(TitleEditor);
