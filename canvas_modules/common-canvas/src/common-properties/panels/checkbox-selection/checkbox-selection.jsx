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
import Checkbox from "ap-components-react/dist/components/Checkbox";


export default class CheckboxSelection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			controlValue: false
		};
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		if (!this.state.controlValue) {
			for (let i = 0; i < this.props.panel.uiItems.length; i++) {
				const child = this.props.panel.uiItems[i];
				this.props.controller.updateControlState({ name: child.control.name }, "disabled");
			}
		}
	}

	handleChange(evt) {
		let value = "enabled";
		const checked = evt.target.checked;
		if (!checked) {
			value = "disabled";
		}
		for (let i = 0; i < this.props.panel.uiItems.length; i++) {
			const child = this.props.panel.uiItems[i];
			this.props.controller.updateControlState({ name: child.control.name }, value);
		}
		this.setState({
			controlValue: checked
		});
	}


	render() {

		const checked = this.state.controlValue;
		const cb = (<Checkbox
			id={this.props.panel.id}
			name={this.props.panel.label.text}
			onChange={this.handleChange}
			checked={checked}
		/>);

		const controlItems = [];
		for (let i = 0; i < this.props.children.length; i++) {
			const child = this.props.children[i];
			controlItems.push(
				<div key={ "child" + i }>
					{child}
				</div>
			);
		}

		return (
			<div className="control-panel checkbox-panel">
				{cb}
				<div className="checkbox-controls">
					{controlItems}
				</div>
			</div>
		);
	}
}

CheckboxSelection.propTypes = {
	panel: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired
};
