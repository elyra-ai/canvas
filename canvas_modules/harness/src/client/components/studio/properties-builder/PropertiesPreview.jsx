/*
 * Copyright 2017-2026 Elyra Authors
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
import { CommonProperties } from "common-canvas"; // eslint-disable-line import/no-unresolved
import propertiesGenerator from "../utils/properties-generator";

const NOOP = () => null;

export default class PropertiesPreview extends React.Component {
	render() {
		const { paramDef, nodeLabel, nodeOp } = this.props;

		if (!paramDef || !paramDef.parameters || paramDef.parameters.length === 0) {
			return (
				<div className="studio-properties-preview">
					<div className="studio-preview-label">Properties Preview</div>
					<div className="studio-preview-content" style={{ color: "var(--cds-text-placeholder)", fontSize: "0.8125rem", padding: "1rem" }}>
						Add parameters above to see a live preview of the properties form.
					</div>
				</div>
			);
		}

		const parameterDef = propertiesGenerator(paramDef, nodeLabel, nodeOp);

		return (
			<div className="studio-properties-preview">
				<div className="studio-preview-label">Properties Preview</div>
				<div className="studio-preview-content">
					<CommonProperties
						propertiesInfo={{ parameterDef }}
						propertiesConfig={{
							containerType: "Custom",
							rightFlyout: false,
							applyOnBlur: true
						}}
						callbacks={{
							closePropertiesDialog: NOOP,
							applyPropertyChanges: NOOP
						}}
					/>
				</div>
			</div>
		);
	}
}

PropertiesPreview.propTypes = {
	paramDef: PropTypes.object,
	nodeLabel: PropTypes.string,
	nodeOp: PropTypes.string
};
