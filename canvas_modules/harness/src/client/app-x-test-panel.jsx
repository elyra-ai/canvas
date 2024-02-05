/*
 * Copyright 2023 Elyra Authors
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
import { Checkbox } from "carbon-components-react";


class AppTestPanel extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focusAction: "subarea"
		};

		this.buttonRef = React.createRef();
		this.closePanel = this.closePanel.bind(this);
	}

	componentDidMount() {
		this.buttonRef.current.focus();
	}

	onClick(evt) {
		evt.stopPropagation();
	}

	closePanel() {
		this.props.subPanelData.saveData();
		this.props.closeSubPanel();
	}

	render() {
		return (
			<div style={{ padding: 10 }} onClick={this.onClick}>
				<div style={{ display: "flex", paddingTop: 10, paddingBottom: 15, justifyContent: "space-between" }}>
					Small panel:
					<button ref={this.buttonRef} style={{ display: "inline-flex", cursor: "pointer", minHeight: "20px", border: 0, padding: "0 10px" }}
						onClick={this.closePanel}
					>X</button>
				</div>
				<Checkbox id={"chkItOut"} defaultChecked labelText={"Check it out"} />
				<Checkbox id={"chkSomeMore"} labelText={"Check some more"} />
				<Checkbox id={"chkToEnd"} labelText={"Check to the end"} />
			</div>
		);
	}
}

AppTestPanel.propTypes = {
	closeSubPanel: PropTypes.func,
	subPanelData: PropTypes.object
};

export default AppTestPanel;
