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

import logger from "./../../../../utils/logger";
import React from "react";
import PropTypes from "prop-types";
import { Button } from "carbon-components-react";
import PropertyUtils from "./../../util/property-utils";
import { MESSAGE_KEYS } from "./../../constants/constants";


import SubPanelInvoker from "./invoker.jsx";

export default class SubPanelButton extends React.Component {
	constructor(props) {
		super(props);
		this.showSubPanel = this.showSubPanel.bind(this);
		this.onSubPanelHidden = this.onSubPanelHidden.bind(this);
	}


	onSubPanelHidden(applyChanges) {
		logger.info("onSubPanelHidden(): applyChanges=" + applyChanges);
	}

	showSubPanel() {
		this.subPanelInvoker.showSubDialog(this.props.title, this.props.panel, this.onSubPanelHidden);
	}

	render() {
		const applyLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.APPLYBUTTON_LABEL);
		const rejectLabel = PropertyUtils.formatMessage(this.props.controller.getReactIntl(), MESSAGE_KEYS.REJECTBUTTON_LABEL);

		const button = (<Button
			className="properties-subpanel-button"
			type="button"
			small
			kind="secondary"
			onClick={this.showSubPanel}
		>
			{this.props.label || ""}
		</Button>);
		return (
			<SubPanelInvoker ref={ (ref) => (this.subPanelInvoker = ref) }
				rightFlyout={this.props.rightFlyout}
				applyLabel={applyLabel}
				rejectLabel={rejectLabel}
				controller={this.props.controller}
			>
				{button}
			</SubPanelInvoker>
		);
	}
}

SubPanelButton.propTypes = {
	label: PropTypes.string,
	title: PropTypes.string.isRequired,
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	rightFlyout: PropTypes.bool,
};
