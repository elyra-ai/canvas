/*
 * Copyright 2020 IBM Corporation
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
import { Tabs, Tab } from "carbon-components-react";
import { STATES } from "./../../constants/constants.js";

class Subtabs extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeSubTab: 0
		};
	}

	subTabsOnClick(tabIdx) {
		this.setState({ activeSubTab: tabIdx });
	}

	render() {
		const subTabs = [];
		for (let i = 0; i < this.props.tabs.length; i++) {
			const tab = this.props.tabs[i];
			const subPanelItems = this.props.genUIItem(i, tab.content);
			const panelState = this.props.controller.getPanelState({ name: tab.group });
			if (panelState !== STATES.HIDDEN) {
				subTabs.push(
					<Tab
						key={"subtabs.tab." + i}
						disabled={panelState === STATES.DISABLED}
						className="properties-subtab"
						tabIndex={i}
						label={tab.text}
						onClick={this.subTabsOnClick.bind(this, i)}
					>
						{subPanelItems}
					</Tab>
				);
			}
		}
		return (
			<div className={classNames("properties-sub-tab-container", { vertical: !this.props.rightFlyout })}>
				<Tabs className="properties-subtabs" selected={this.state.activeSubTab}>
					{subTabs}
				</Tabs>
			</div>
		);
	}
}

Subtabs.propTypes = {
	tabs: PropTypes.array.isRequired,
	controller: PropTypes.object.isRequired,
	rightFlyout: PropTypes.bool,
	genUIItem: PropTypes.func.isRequired
};

export default Subtabs;
