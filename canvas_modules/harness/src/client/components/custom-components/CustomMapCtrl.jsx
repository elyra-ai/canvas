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

import React from "react";
import PropTypes from "prop-types";
import Icon from "carbon-components-react/lib/components/Icon";
import CustomMapSummary from "./CustomMapSummary";
import Button from "carbon-components-react/lib/components/Button";
import { connect } from "react-redux";


class CustomMapCtrl extends React.Component {
	constructor(props) {
		super(props);
		if (props.controlValue && props.controlValue.length >= 3) {
			this.lat = props.controlValue[0];
			this.lng = props.controlValue[1];
			this.zoom = props.controlValue[2];
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
		if (this.lat !== lat) {
			this.props.controller.updatePropertyValue({ name: this.props.propertyId.name, col: 0 }, lat);
			this.lat = lat;
		}
		if (this.lng !== lng) {
			this.props.controller.updatePropertyValue({ name: this.props.propertyId.name, col: 1 }, lng);
			this.lng = lng;
		}
		if (this.zoom !== zoom) {
			this.zoom = zoom;
			this.props.controller.updatePropertyValue({ name: this.props.propertyId.name, col: 2 }, zoom);
			this.props.controller.updatePropertyValue(
				{ name: this.props.data.parameter_ref }, zoom); // update value in another control
		}

		this.coords = this.formatCoords(lat, lng);

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

	zoomOut() {
		this.goSomewhere({ lat: this.lat, lng: this.lng }, 2);
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
		let messageText;
		let icon;
		if (this.props.messageInfo && this.props.messageInfo.text) {
			messageText = this.props.messageInfo.text;
			if (this.props.messageInfo.type === "warning") {
				icon = (<Icon className="warning" name="warning--glyph" />);
			} else if (this.props.messageInfo.type === "error") {
				icon = (<Icon className="error" name="error--glyph" />);
			}
		}
		let visibility;
		if (this.props.state === "hidden") {
			visibility = { visibility: "hidden" };
		}
		return (
			<div>
				<div className="harness-custom-control-custom-map" style={visibility}>
					<span>{this.coords.latitude}</span>
					<br />
					<span>{this.coords.longitude}</span>
					<div id="map" ref="map" style={{ width: 265, height: 265, border: "1px solid black" }}>
						I should be a map!
					</div>
					<div className="harness-custom-control-condition">
						<div className="icon">{icon}</div>
						<div>{messageText}</div>
					</div>
					<Button small data-id="go_to_svl" onClick={this.gotoSVL.bind(this)}>Go to SVL</Button>
					<Button small data-id="go_to_armonk" onClick={this.gotoArmonk.bind(this)}>Go to Armonk</Button>
					<Button small data-id="zoom_out" onClick={this.zoomOut.bind(this)}>Zoom Out</Button>
				</div>
			</div>
		);
	}
}

function loadJS(src) {
	const ref = window.document.getElementsByTagName("script")[0];
	const script = window.document.createElement("script");
	script.src = src;
	script.async = true;
	return ref.parentNode.insertBefore(script, ref);
}

CustomMapCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	data: PropTypes.object.isRequired,
	state: PropTypes.string, // pass in by redux
	controlValue: PropTypes.array, // pass in by redux
	messageInfo: PropTypes.object // pass in by redux
};

const mapStateToProps = (state, ownProps) => ({
	controlValue: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CustomMapCtrl);
