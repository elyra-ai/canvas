/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";

export default class CustomToggleCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};

	}

	render() {
		return (
			<div className="custom-map-summary" >
				<span key="lat" className="span-text">Latitude: <text>{this.props.lat}</text></span>
				<span key="long" className="span-text">Longitude: <text>{this.props.lng}</text></span>
				<span key="zoom" className="span-text">Zoom: <text>{this.props.zoom}</text></span>
			</div>
		);
	}
}

CustomToggleCtrl.propTypes = {
	lat: PropTypes.number.isRequired,
	lng: PropTypes.number.isRequired,
	zoom: PropTypes.number.isRequired
};
