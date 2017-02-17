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
	CURVE,
	ELBOW,
	STRAIGHT
} from "../constants/constants.js";

export default class SidePanelStyles extends React.Component {
	constructor(props) {
		super(props);

		this.linkTypeOptionChange = this.linkTypeOptionChange.bind(this);
	}

	linkTypeOptionChange(changeEvent) {
		this.props.setLinkTypeStyle(changeEvent.target.value);
	}

	render() {
		var selectedLinkTypeStyle = this.props.selectedLinkTypeStyle;

		var divider = (<div
			className="sidepanel-children sidepanel-divider"
		/>);

		var linkStyle = (<div className="sidepanel-children" id="sidepanel-style-links">
			<form>
				<div className="sidepanel-headers">Link Types</div>
				<div className="sidepanel-radio">
					<input type="radio"
						value={STRAIGHT}
						checked={ selectedLinkTypeStyle === STRAIGHT }
						onChange={this.linkTypeOptionChange}
					/>
					Straight
				</div>
				<div className="sidepanel-radio">
					<input type="radio" value={CURVE}
						checked={ selectedLinkTypeStyle === CURVE }
						onChange={this.linkTypeOptionChange}
					/>
					Curve
				</div>
				<div className="sidepanel-radio">
					<input type="radio" value={ELBOW}
						checked={ selectedLinkTypeStyle === ELBOW }
						onChange={ this.linkTypeOptionChange }
					/>
					Elbow
				</div>
			</form>
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
	selectedLinkTypeStyle: React.PropTypes.string,
	log: React.PropTypes.func
};
