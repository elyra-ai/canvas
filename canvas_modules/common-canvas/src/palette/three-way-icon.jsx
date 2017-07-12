/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2016. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

class ThreeWayIcon extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			hover: false
		};

		this.iconClicked = this.iconClicked.bind(this);
		this.mouseEnter = this.mouseEnter.bind(this);
		this.mouseLeave = this.mouseLeave.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
	}

	iconClicked() {
		this.props.iconClickedMethod();
	}

	mouseEnter() {
		this.setState({ hover: true });
	}

	mouseLeave() {
		this.setState({ hover: false });
	}

	mouseDown(mouseDownEvent) {
		mouseDownEvent.stopPropagation();
	}

	render() {
		let icon = this.props.selectedIconName;

		if (!this.props.isSelected) {
			if (this.state.hover) {
				icon = this.props.hoverIconName;
			} else {
				icon = this.props.deselectedIconName;
			}
		}

		return (
			<div draggable= "false" className="three-way-icon-div">
				<img src={icon} draggable="false"
					onClick={this.iconClicked}
					onMouseEnter={this.mouseEnter}
					onMouseLeave={this.mouseLeave}
					onMouseDown={this.mouseDown}
				/>
			</div>
		);
	}
}

ThreeWayIcon.propTypes = {
	iconClickedMethod: React.PropTypes.func.isRequired,
	isSelected: React.PropTypes.bool.isRequired,
	selectedIconName: React.PropTypes.string.isRequired,
	hoverIconName: React.PropTypes.string.isRequired,
	deselectedIconName: React.PropTypes.string.isRequired
};

export default ThreeWayIcon;
