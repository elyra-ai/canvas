/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";
import has from "lodash/has";

export default class DeleteObjectsAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.objectsInfo = [];
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.nodes = this.objectModel.getSelectedNodes();
		this.comments = this.objectModel.getSelectedComments();
		this.links = [];

		this.data.selectedObjectIds.forEach((id) => {
			const objectLinks = this.apiPipeline.getLinksContainingId(id);
			// ensure each link is only stored once
			objectLinks.forEach((objectLink) => {
				if (!this.links.find((link) => (link.id === objectLink.id))) {
					this.links.push(objectLink);
				}
			});
		});

		// Rememebr all the pipelines that are being deleted when any selected
		// supernodes are being deleted.
		this.data.deletedPipelines = [];
		this.data.superNodes = this.getSuperNodesReferencedBy(this.data.selectedObjectIds);
		this.data.superNodes.forEach((supernode) => {
			if (has(supernode, "subflow_ref.pipeline_id_ref")) {
				const deletedPipeline = this.objectModel.getCanvasInfoPipeline(supernode.subflow_ref.pipeline_id_ref);
				this.data.deletedPipelines.push(deletedPipeline);
				this.deleteNestedPipelines(supernode.subflow_ref.pipeline_id_ref);
			}
		});
	}

	// Standard methods
	do() {
		this.apiPipeline.deleteObjects(this.data);
		this.data.deletedPipelines.forEach((pipeline) => {
			this.objectModel.deletePipeline(pipeline.id);
		});

	}

	undo() {
		this.data.deletedPipelines.forEach((pipeline) => {
			this.objectModel.addPipeline(pipeline);
		});

		this.nodes.forEach((node) => {
			this.apiPipeline.addNode(node);
		});

		this.comments.forEach((comment) => {
			this.apiPipeline.addComment(comment);
		});

		this.apiPipeline.addLinks(this.links);
	}

	redo() {
		this.do();
	}

	getSuperNodesReferencedBy(objectIds) {
		const superNodes = [];
		objectIds.forEach((id) => {
			const node = this.apiPipeline.getNode(id);
			if (node) {
				if (node.type === "super_node") {
					superNodes.push(node);
				}
			}
		});
		return superNodes;
	}

	deleteNestedPipelines(pipelineId) {
		this.objectModel.getNestedPipelineIds(pipelineId).forEach((subPipelineId) => {
			const deletedPipeline = this.objectModel.getCanvasInfoPipeline(subPipelineId);
			this.data.deletedPipelines.push(deletedPipeline);
		});
	}
}
