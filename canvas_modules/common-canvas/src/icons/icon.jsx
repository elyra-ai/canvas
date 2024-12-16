/*
 * Copyright 2017-2025 Elyra Authors
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
import classNames from "classnames";
import SVG from "react-inlinesvg";

import Double from "./../../assets/images/double.svg";
import Integer from "./../../assets/images/integer.svg";
import StringIcon from "./../../assets/images/string.svg";

import { WarningFilled, ErrorFilled, CheckmarkFilled, InformationFilled, Information,
	ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
	AddAlt,
	Settings,
	Search,
	Warning,
	Edit,
	CircleDash, RulerAlt, ListNumbered, ListBulleted, Flag, ChartVennDiagram,
	Calendar, Time, EventSchedule } from "@carbon/react/icons";

import { ERROR, WARNING, INFO, SUCCESS, CANVAS_CARBON_ICONS, CONTEXT_MENU_CARBON_ICONS } from "../common-canvas/constants/canvas-constants";
import { CONDITION_MESSAGE_TYPE, CARBON_ICONS, DATA_TYPE } from "../common-properties/constants/constants";

const iconClassName = "properties-icon";

export default class Icon extends React.Component {
	constructor() {
		super();
		this.canvasIcons = {
			double: Double,
			integer: Integer,
			string: StringIcon
		};
	}

	getCarbonIcon(type, customClassName) {
		const className = iconClassName + " " + customClassName;

		switch (type) {
		case (ERROR):
		case (CONDITION_MESSAGE_TYPE.ERROR):
			return <ErrorFilled className={classNames("canvas-state-icon-error", className)} disabled={this.props.disabled} />;
		case (WARNING):
		case (CONDITION_MESSAGE_TYPE.WARNING):
			return <WarningFilled className={classNames("canvas-state-icon-warning", className)} disabled={this.props.disabled} />;
		case (SUCCESS):
		case (CONDITION_MESSAGE_TYPE.SUCCESS):
			return <CheckmarkFilled className={classNames("canvas-state-icon-success", className)} disabled={this.props.disabled} />;
		case (CONDITION_MESSAGE_TYPE.INFO):
			return <InformationFilled className={classNames("canvas-state-icon-info", className)} disabled={this.props.disabled} />;

		case (INFO):
		case (CARBON_ICONS.INFORMATION):
			return <Information className={classNames("canvas-state-icon-information-hollow", className)} disabled={this.props.disabled} />;
		case (CARBON_ICONS.CHEVRONARROWS.UP):
			return <ChevronUp className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.CHEVRONARROWS.DOWN):
			return <ChevronDown className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.CHEVRONARROWS.LEFT):
			return <ChevronLeft className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.CHEVRONARROWS.RIGHT):
			return <ChevronRight className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.ADD):
			return <AddAlt className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.SETTINGS):
			return <Settings className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.EDIT):
			return <Edit className={className} disabled={this.props.disabled} />;

		case (CANVAS_CARBON_ICONS.SEARCH):
			return <Search className={className} disabled={this.props.disabled} />;
		case (CANVAS_CARBON_ICONS.WARNING_UNFILLED):
			return <Warning className={className} disabled={this.props.disabled} />;

		case (CONTEXT_MENU_CARBON_ICONS.CHEVRONARROWS.RIGHT):
			return <ChevronRight className={className} disabled={this.props.disabled} />;

		case (CARBON_ICONS.MEASUREMENTS.EMPTY):
			return <CircleDash className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.MEASUREMENTS.SCALE):
			return <RulerAlt className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.MEASUREMENTS.ORDINAL):
			return <ListNumbered className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.MEASUREMENTS.NOMINAL):
			return <ListBulleted className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.MEASUREMENTS.FLAG):
			return <Flag className={className} disabled={this.props.disabled} />;
		case (CARBON_ICONS.MEASUREMENTS.DISCRETE):
			return <ChartVennDiagram className={className} disabled={this.props.disabled} />;

		case (DATA_TYPE.DATE):
			return <Calendar className={className} disabled={this.props.disabled} />;
		case (DATA_TYPE.TIME):
			return <Time className={className} disabled={this.props.disabled} />;
		case (DATA_TYPE.TIMESTAMP):
			return <EventSchedule className={className} disabled={this.props.disabled} />;

		default: return null;
		}
	}

	getCanvasIcon(type) {
		return this.canvasIcons[type];
	}

	render() {
		let icon = this.getCarbonIcon(this.props.type, this.props.className);
		if (!icon) {
			icon = this.getCanvasIcon(this.props.type);
			if (typeof icon !== "undefined") {
				const className = classNames("canvas-icon", iconClassName, this.props.className);
				icon = <SVG src={icon} className={className} disabled={this.props.disabled} />;
			} else {
				icon = <div />;
			}
		}
		return icon;
	}
}

Icon.defaultProps = {
	className: "",
	disabled: false
};

Icon.propTypes = {
	type: PropTypes.string.isRequired,
	className: PropTypes.string,
	disabled: PropTypes.bool
};
