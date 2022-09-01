/*
 * Copyright 2022 Elyra Authors
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
// Base class for table controls

import React from "react";
import PropTypes from "prop-types";

import { Button } from "carbon-components-react";
import { Maximize16, Minimize16 } from "@carbon/icons-react";

class ExpressionToggle extends React.Component {
	render() {
		return (
			<div className="ExpressionToggle">
				{this.props.enableMaximize ? (<Button
					type="button"
					size="small"
					kind="ghost"
					renderIcon={Maximize16}
					iconDescription="Maximize"
					onClick={() => this.props.handleToggle(true)}
				/>) : (<Button
					type="button"
					size="small"
					kind="ghost"
					renderIcon={Minimize16}
					iconDescription="Minimize"
					onClick={() => this.props.handleToggle(false)}
				/>)
				}
			</div>);
	}
}
ExpressionToggle.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	enableMaximize: PropTypes.bool.isRequired
};
export default ExpressionToggle;
