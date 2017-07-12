/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import { FormattedMessage } from "react-intl";

export default class ControlPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.getControlValue = this.getControlValue.bind(this);
	}

	getControlValue() {
		return this.props.control.getControlValue();
	}

	render() {
		return (
			<div className="well">
				<form>
					<label className="control-label" >
						<FormattedMessage id={this.props.labelId} />
					</label>
					{this.props.control}
				</form>
			</div>
		);
	}
}

ControlPanel.propTypes = {
	labelId: React.PropTypes.string,
	control: React.PropTypes.object
};
