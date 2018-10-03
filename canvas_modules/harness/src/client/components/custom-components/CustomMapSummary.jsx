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

	render() {
		return (
			<div className="harness-custom-control-custom-map-summary" >
				<span key="lat" className="span-text">Latitude: <span>{this.props.lat}</span></span>
				<span key="long" className="span-text">Longitude: <span>{this.props.lng}</span></span>
				<span key="zoom" className="span-text">Zoom: <span>{this.props.zoom}</span></span>
			</div>
		);
	}
}

CustomToggleCtrl.propTypes = {
	lat: PropTypes.number.isRequired,
	lng: PropTypes.number.isRequired,
	zoom: PropTypes.number.isRequired
};
