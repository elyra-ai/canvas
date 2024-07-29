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

import { CommonCanvas, CanvasController } from "common-canvas"; // eslint-disable-line import/no-unresolved

import { AddComment } from "@carbon/react/icons";

import WysiwygCommentsFlow from "./wysiwyg-comments-flow.json";

export default class WysiwygCommentsCanvas extends React.Component {
	constructor(props) {
		super(props);

		this.canvasController = new CanvasController();
		this.canvasController.setPipelineFlow(WysiwygCommentsFlow);

		this.getConfig = this.getConfig.bind(this);
	}

	getConfig() {
		const config = Object.assign({}, this.props.config, {
			enableParentClass: "wysiwyg-canvas",
			enableNodeFormatType: "Horizontal",
			enableMarkdownInComments: true,
			enableWYSIWYGComments: true,
			enableContextToolbar: true,
			tipConfig: {
				palette: true,
				nodes: true,
				ports: false,
				links: false
			}
		});
		return config;
	}

	getToolbarConfig() {
		const subMenuCreateComment = [
			{ action: "createAutoComment", label: "Comment", enable: true },
			{ action: "createAutoWYSIWYGComment", label: "WYSIWYG Comment", enable: true, iconEnabled: (<AddComment size={32} />) }
		];

		return {
			leftBar: [
				{ action: "undo", label: "Undo", enable: true },
				{ action: "redo", label: "Redo", enable: true },
				{ divider: true },
				{ action: "comment-submenu",
					iconEnabled: (<AddComment size={32} />),
					label: "Add Comment",
					enable: true,
					subMenu: subMenuCreateComment,
					closeSubAreaOnClick: true },
				{ divider: true },
			]
		};
	}

	render() {
		const config = this.getConfig();
		const toolbarConfig = this.getToolbarConfig();

		return (
			<CommonCanvas
				canvasController={this.canvasController}
				config={config}
				toolbarConfig={toolbarConfig}
			/>
		);
	}
}

WysiwygCommentsCanvas.propTypes = {
	config: PropTypes.object
};
