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
import classNames from "classnames";
import { Accordion, AccordionItem } from "@carbon/react";
import * as ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


class TwistyPanel extends React.Component {
	constructor(props) {
		super(props);
		this.twistyTitleHandler = props.controller.getHandlers().twistyTitleHandler ?? null;
	}

	render() {
		const className = this.props.panel.className ? this.props.panel.className : "";
		const disabled = this.props.panelState === STATES.DISABLED;

		let title = this.props.panel.label;
		let subTitle = null;
		if (this.twistyTitleHandler) {
			subTitle = this.twistyTitleHandler(this.props.panel.id);
			title = (<div className="properties-twisty-panel-title">
				{this.props.panel.label}
				{subTitle}
			</div>);
		}

		return (
			<div
				className={classNames(
					"properties-twisty-panel",
					{ "hide": this.props.panelState === STATES.HIDDEN },
					{ "properties-control-nested-panel": this.props.panel.nestedPanel },
					{ "properties-twisty-sub-title": subTitle },
					className
				)} data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
			>
				<Accordion disabled={disabled}>
					<AccordionItem disabled={disabled} open={this.props.panel.open} title={title} className="properties-twisty-accordion-item">
						{this.props.children}
					</AccordionItem>
				</Accordion>
			</div>
		);
	}
}

TwistyPanel.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	panelState: PropTypes.string // set by redux
};

const mapStateToProps = (state, ownProps) => ({
	panelState: ownProps.controller.getPanelState({ name: ownProps.panel.id })
});

export default connect(mapStateToProps, null)(TwistyPanel);
