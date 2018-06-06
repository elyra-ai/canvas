/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import { injectIntl, intlShape } from "react-intl";
import classNames from "classnames";
import Accordion from "carbon-components-react/lib/components/Accordion";
import AccordionItem from "carbon-components-react/lib/components/AccordionItem";
import ControlUtils from "./../../util/control-utils";
import { STATES } from "./../../constants/constants.js";


class TwistyPanel extends React.Component {

	render() {
		const propertyId = { name: this.props.panelId };
		const state = this.props.controller.getPanelState(propertyId);

		return (
			<div className={classNames("properties-twisty-panel", { "hide": state === STATES.HIDDEN })}
				disabled={state === STATES.DISABLED} data-id={ControlUtils.getDataId(propertyId)}
			>
				<Accordion>
					<AccordionItem title={this.props.label}>
						{this.props.children}
					</AccordionItem>
				</Accordion>
			</div>
		);
	}
}

TwistyPanel.propTypes = {
	label: PropTypes.string.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array,
	panelId: PropTypes.string.isRequired,
	intl: intlShape
};

export default injectIntl(TwistyPanel);
