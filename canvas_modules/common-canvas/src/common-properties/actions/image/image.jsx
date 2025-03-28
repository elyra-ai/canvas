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
import { connect } from "react-redux";
import { Button } from "@carbon/react";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";

class ImageAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.applyAction = this.applyAction.bind(this);
		this.renderIcon = this.renderIcon.bind(this);
		this.height = "";
		this.width = "";
	}

	applyAction() {
		if (this.props.state !== STATES.DISABLED) { // this is needed to mimic disabled action button
			// fire event and let the application determine how to handle the action
			const actionHandler = this.props.controller.getHandlers().actionHandler;
			if (typeof actionHandler === "function") {
				actionHandler(this.props.action.name,
					this.props.controller.getAppData(), this.props.action.data);
			}
		}
	}

	renderIcon() {
		const icon = (<img
			src={this.props.action.image.url}
			aria-label={this.props.action.name}
			height={this.height}
			width={this.width}
		/>);
		return icon;
	}

	render() {

		const disabled = this.props.state === STATES.DISABLED;
		const customClassName = this.props.action.className ? this.props.action.className : "";
		const className = classNames("properties-action-image", { "left": this.props.action.image.placement === "left" },
			{ "right": this.props.action.image.placement === "right" }, { "hide": this.props.state === STATES.HIDDEN },
			{ "disabled": disabled }, customClassName);
		if (this.props.action.image.size) {
			this.height = this.props.action.image.size.height + "px";
			this.width = this.props.action.image.size.width + "px";
		}

		const image = (
			<div
				style={{
					width: this.width,
					height: this.height
				}}
			>
				<Button
					// Use description to hide carbon tooltip
					hasIconOnly={Boolean(this.props.action.description?.text)}
					renderIcon={this.renderIcon}
					className="properties-action-image-button"
					onClick={this.applyAction}
					kind="ghost"
					iconDescription={this.props.action?.description?.text}
					autoAlign
				/>
			</div>
		);


		return (
			<div className={className}>
				{image}
			</div>
		);
	}
}

ImageAction.propTypes = {
	action: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	state: PropTypes.string, // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	state: ownProps.controller.getActionState(ownProps.controller.convertPropertyId(ownProps.action.name)),
});

export default connect(mapStateToProps, null)(ImageAction);
