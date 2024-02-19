/*
 * Copyright 2017-2023 Elyra Authors
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
import { injectIntl } from "react-intl";
import { Button } from "@carbon/react";
import { Maximize16, Minimize16 } from "@carbon/icons-react";
import { formatMessage } from "../../../util/property-utils";
import { MESSAGE_KEYS } from "../../../constants/constants";

class ExpressionToggle extends React.Component {
	constructor(props) {
		super(props);
		this.buttonHandler = props.controller.getHandlers().buttonHandler || (() => null);
		this.reactIntl = props.controller.getReactIntl();
	}
	render() {
		return (
			<div className="properties-expression-toggle">
				<div className="properties-expression-toggle-absolute">
					{this.props.enableMaximize ? (<Button
						className="maximize"
						type="button"
						size="small"
						kind="ghost"
						renderIcon={Maximize16}
						hasIconOnly
						iconDescription={formatMessage(this.reactIntl, MESSAGE_KEYS.EXPRESSION_MAXIMIZE_LABEL)}
						onClick={() => {
							const handlerStatus = this.buttonHandler({
								type: "maximize_tearsheet",
								propertyId: this.props.control.data || {}
							});
							if (!handlerStatus && this.props.control.data && this.props.control.data.tearsheet_ref) {
								this.props.controller.setActiveTearsheet(this.props.control.data.tearsheet_ref);
							}
						}}
					/>) : (<Button
						type="button"
						className="minimize"
						size="small"
						kind="ghost"
						hasIconOnly
						renderIcon={Minimize16}
						iconDescription={formatMessage(this.reactIntl, MESSAGE_KEYS.EXPRESSION_MINIMIZE_LABEL)}
						onClick={() => this.props.controller.clearActiveTearsheet()}
					/>)
					}
				</div>
			</div>);
	}
}
ExpressionToggle.propTypes = {
	control: PropTypes.object.isRequired,
	controller: PropTypes.object.isRequired,
	enableMaximize: PropTypes.bool
};
export default injectIntl(ExpressionToggle);
