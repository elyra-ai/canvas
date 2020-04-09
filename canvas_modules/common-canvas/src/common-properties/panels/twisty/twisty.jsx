/*
 * Copyright 2017-2020 IBM Corporation
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
import { Accordion, AccordionItem } from "carbon-components-react";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


class TwistyPanel extends React.Component {

	render() {
		return (
			<div className={classNames("properties-twisty-panel", { "hide": this.props.panelState === STATES.HIDDEN })}
				disabled={this.props.panelState === STATES.DISABLED} data-id={ControlUtils.getDataId({ name: this.props.panel.id })}
			>
				<Accordion>
					<AccordionItem title={this.props.panel.label}>
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
