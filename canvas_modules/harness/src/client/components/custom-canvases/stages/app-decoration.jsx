/*
 * Copyright 2024 Elyra Authors
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
import { Tag } from "@carbon/react";

class AppDecoration extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const h = 70;
		const w = 250;
		const o = 30; // Offset of triangle from left edge
		const t = 8; // Triangle size
		const d = 5; // Depth of colored strip

		const outlinePath = `M 0 0 L 0 ${h} ${o} ${h} ${o + t} ${h + t} ${o + (2 * t)} ${h} ${w} ${h} ${w} 0 Z`;
		const stripPath = `M 0 0 L 0 ${d} ${w} ${d} ${w} 0 Z`;

		return (
			<div style={{ height: "100%", width: "100%" }} onClick={this.onClick} >
				<svg height="100%" width="100%">
					<path style={{ fill: "lightgray", stroke: "lightgray" }} d={outlinePath} />
					<path style={{ fill: "gold", stroke: "gold" }} d={stripPath} />
				</svg>
				<div style={{ position: "absolute", top: 20, left: 5 }} >
					<Tag className="some-class" type="cyan">
						{"Column"}
					</Tag>
				</div>
				<div style={{ position: "absolute", top: 30, left: 100 }} >
					{this.props.node.label}
				</div>
			</div>
		);
	}
}

AppDecoration.propTypes = {
	node: PropTypes.object
};

export default AppDecoration;
