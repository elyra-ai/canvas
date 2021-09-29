/*
 * Copyright 2017-2020 Elyra Authors
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
import { connect } from "react-redux";
import { setTitle } from "./../../actions";
import Icon from "./../../../icons/icon.jsx";
import Isvg from "react-inlinesvg";
import { get } from "lodash";
import { TextInput, Button } from "carbon-components-react";
import { MESSAGE_KEYS, CARBON_ICONS, CONDITION_MESSAGE_TYPE } from "./../../constants/constants";
import * as PropertyUtils from "./../../util/property-utils";
import classNames from "classnames";


class TitleEditor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false,
			titleValidation: null
		};
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
		this.helpClickHandler = this.helpClickHandler.bind(this);
		this.id = PropertyUtils.generateId();
		this.textInputRef = React.createRef();
		this.labelText = PropertyUtils.formatMessage(props.controller.getReactIntl(),
			MESSAGE_KEYS.TITLE_EDITOR_LABEL);
		this.textInputOnFocus = this.textInputOnFocus.bind(this);
		this.textInputOnBlur = this.textInputOnBlur.bind(this);
		this.headingEnabled = this.props.showHeading && (this.props.heading || this.props.icon);
		this.handleTitleChange = this.handleTitleChange.bind(this);
		this.getTextWidth = this.getTextWidth.bind(this);
		this.titleChangeHandler = this.props.controller.getHandlers().titleChangeHandler;
	}

	getHeightForMultiLineMessage(rightFlyoutWidth, messageWidth) {
		// Calculate height for multi-line error/warning message
		let height;
		const numberOfLines = Math.ceil(messageWidth / rightFlyoutWidth);
		if (this.headingEnabled) {
			// Following values should be consistent with values in title-editor.scss
			// properties-title-heading-height, properties-title-heading-bottom-padding, properties-title-editor-input-height, properties-title-editor-top-bottom-padding
			height = 1.5 + 0.25 + 2.5 + 0.25 + numberOfLines + 2;
		} else {
			height = 2.5 + 0.25 + numberOfLines + 2;
		}
		return height;
	}

	getTextWidth(text, font) {
		// Calculate width of given text. Reference - https://stackoverflow.com/a/21015393
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		context.font = font;
		const metrics = context.measureText(text);
		return metrics.width;
	}

	_handleKeyPress(e) {
		if (e.key === "Enter") {
			this.textInputRef.current.blur();
		}
	}

	editTitleClickHandler() {
		this.textInputRef.current.focus();
	}

	helpClickHandler() {
		if (this.props.helpClickHandler) {
			this.props.helpClickHandler(
				this.props.controller.getForm().componentId,
				this.props.help.data,
				this.props.controller.getAppData());
		}
	}
	textInputOnFocus() {
		this.setState({ focused: true });
	}

	textInputOnBlur() {
		this.setState({ focused: false });
	}

	handleTitleChange(evt) {
		const newTitle = evt.target.value;
		if (this.titleChangeHandler && typeof this.titleChangeHandler === "function") {
			const titleValidation = this.titleChangeHandler(newTitle);
			if (titleValidation && (typeof titleValidation === "object") && titleValidation.type && titleValidation.message) {
				this.setState({ titleValidation: titleValidation });
			} else if (titleValidation === null) {
				// titleChangeHandler returns null for valid title.
				this.setState({ titleValidation: titleValidation });
			} else {
				// titleChangeHandler response is invalid. Don't show error/warning for title.
				this.setState({ titleValidation: null });
			}
		}
		this.props.setTitle(newTitle);
	}

	render() {
		const propertiesTitleEditButtonLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TITLE_EDITOR_LABEL);
		const helpButtonLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TITLE_EDITOR_HELPBUTTON_LABEL);
		const titleValidationTypes = [CONDITION_MESSAGE_TYPE.ERROR, CONDITION_MESSAGE_TYPE.WARNING];

		const propertiesTitleEdit = this.props.labelEditable === false || this.state.focused ? <div />
			: (<Button kind="ghost" aria-label={propertiesTitleEditButtonLabel} className="properties-title-editor-btn edit" data-id="edit" onClick={this.editTitleClickHandler}>
				<Icon type={CARBON_ICONS.EDIT} />
			</Button>);

		const helpButton = this.props.help
			? (<Button kind="ghost" aria-label={helpButtonLabel} className="properties-title-editor-btn help" data-id="help" onClick={this.helpClickHandler}>
				<Icon type={CARBON_ICONS.INFORMATION} />
			</Button>)
			: null;

		let heading = null;
		if (this.headingEnabled) {
			const label = this.props.heading
				? (<div className="properties-title-heading-label">
					{this.props.heading}
				</div>)
				: null;
			const icon = this.props.icon && typeof this.props.icon === "string"
				? <Isvg className="properties-title-heading-icon" src={this.props.icon} />
				: null;
			if (label || icon) {
				heading = (<div className="properties-title-heading">
					{icon}
					{label}
					{helpButton}
				</div>);
			}
		}

		// Calculate height for multi-line error/warning message
		let heightStyle = {};
		if (
			titleValidationTypes.includes(get(this.state.titleValidation, "type")) &&
			get(this.state.titleValidation, "message")
		) {
			// Default rightFlyoutWidth is the width of "small" editorSize (320px)
			const rightFlyoutWidth = document.querySelector(".properties-right-flyout") ? document.querySelector(".properties-right-flyout").offsetWidth : 320;
			// At this point, div containing message is not created in DOM. So we can't use offsetWidth.
			// Get the width of text message in px. 'font-size: 0.75rem' for .bx--form-requirement.
			// Adding 16 because message has 16px left padding.
			const messageWidth = Math.ceil(this.getTextWidth(this.state.titleValidation.message, "0.75rem arial")) + 16;
			if (messageWidth > rightFlyoutWidth) {
				const multiLineMessageHeight = this.getHeightForMultiLineMessage(rightFlyoutWidth, messageWidth);
				heightStyle = { height: multiLineMessageHeight + "rem" };
			}
		}

		return (
			<div style={ heightStyle } className={classNames("properties-title-editor",
				{ "properties-title-with-heading": this.headingEnabled },
				{ "properties-title-with-warning-error": titleValidationTypes.includes(get(this.state.titleValidation, "type")) })}
			>
				{heading}
				<div className={classNames(
					"properties-title-editor-input",
					{ "properties-title-editor-with-help": this.props.help && !this.headingEnabled && !titleValidationTypes.includes(get(this.state.titleValidation, "type")) }
				)}
				>
					<TextInput
						id={this.id}
						ref={this.textInputRef}
						value={this.props.title}
						onChange={this.handleTitleChange}
						onKeyPress={(e) => this._handleKeyPress(e)}
						readOnly={this.props.labelEditable === false}
						labelText={this.labelText}
						hideLabel
						onFocus={this.textInputOnFocus}
						onBlur={this.textInputOnBlur}
						light={this.props.controller.getLight()}
						invalid={get(this.state.titleValidation, "type", null) === CONDITION_MESSAGE_TYPE.ERROR}
						invalidText={get(this.state.titleValidation, "message")}
						warn={get(this.state.titleValidation, "type", null) === CONDITION_MESSAGE_TYPE.WARNING}
						warnText={get(this.state.titleValidation, "message")}
						{... this.state.focused && { className: "properties-title-editor-focused" }}
					/>
					{titleValidationTypes.includes(get(this.state.titleValidation, "type")) ? null : propertiesTitleEdit}
				</div>
				{!this.headingEnabled && !titleValidationTypes.includes(get(this.state.titleValidation, "type")) ? helpButton : null}
			</div>
		);
	}
}

TitleEditor.propTypes = {
	helpClickHandler: PropTypes.func,
	controller: PropTypes.object.isRequired,
	labelEditable: PropTypes.bool,
	help: PropTypes.object,
	icon: PropTypes.string,
	heading: PropTypes.string,
	showHeading: PropTypes.bool,
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
