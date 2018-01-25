/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";
import Icon from "ap-components-react/dist/components/Icon";
import CustomMapSummary from "./CustomMapSummary";

//* eslint no-unused-expressions: ["error", { "allow": ["CustomMapCtrl"] }] */


export default class CustomMapCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		const controlValue = props.controller.getPropertyValue(this.props.propertyId);

		if (controlValue && controlValue.length >= 3) {
			this.lat = controlValue[0];
			this.lng = controlValue[1];
			this.zoom = controlValue[2];
		} else {
			this.lat = 37.5;
			this.lng = 238;
			this.zoom = 9;
		}
		this.coords = { "latitude": "Latitude: 0", "longitude": "Longitude: 0" };
		this.initialized = false;
		this.resized = false;
		this.initMap = this.initMap.bind(this);
		this.goSomewhere = this.goSomewhere.bind(this);
		this.setInternalState = this.setInternalState.bind(this);
		const mapSummary = (<CustomMapSummary lng={this.lng} lat={this.lat} zoom={this.zoom} />);
		props.controller.updateCustPropSumPanelValue(props.propertyId,
			{ value: mapSummary, label: "Map" });
	}

	componentDidMount() {
		window.initMap = this.initMap;
		this.scriptNode = loadJS("https://maps.googleapis.com/maps/api/js?key=AIzaSyAJk__FG0WnuEHQyHMsXvzeTwC0Z7mgIds&callback=initMap");
	}

	componentWillUnmount() {
		if (this.zoomListener) {
			this.zoomListener.remove();
			this.zoomListener = null;
		}
		if (this.centerListener) {
			this.centerListener.remove();
			this.centerListener = null;
		}
		if (this.scriptNode) {
			this.scriptNode.remove();
			this.scriptNode = null;
		}
		window.google = {};
	}

	setInternalState(lat, lng, zoom) {
		this.lat = lat;
		this.lng = lng;
		this.zoom = zoom;
		const value = [lat, lng, zoom];
		this.coords = this.formatCoords(lat, lng);
		this.props.controller.updatePropertyValue(this.props.propertyId, value);
		this.props.controller.updatePropertyValue(
			{ name: this.props.data.parameter_ref }, zoom); // update value in another control
		const mapSummary = (<CustomMapSummary lng={this.lng} lat={this.lat} zoom={this.zoom} />);
		this.props.controller.updateCustPropSumPanelValue(this.props.propertyId,
			{ value: mapSummary, label: "Map" });
	}

	goSomewhere(where, zoom) {
		const that = this;
		this.map.panTo(where);
		setTimeout(function() {
			that.map.setZoom(zoom);
			setTimeout(function() {
				that.map.setMapTypeId("hybrid");
				// Update component state
				that.setInternalState(where.lat, where.lng, zoom);
			}, 100);
		}, 100);
	}

	gotoArmonk() {
		const ARMONK_POSITION = {
			lat: 41.113575,
			lng: -73.716052
		};
		this.goSomewhere(ARMONK_POSITION, 18);
	}

	gotoSVL() {
		const SVL_POSITION = {
			lat: 37.1957,
			lng: 238.2518
		};
		this.goSomewhere(SVL_POSITION, 18);
	}

	formatCoords(lat, lng) {
		const decimals = 100000;
		const latitude = "Latitude: " + (Math.round(lat * decimals) / decimals);
		const longitude = "Longitude: " + (Math.round(lng * decimals) / decimals);
		return { latitude, longitude };
	}

	initMap() {
		const that = this;
		this.initialized = true;
		this.map = new google.maps.Map(this.refs.map, { // eslint-disable-line no-undef
			center: { lat: this.lat, lng: this.lng },
			zoom: this.zoom,
			labels: true
		});
		this.coords = this.formatCoords(this.lat, this.lng);
		this.zoomListener = this.map.addListener("zoom_changed", function() {
			// console.log("Zoom changed: " + that.map.getZoom());
			that.setInternalState(that.lat, that.lng, that.map.getZoom());
		});
		this.centerListener = this.map.addListener("center_changed", function() {
			const newPos = that.map.getCenter();
			// console.log("Center changed: (" + newPos.lat() + ", " + newPos.lng() + ")");
			if (that.resized) {
				that.setInternalState(newPos.lat(), newPos.lng(), that.zoom);
			}
		});
	}

	render() {
		if (this.initialized && !this.resized) {
			google.maps.event.trigger(this.map, "resize"); // eslint-disable-line no-undef
			this.resized = true;
		}
		const message = this.props.controller.getErrorMessage(this.props.propertyId);
		var messageText;
		var icon;
		if (message && message.text) {
			messageText = message.text;
			if (message.type === "warning") {
				icon = (<Icon type="warning" />);
			} else if (message.type === "error") {
				icon = (<Icon type="error-o" />);
			}
		}
		const state = this.props.controller.getControlState(this.props.propertyId);
		var visibility;
		if (state === "hidden") {
			visibility = { visibility: "hidden" };
		}
		return (
			<div>
				<div className="custom-map" style={visibility}>
					<span>{this.coords.latitude}</span>
					<br />
					<span>{this.coords.longitude}</span>
					<div id="map" ref="map" style={{ width: 265, height: 265, border: "1px solid black" }}>
						I should be a map!
					</div>
					<div style={{ "marginTop": "5px", "marginBottom": "10px" }}>
						{icon}&nbsp;{messageText}
					</div>
					<button id="go_to_svl" onClick={this.gotoSVL.bind(this)}>Go to SVL</button>
					&nbsp;
					<button id="go_to_armonk" onClick={this.gotoArmonk.bind(this)}>Go to Armonk</button>
				</div>
			</div>
		);
	}
}

function loadJS(src) {
	var ref = window.document.getElementsByTagName("script")[0];
	var script = window.document.createElement("script");
	script.src = src;
	script.async = true;
	return ref.parentNode.insertBefore(script, ref);
}

CustomMapCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired
};
