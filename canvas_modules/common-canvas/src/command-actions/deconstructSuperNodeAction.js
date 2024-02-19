/*
 * Copyright 2017-2024 Elyra Authors
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

import Action from "../command-stack/action.js";
import CanvasUtils from "../common-canvas/common-canvas-utils";
import { NODE_LINK }
	from "../common-canvas/constants/canvas-constants.js";

export default class DeconstructSuperNodeAction extends Action {
	constructor(data, canvasController) {
		super(data);
		this.data = data;
		this.labelUtil = canvasController.labelUtil;
		this.objectModel = canvasController.objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.enableMoveNodesOnSupernodeResize = canvasController.getCanvasConfig().enableMoveNodesOnSupernodeResize;
		this.supernode = this.data.targetObject;
		this.oldObjectPositions = [];
		this.newObjectPositions = [];
		this.oldLinkPositions = [];
		this.newLinkPositions = [];

		this.objectModel.ensurePipelineIsLoaded(this.data);

		this.targetApiPipeline = this.objectModel.getAPIPipeline(this.supernode.subflow_ref.pipeline_id_ref);
		this.targetPipeline = this.targetApiPipeline.getPipeline();
		this.extPipelineFlowToDelete = this.targetPipeline.parentUrl
			? this.objectModel.getExternalPipelineFlow(this.targetPipeline.parentUrl) : [];

		const linksToRemove = this.getLinksToRemove();
		const bindingNodes = this.getBindingNodes();
		const nodesToAdd = this.getNonBindingNodes(bindingNodes);
		const commentsToAdd = this.getCommentsToAdd();
		const linksToAdd = this.getLinksToAdd(bindingNodes, linksToRemove);
		let expandedCanvasDims = { left: 0, top: 0 };

		if (this.enableMoveNodesOnSupernodeResize) {
			this.oldObjectPositions = CanvasUtils.getObjectPositions(this.apiPipeline.getObjects());
			this.oldLinkPositions = CanvasUtils.getLinkPositions(this.apiPipeline.getLinks());

			expandedCanvasDims =
				CanvasUtils.getCanvasDimensions(nodesToAdd, commentsToAdd,
					linksToAdd, 0, 0);

			this.newObjectPositions = CanvasUtils.moveSurroundingObjects(
				this.data.targetObject,
				this.apiPipeline.getObjects(),
				"se",
				expandedCanvasDims.width,
				expandedCanvasDims.height,
				false); // Pass false to indicate that node positions should not be updated.

			this.newLinkPositions = CanvasUtils.moveSurroundingDetachedLinks(
				this.data.targetObject,
				this.apiPipeline.getLinks(),
				"se",
				expandedCanvasDims.width,
				expandedCanvasDims.height,
				false); // Pass false to indicate that node positions should not be updated.
		}

		// Add to newObjectPositions some new positions for the objects being
		// added to the pipeline from the supernode'ssub-flow. This will
		// move them into the position where the supernode once stood. A space
		// for them will have been created by the code above if
		// enableMoveNodesOnSupernodeResize is switched on.
		nodesToAdd.forEach((n2a) => {
			this.newObjectPositions[n2a.id] = {
				x_pos: this.supernode.x_pos + n2a.x_pos - expandedCanvasDims.left,
				y_pos: this.supernode.y_pos + n2a.y_pos - expandedCanvasDims.top
			};
		});

		commentsToAdd.forEach((c2a) => {
			this.newObjectPositions[c2a.id] = {
				x_pos: this.supernode.x_pos + c2a.x_pos - expandedCanvasDims.left,
				y_pos: this.supernode.y_pos + c2a.y_pos - expandedCanvasDims.top
			};
		});

		this.info = {
			pipelineId: this.data.pipelineId,
			supernodeToDelete: this.supernode,
			nodesToAdd: nodesToAdd,
			linksToAdd: linksToAdd,
			linksToRemove: linksToRemove,
			commentsToAdd: commentsToAdd,
			oldObjectPositions: this.oldObjectPositions,
			newObjectPositions: this.newObjectPositions,
			oldLinkPositions: this.oldLinkPositions,
			newLinkPositions: this.newLinkPositions,
			pipelineToDelete: this.targetPipeline,
			extPipelineFlowToDelete: this.extPipelineFlowToDelete
		};
	}

	getNonBindingNodes(bindingNodes) {
		const nodes = this.targetApiPipeline.getNodes();
		const nonBindingNodes = nodes.filter((n) => !bindingNodes.some((bn) => bn.id === n.id));
		return nonBindingNodes;
	}

	getBindingNodes() {
		const bindingNodes = [];

		if (this.data.targetObject.inputs) {
			this.data.targetObject.inputs.forEach((input) => {
				const bindingNode = this.targetApiPipeline.getNode(input.subflow_node_ref);
				if (bindingNode) {
					bindingNodes.push(bindingNode);
				}
			});
		}
		if (this.data.targetObject.outputs) {
			this.data.targetObject.outputs.forEach((output) => {
				const bindingNode = this.targetApiPipeline.getNode(output.subflow_node_ref);
				if (bindingNode) {
					bindingNodes.push(bindingNode);
				}
			});
		}
		return bindingNodes;
	}

	getLinksToFromBindingNodes(bindingNodes) {
		return this.targetApiPipeline.getLinksContainingIds(bindingNodes.map((bn) => bn.id));
	}

	getLinksNotToFromBindingNodes(bindingNodes) {
		const linksToFromBindingNodes = this.getLinksToFromBindingNodes(bindingNodes);
		const links = this.targetApiPipeline.getLinks();
		const linksNotToFromBindingNode = links.filter((l) =>
			!linksToFromBindingNodes.some((ltfbm) => ltfbm.id === l.id));
		return linksNotToFromBindingNode;
	}

	getCommentsToAdd() {
		return this.targetApiPipeline.getComments();
	}

	getLinksToRemove() {
		return this.apiPipeline.getLinksContainingId(this.supernode.id);
	}

	getLinksToAdd(bindingNodes, linksToRemove) {
		const linksNotToFromBindingNodes = this.getLinksNotToFromBindingNodes(bindingNodes);
		const newLinks = this.getNewLinks(linksToRemove);
		return linksNotToFromBindingNodes.concat(newLinks);
	}

	getNewLinks(linksToRemove) {
		let newLinks = [];
		const supernodeDataLinks = linksToRemove.filter((link) => link.type === NODE_LINK);

		if (this.supernode.inputs) {
			this.supernode.inputs.forEach((input) => {
				newLinks = newLinks.concat(this.getNewLinksForInput(input, supernodeDataLinks));
			});
		}
		if (this.supernode.outputs) {
			this.supernode.outputs.forEach((output) => {
				newLinks = newLinks.concat(this.getNewLinksForOutput(output, supernodeDataLinks));
			});
		}

		return newLinks;
	}

	getNewLinksForInput(input, supernodeDataLinks) {
		const newLinks = [];
		const inputLinks = this.getSupernodeInputLinks(this.supernode, input.id, supernodeDataLinks);
		const inputBindingNode = this.getInputBindingNode(input);
		if (inputBindingNode) {
			const inputBindingLinks = this.getInputBindingLinks(inputBindingNode);

			inputLinks.forEach((inputLink) => {
				inputBindingLinks.forEach((inputBindingLink) => {
					const linkInfo = {};
					if (inputLink.srcPos) {
						linkInfo.srcPos = inputLink.srcPos;
					} else {
						linkInfo.srcNodeId = inputLink.srcNodeId;
						linkInfo.srcNodePortId = inputLink.srcNodePortId;
					}
					if (inputBindingLink.trgPos) {
						linkInfo.trgPos = inputBindingLink.trgPos;
					} else {
						linkInfo.trgNodeId = inputBindingLink.trgNodeId;
						linkInfo.trgNodePortId = inputBindingLink.trgNodePortId;
					}
					const newLink = this.apiPipeline.createLinkFromInfo(linkInfo);
					newLinks.push(newLink);
				});
			});
		}
		return newLinks;
	}

	getNewLinksForOutput(output, supernodeDataLinks) {
		const newLinks = [];
		const outputLinks = this.getSupernodeOutputLinks(this.supernode, output.id, supernodeDataLinks);
		const outputBindingNode = this.getOutputBindingNode(output);
		if (outputBindingNode) {
			const outputBindingLinks = this.getOutputBindingLinks(outputBindingNode);

			outputLinks.forEach((outputLink) => {
				outputBindingLinks.forEach((outputBindingLink) => {
					const linkInfo = {};

					if (outputBindingLink.srcPos) {
						linkInfo.srcPos = outputBindingLink.srcPos;
					} else {
						linkInfo.srcNodeId = outputBindingLink.srcNodeId;
						linkInfo.srcNodePortId = outputBindingLink.srcNodePortId;
					}

					if (outputLink.trgPos) {
						linkInfo.trgPos = outputLink.trgPos;
					} else {
						linkInfo.trgNodeId = outputLink.trgNodeId;
						linkInfo.trgNodePortId = outputLink.trgNodePortId;
					}
					const newLink = this.apiPipeline.createLinkFromInfo(linkInfo);
					newLinks.push(newLink);
				});
			});
		}
		return newLinks;
	}

	getSupernodeInputLinks(node, inputPortId, supernodeDataLinks) {
		return supernodeDataLinks.filter((link) => {
			const trgNodePortId = link.trgNodePortId || CanvasUtils.getDefaultInputPortId(node);
			return (link.trgNodeId === node.id && trgNodePortId === inputPortId);
		});
	}

	getInputBindingNode(input) {
		return this.targetApiPipeline.getNodes().find((n) => n.id === input.subflow_node_ref);
	}

	getInputBindingLinks(inputBindingNode) {
		return this.targetApiPipeline.getLinksContainingSourceId(inputBindingNode.id)
			.filter((link) => link.type === NODE_LINK);
	}

	getSupernodeOutputLinks(node, outputPortId, supernodeDataLinks) {
		return supernodeDataLinks.filter((link) => {
			const srcNodePortId = link.srcNodePortId || CanvasUtils.getDefaultOutputPortId(node);
			return (link.srcNodeId === node.id && srcNodePortId === outputPortId);
		});
	}

	getOutputBindingNode(output) {
		return this.targetApiPipeline.getNodes().find((n) => n.id === output.subflow_node_ref);
	}

	getOutputBindingLinks(outputBindingNode) {
		return this.targetApiPipeline.getLinksContainingTargetId(outputBindingNode.id)
			.filter((link) => link.type === NODE_LINK);
	}

	// Standard methods
	do() {
		this.apiPipeline.deconstructSupernode(this.info);
	}

	undo() {
		this.apiPipeline.reconstructSupernode(this.info);
	}

	redo() {
		this.do();
	}

	getLabel() {
		return this.labelUtil.getActionLabel(this, "action.deconstructSuperNode", { node_label: this.supernode.label });
	}
}
