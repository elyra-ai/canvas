/*
 * Copyright 2017-2025 Elyra Authors
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
			<div className="harness-custom-control-container" key="additional-component-0">
				<div className="row">
					<div className="col-sm-12 harness-custom-control-additional-components-radio-options">
						<div className="harness-custom-control-radio">
							<label className="harness-custom-control-control-radio-block">
								<input type="radio" value="option1"
									checked={this.state.selectedOption === "option1"}
									onChange= {this.handleChecked}
								/>
								Option 1
								<div className = "harness-custom-control-indicator" />
							</label>
						</div>
						<div className="harness-custom-control-radio">
							<label className="harness-custom-control-control-radio-block">
								<input type="radio" value="option2"
									checked={this.state.selectedOption === "option2"}
									onChange= {this.handleChecked}
								/>
								Option 2
								<div className = "harness-custom-control-indicator" />
							</label>
						</div>
						<div className="harness-custom-control-radio">
							<label className="harness-custom-control-control-radio-block">
								<input type="radio" value="option3"
									checked={this.state.selectedOption === "option3"}
									onChange= {this.handleChecked}
								/>
								Option 3
								<div className = "harness-custom-control-indicator" />
							</label>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
