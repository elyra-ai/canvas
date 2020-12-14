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
import { TextInput, Button } from "carbon-components-react";
import { MESSAGE_KEYS, CARBON_ICONS } from "./../../constants/constants";
import * as PropertyUtils from "./../../util/property-utils";
import classNames from "classnames";


class TitleEditor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false
		};
		this.editTitleClickHandler = this.editTitleClickHandler.bind(this);
		this.helpClickHandler = this.helpClickHandler.bind(this);
		this.id = PropertyUtils.generateId();
		this.textInputRef = React.createRef();
		this.labelText = PropertyUtils.formatMessage(props.controller.getReactIntl(),
			MESSAGE_KEYS.TITLE_EDITOR_LABEL);
		this.textInputOnFocus = this.textInputOnFocus.bind(this);
		this.textInputOnBlur = this.textInputOnBlur.bind(this);

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

	render() {
		const propertiesTitleEdit = this.props.labelEditable === false || this.state.focused ? <div />
			: (<Button kind="ghost" className="properties-title-editor-btn edit" data-id="edit" onClick={this.editTitleClickHandler}>
				<Icon type={CARBON_ICONS.EDIT} />
			</Button>);

		const helpButton = this.props.help
			? (<Button kind="ghost" className="properties-title-editor-btn" data-id="help" onClick={this.helpClickHandler}>
				<Icon type={CARBON_ICONS.INFORMATION} />
			</Button>)
			: null;

		let subtitle = null;
		if (this.props.uihints && (this.props.uihints.label || this.props.uihints.icon)) {
			let label = null;
			if (this.props.uihints.label) {
				if (typeof this.props.uihints.label === "string") {
					label = this.props.uihints.label;
				} else if (this.props.uihints.label.default) {
					label = this.props.uihints.label.default;
				}
			}
			const icon = this.props.uihints.icon && typeof this.props.uihints.icon === "string"
				? <img className="properties-title-subtitle-icon" src={this.props.uihints.icon} />
				: null;

			subtitle = (<div className="properties-title-subtitle">
				{icon}
				<div className="properties-title-subtitle-label">
					{label}
				</div>
			</div>);
		}


		return (
			<div className={classNames("properties-title-editor",
				{ "properties-title-with-subtitle": this.props.uihints && (this.props.uihints.label || this.props.uihints.icon) })}
			>
				{subtitle}
				<div className="properties-title-editor-input">
					<TextInput
						id={this.id}
						ref={this.textInputRef}
						value={this.props.title}
						onChange={(e) => this.props.setTitle(e.target.value)}
						onKeyPress={(e) => this._handleKeyPress(e)}
						readOnly={this.props.labelEditable === false}
						labelText={this.labelText}
						hideLabel
						onFocus={this.textInputOnFocus}
						onBlur={this.textInputOnBlur}
						{... this.state.focused && { className: "properties-title-editor-focused" }}
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
	uihints: PropTypes.object,
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
