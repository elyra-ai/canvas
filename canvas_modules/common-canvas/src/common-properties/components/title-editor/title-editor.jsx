/*
 * Copyright 2017-2024 Elyra Authors
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
import Isvg from "react-inlinesvg";
import { get } from "lodash";
import classNames from "classnames";
import { Help, Edit, Close, Information } from "@carbon/react/icons";
import { TextInput, Button, Layer } from "@carbon/react";
import { Toggletip, ToggletipButton, ToggletipContent, ToggletipActions } from "@carbon/react";

import { setTitle } from "./../../actions";
import { MESSAGE_KEYS, CONDITION_MESSAGE_TYPE } from "./../../constants/constants";
import * as PropertyUtils from "./../../util/property-utils";
import ActionFactory from "../../actions/action-factory.js";

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
		this.titleChangeHandler = this.props.controller.getHandlers().titleChangeHandler;
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
		// Clear warning/error message on change.
		if (this.state.titleValidation !== null) {
			this.setState({ titleValidation: null });
		}
		const newTitle = evt.target.value;
		if (typeof this.titleChangeHandler === "function") {
			this.titleChangeHandler(newTitle, (titleValidation) => {
				if (titleValidation && (typeof titleValidation === "object") && titleValidation.type && titleValidation.message) {
					this.setState({ titleValidation: titleValidation });
				} else {
					// titleChangeHandler response is invalid. Don't show error/warning for title.
					this.setState({ titleValidation: null });
				}
			});
		}
		this.props.setTitle(newTitle);
	}

	createTitleActions() {
		if (this.props.titleInfo && this.props.titleInfo.Title.actionIds().length > 0) {
			this.actionFactory = new ActionFactory(this.props.controller);
			const actions = [];
			this.props.titleInfo.Title.actionIds().forEach((actionRef, idx) => {
				const actionMetadata = this.props.controller.getAction({ name: actionRef });
				const action = this.actionFactory.generateAction(`${actionRef}-${idx}`, actionMetadata);
				actions.push(<div className="properties-title-editor-action-btn" key={`${actionRef}-${idx}`}>
					{action}
				</div>);
			});
			return (<div className="properties-title-editor-actions">
				{actions}
			</div>);
		}
		return null;
	}

	render() {
		if (this.props.title === null) {
			return null;
		}
		const propertiesTitleEditButtonLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TITLE_EDITOR_LABEL);
		const helpButtonLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.TITLE_EDITOR_HELPBUTTON_LABEL);
		const closeButtonLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.PROPERTIESEDIT_CLOSEBUTTON_LABEL);
		const titleValidationTypes = [CONDITION_MESSAGE_TYPE.ERROR, CONDITION_MESSAGE_TYPE.WARNING];
		const titleWithWarning = get(this.state.titleValidation, "type", null) === CONDITION_MESSAGE_TYPE.WARNING;
		const titleWithErrror = get(this.state.titleValidation, "type", null) === CONDITION_MESSAGE_TYPE.ERROR;

		const propertiesTitleEdit = this.props.labelEditable === false || this.state.focused ? <div />
			: (<Button
				kind="ghost"
				className="properties-title-editor-btn edit"
				data-id="edit"
				onClick={this.editTitleClickHandler}
				tooltipPosition="bottom"
				tooltipAlignment="end"
				renderIcon={Edit}
				size="sm"
				iconDescription={propertiesTitleEditButtonLabel}
				hasIconOnly
			/>);

		const renderTooltip = (isDescWithLink) => {
			const { description } = this.props;
			// If description is present and has a link, show help button
			const tooltipButton = isDescWithLink ? (
				<ToggletipActions>
					<Button
						className="properties-title-editor-desc-btn desc-help"
						onClick={this.helpClickHandler}
						data-id="desc-help"
						size="sm"
					>
						{helpButtonLabel}
					</Button>
				</ToggletipActions>
			) : null;

			return (
				<span className="properties-title-desc-icon">
					<Toggletip className="properties-title-desc-tooltip" align="bottom" autoAlign>
						<ToggletipButton label="Additional information">
							<Information />
						</ToggletipButton>
						<ToggletipContent>
							<p className="properties-title-editor-desc">{description}</p>
							{tooltipButton}
						</ToggletipContent>
					</Toggletip>
				</span>
			);
		};

		const renderHelpButton = () => {
			const { help } = this.props;

			return help ? (
				<Button
					kind="ghost"
					className="properties-title-editor-btn help"
					data-id="help"
					onClick={this.helpClickHandler}
					tooltipPosition="bottom"
					renderIcon={Help}
					size="sm"
					iconDescription={helpButtonLabel}
					hasIconOnly
				/>
			) : null;
		};

		const renderHelpOrTooltipButton = () => {
			const { showHeadingDesc, description, help } = this.props;

			// If showHeadingDesc is true and description is present, show tooltip
			if (showHeadingDesc && description) {
				return renderTooltip(help);
			}

			// If description is not present, show help button
			return renderHelpButton();
		};

		const helpButton = renderHelpOrTooltipButton();

		const closeButton = this.props.closeHandler
			? (<div className="properties-close-button">
				<Button
					kind="ghost"
					size="sm"
					data-id="close"
					onClick={this.props.closeHandler}
					tooltipPosition="left"
					renderIcon={Close}
					iconDescription={closeButtonLabel}
					hasIconOnly
				/>
			</div>)
			: null;

		let heading = null;
		if (this.headingEnabled) {
			const label = this.props.heading
				? (<div className="properties-title-heading-label">
					{this.props.heading}
				</div>)
				: null;
			const icon = this.props.icon && typeof this.props.icon === "string"
				? <Isvg className="properties-title-heading-icon" src={this.props.icon} aria-hidden="true" />
				: null;
			if (label || icon) {
				heading = (<div className="properties-title-heading">
					{icon}
					{label}
					{helpButton}
				</div>);
			}
		}

		return (
			<div className={classNames("properties-title-editor",
				{ "properties-title-with-heading": this.headingEnabled },
				{ "properties-title-right-flyout-tabs-view": this.props.rightFlyoutTabsView })}
			>
				{closeButton}
				{heading}
				<div className={classNames(
					"properties-title-editor-input",
					{
						"properties-title-editor-with-help": (this.props.help || this.props.description) &&
															!this.headingEnabled && !titleValidationTypes.includes(get(this.state.titleValidation, "type")),
						"properties-title-editor-with-warning": titleWithWarning,
						"properties-title-editor-with-error": titleWithErrror
					}
				)}
				>
					<Layer level={this.props.controller.getLight() ? 1 : 0} className="properties-title-editor-layer">
						<TextInput
							id={this.id}
							ref={this.textInputRef}
							value={this.props.title}
							onChange={this.handleTitleChange}
							onKeyDown={(e) => this._handleKeyPress(e)}
							readOnly={this.props.labelEditable === false} // shows a non editable icon
							labelText={this.labelText}
							hideLabel
							size="sm"
							onFocus={this.textInputOnFocus}
							onBlur={this.textInputOnBlur}
							invalid={titleWithErrror}
							invalidText={get(this.state.titleValidation, "message")}
							warn={titleWithWarning}
							warnText={get(this.state.titleValidation, "message")}
							{... this.state.focused && { className: "properties-title-editor-focused" }}
						/>
					</Layer>
					{titleValidationTypes.includes(get(this.state.titleValidation, "type")) ? null : propertiesTitleEdit}
				</div>
				{!this.headingEnabled && !titleValidationTypes.includes(get(this.state.titleValidation, "type")) ? helpButton : null}
				{this.createTitleActions()}
			</div>
		);
	}
}

TitleEditor.propTypes = {
	helpClickHandler: PropTypes.func,
	closeHandler: PropTypes.func,
	controller: PropTypes.object.isRequired,
	labelEditable: PropTypes.bool,
	help: PropTypes.object,
	icon: PropTypes.string,
	heading: PropTypes.string,
	showHeading: PropTypes.bool,
	showHeadingDesc: PropTypes.bool,
	rightFlyoutTabsView: PropTypes.bool,
	titleInfo: PropTypes.object,
	description: PropTypes.object,
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
