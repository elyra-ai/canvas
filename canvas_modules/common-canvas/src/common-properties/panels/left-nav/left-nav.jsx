/*
 * Copyright 2022 Elyra Authors
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
import { getDataId } from "../../util/control-utils";
import { STATES } from "../../constants/constants.js";

class LeftNav extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTabId: ""
		};
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
						key={"subtabs.tab." + i}
						disabled={panelState === STATES.DISABLED}
						className="properties-leftnav-subtab-item"
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
			<div className={classNames("properties-left-nav-container",
				{ "properties-control-nested-panel": this.props.nestedPanel },
				className
			)}
			>
				<Tabs className="properties-leftnav-subtabs" selected={activeTab} light={this.props.controller.getLight()}>
					{subTabs}
				</Tabs>
			</div>
		);
	}
}

LeftNav.propTypes = {
	tabs: PropTypes.array.isRequired,
	controller: PropTypes.object.isRequired,
	genUIItem: PropTypes.func.isRequired,
	className: PropTypes.string,
	nestedPanel: PropTypes.bool
};

export default LeftNav;
