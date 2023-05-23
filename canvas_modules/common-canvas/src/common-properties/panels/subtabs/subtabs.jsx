/*
 * Copyright 2017-2022 Elyra Authors
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
import { getDataId } from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";
import { v4 as uuid4 } from "uuid";

class Subtabs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTabId: ""
		};
		this.uuid = uuid4();
	}

	onClick(tabId) {
		this.setState({ activeTabId: tabId });
	}

	render() {
		const subTabs = [];
		let activeTab = 0;
		let tabIdx = 0;
		const className = this.props.className ? this.props.className : "";
		for (let i = 0; i < this.props.tabs.length; i++) {
			const tab = this.props.tabs[i];
			// TODO this might not work once we don't rerender on each change
			const panelState = this.props.controller.getPanelState({ name: tab.group });
			if (panelState !== STATES.HIDDEN) {
				const subPanelItems = this.props.genUIItem(i, tab.content);
				if (this.state.activeTabId === tab.group && panelState !== STATES.DISABLED) {
					activeTab = tabIdx;
				}

				subTabs.push(
					<Tab
						id={`subtabs.tab.${i}-${this.uuid}`}
						key={`subtabs.tab.${i}-${this.uuid}`}
						disabled={panelState === STATES.DISABLED}
						className={classNames("properties-subtab", { "properties-leftnav-subtab-item": this.props.leftnav })}
						tabIndex={tabIdx}
						label={tab.text}
						title={tab.text}
						onClick={this.onClick.bind(this, tab.group)}
						data-id={getDataId({ name: tab.group })}
					>
						{subPanelItems}
					</Tab>
				);
				tabIdx++;
			}
		}
		return (
			<div
				className={classNames(
					"properties-sub-tab-container",
					{ vertical: !this.props.rightFlyout },
					{ "properties-control-nested-panel": this.props.nestedPanel },
					{ "properties-leftnav-container": this.props.leftnav },
					className
				)}
			>
				<Tabs className={classNames("properties-subtabs", { "properties-leftnav-subtabs": this.props.leftnav })}
					selected={activeTab}
					light={this.props.controller.getLight()}
				>
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
	genUIItem: PropTypes.func.isRequired,
	className: PropTypes.string,
	nestedPanel: PropTypes.bool,
	leftnav: PropTypes.bool
};

Subtabs.defaultProps = {
	leftnav: false
};

export default Subtabs;
