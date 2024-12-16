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
import PropTypes from "prop-types";
import Logger from "../logging/canvas-logger.js";
import defaultMessages from "../../locales/common-canvas/locales/en.json";
import { injectIntl } from "react-intl";
import { Locked, EditOff } from "@carbon/react/icons";
import { STATE_TAG_LOCKED, STATE_TAG_READ_ONLY, TIP_TYPE_STATE_TAG }
	from "../common-canvas/constants/canvas-constants.js";

class CommonCanvasStateTag extends React.Component {
	constructor(props) {
		super(props);
		this.logger = new Logger("CC-StateTag");

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
	}

	onMouseOver(ev) {
		let tipText;

		if (this.props.stateTagType === STATE_TAG_LOCKED) {
			tipText = this.getLabel("canvas.stateTagTipLocked");

		} else if (this.props.stateTagType === STATE_TAG_READ_ONLY) {
			tipText = this.getLabel("canvas.stateTagTipReadOnly");
		}

		this.props.canvasController.openTip({
			id: "stateTagTip",
			type: TIP_TYPE_STATE_TAG,
			stateTagType: this.props.stateTagType,
			stateTagText: tipText,
			targetObj: ev.currentTarget
		});
	}

	onMouseLeave() {
		this.props.canvasController.closeTip();
	}

	getLabel(labelId) {
		return this.props.intl.formatMessage({ id: labelId, defaultMessage: defaultMessages[labelId] });
	}

	getStateTag(label, icon) {
		return (
			<div className={"state-tag"}
				onMouseOver={this.onMouseOver}
				onMouseLeave={this.onMouseLeave}
			>
				{icon}
				<span>{label}</span>
			</div>
		);
	}

	render() {
		this.logger.log("render");

		let stateTag = null;

		if (this.props.stateTagType === STATE_TAG_LOCKED) {
			const label = this.getLabel("canvas.stateTagLocked");
			stateTag = this.getStateTag(label, (<Locked />));

		} else if (this.props.stateTagType === STATE_TAG_READ_ONLY) {
			const label = this.getLabel("canvas.stateTagReadOnly");
			stateTag = this.getStateTag(label, (<EditOff />));
		}

		return stateTag;
	}
}

CommonCanvasStateTag.propTypes = {
	// Provided by CommonCanvas
	intl: PropTypes.object.isRequired,
	stateTagType: PropTypes.string,
	canvasController: PropTypes.object
};

export default injectIntl(CommonCanvasStateTag);
