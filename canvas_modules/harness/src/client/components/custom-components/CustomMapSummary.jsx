/*
 * Copyright 2017-2019 IBM Corporation
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
