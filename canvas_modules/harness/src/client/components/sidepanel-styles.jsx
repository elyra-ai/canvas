/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

import {
	RadioGroup
} from "ap-components-react/dist/ap-components-react";
import {
	CURVE,
	ELBOW,
	STRAIGHT
} from "../constants/constants.js";

export default class SidePanelStyles extends React.Component {
	constructor(props) {
		super(props);

		this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
	}

	linkTypeOptionChange(evt, obj) {
		this.props.setLinkTypeStyle(obj.selected);
	}

	render() {
		var divider = (<div
			className="sidepanel-children sidepanel-divider"
		/>);

		var linkStyle = (<div className="sidepanel-children" id="sidepanel-style-links">
			<div className="sidepanel-headers">Link Types</div>
			<RadioGroup
				dark
				onChange={this.linkTypeOptionChange}
				choices={[
					STRAIGHT,
					CURVE,
					ELBOW
				]}
				selected={STRAIGHT}
			/>
		</div>);

		return (
			<div>
				{linkStyle}
				{divider}
			</div>
		);
	}
}

SidePanelStyles.propTypes = {
	setLinkTypeStyle: React.PropTypes.func,
	log: React.PropTypes.func
};
