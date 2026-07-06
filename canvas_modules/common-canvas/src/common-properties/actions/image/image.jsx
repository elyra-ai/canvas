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
import SVG from "react-inlinesvg";
import { STATES } from "./../../constants/constants.js";
import classNames from "classnames";

class ImageAction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			marginTop: null
		};
		this.applyAction = this.applyAction.bind(this);
		this.renderIcon = this.renderIcon.bind(this);
		this.getIcon = this.getIcon.bind(this);
		this.imageRef = React.createRef();

		this.imageDimensions = this.props.action?.image?.size
			? {
				height: `${this.props.action.image.size.height}px`,
				width: `${this.props.action.image.size.width}px`
			}
			: {};
	}

	componentDidMount() {
		this.updateMarginTop();
	}

	componentDidUpdate() {
		this.updateMarginTop();
	}

	getIcon(filePath) {
		const extension = filePath.split(".").pop()
			.toLowerCase();
		if (extension === "svg") {
			return (<SVG
				src={filePath}
				aria-label={this.props.action.name}
				{...this.imageDimensions}
			/>);
		}
		return (<img
			src={filePath}
			aria-label={this.props.action.name}
			{...this.imageDimensions}
		/>);
	}

	// For accessible controls the action image lives in .properties-ctrl-wrapper.action beside
	// the Carbon TextInput. Carbon renders the label + any on-panel description inside
	// .cds--label, so we measure its rendered height (plus its 8px margin-bottom) and apply
	// that as margin-top so the icon stays aligned with the input regardless of description length.
	updateMarginTop() {
		const el = this.imageRef.current;
		if (!el) {
			return;
		}
		const wrapper = el.closest(".properties-ctrl-wrapper.action");
		if (!wrapper) {
			return; // non-accessible controls: margin-top is handled by SCSS
		}
		const labelEl = wrapper.querySelector(".cds--label");
		if (!labelEl) {
			return;
		}
		const labelContentHeight = Math.round(labelEl.getBoundingClientRect().height);
		if (labelContentHeight <= 0) {
			return; // not yet laid out or hidden
		}
		// .cds--label has margin-bottom: $spacing-03 (8px) which also separates label from input
		const cdslLabelMarginBottom = 8;
		const newMarginTop = labelContentHeight + cdslLabelMarginBottom;
		if (newMarginTop !== this.state.marginTop) {
			this.setState({ marginTop: newMarginTop });
		}
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
		const icon = this.getIcon(this.props.action.image.url);
		return icon;
	}

	render() {

		const disabled = this.props.state === STATES.DISABLED;
		const customClassName = this.props.action.className ? this.props.action.className : "";
		const className = classNames("properties-action-image", { "left": this.props.action.image.placement === "left" },
			{ "right": this.props.action.image.placement === "right" }, { "hide": this.props.state === STATES.HIDDEN },
			{ "disabled": disabled }, customClassName);

		const image = (
			<Button
				data-id={this.props.action.name}
				renderIcon={this.renderIcon}
				className="properties-action-image-button"
				onClick={this.applyAction}
				kind="ghost"
				iconDescription={this.props.action?.description?.text} // Text to appear in Tooltip
				autoAlign
				style={this.imageDimensions}
				disabled={disabled}
				// Ensures the button is treated as icon-only when a description is present,
				// preventing an empty tooltip from appearing.
				hasIconOnly={Boolean(this.props.action.description?.text)}
			/>
		);


		const marginStyle = this.state.marginTop !== null ? { marginTop: `${this.state.marginTop}px` } : {};

		return (
			<div ref={this.imageRef} className={className} style={marginStyle}>
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
