/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";

export default class AddtlCmptsTest extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isChecked: false,
			selectedOption: "option1"
		};
		this.handleChecked = this.handleChecked.bind(this);
	}

	handleChecked(changeEvent) {
		this.setState({ selectedOption: changeEvent.target.value });
	}

	render() {
		return (
			<div className="container" key="additional-component-0">
				<div className="row">
					<div className="col-sm-12 additional-components-radio-options">
						<div className="radio">
							<label className="control control-radio-block">
								<input type="radio" value="option1"
									checked={this.state.selectedOption === "option1"}
									onChange= {this.handleChecked}
								/>
								Option 1
								<div className = "control__indicator" />
							</label>
						</div>
						<div className="radio">
							<label className="control control-radio-block">
								<input type="radio" value="option2"
									checked={this.state.selectedOption === "option2"}
									onChange= {this.handleChecked}
								/>
								Option 2
								<div className = "control__indicator" />
							</label>
						</div>
						<div className="radio">
							<label className="control control-radio-block">
								<input type="radio" value="option3"
									checked={this.state.selectedOption === "option3"}
									onChange= {this.handleChecked}
								/>
								Option 3
								<div className = "control__indicator" />
							</label>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
