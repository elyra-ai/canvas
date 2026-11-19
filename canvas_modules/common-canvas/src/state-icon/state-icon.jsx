/*
 * Copyright 2026 Elyra Authors
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
import classNames from "classnames";

// Carbon icons - direct imports for tree-shaking optimization
import WarningFilled from "@carbon/icons-react/lib/WarningFilled";
import ErrorFilled from "@carbon/icons-react/lib/ErrorFilled";
import CheckmarkFilled from "@carbon/icons-react/lib/CheckmarkFilled";
import InformationFilled from "@carbon/icons-react/lib/InformationFilled";

const ERROR = "error";
const WARNING = "warning";
const SUCCESS = "success";
const INFO = "info";

// Displays an error, warning, success or info state icon.
export default function StateIcon({ type, className, disabled }) {
	switch (type) {
	case (ERROR):
		return <ErrorFilled className={classNames("state-icon-error", className)} disabled={disabled} />;
	case (WARNING):
		return <WarningFilled className={classNames("state-icon-warning", className)} disabled={disabled} />;
	case (SUCCESS):
		return <CheckmarkFilled className={classNames("state-icon-success", className)} disabled={disabled} />;
	case (INFO):
		return <InformationFilled className={classNames("state-icon-info", className)} disabled={disabled} />;
	default: return null;
	}
}

StateIcon.defaultProps = {
	className: "",
	disabled: false
};

StateIcon.propTypes = {
	type: PropTypes.oneOf([ERROR, WARNING, SUCCESS, INFO]).isRequired,
	className: PropTypes.string,
	disabled: PropTypes.bool
};
