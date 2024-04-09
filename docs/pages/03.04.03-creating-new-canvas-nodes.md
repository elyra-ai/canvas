## Introduction

The host application code can programmatically create nodes on the canvas in two ways:

* By calling CanvasController API methods to create and add the node to the canvas.

* Creating and adding a node to the Pipeline Flow document


## Creating and adding a node to the Canvas Controller API

The following code will programmatically add a node to the canvas. These commands will update the common-canvas object model directly and will not be added to the command stack so the user will not be able to `undo` / `redo` these actions. Also, the `beforeEditActionHandler` and `editActionHandler` callbacks will not be called for these actions.

First you can get a node template from the canvas by calling
```js
    const template = canvasController.getPaletteNode("sort");
```
where the parameter is the operation (`op` field) for the palette node. Alternatively, you can retrieve a node template using this method:
```js
    const template = canvasController.getPaletteNodeById(nodeId)
```
which returns the node template based on the node ID. This can be useful if you have supernodes in your palette because supernodes do not have an `op` field. After creating the node template your code can alter fields (for example, the label) within the template. If you do change any fields be careful because common-canvas doesn't do any error checking on your fields.

Next you create the node:
```js
    const newNode = canvasController.createNode({
            nodeTemplate: template,
            offsetX: 200,
            offsetY: 400
});
```
This will work correctly for regular nodes, and also supernodes, that have been pulled from the palette. 

Next you add the node object to the canvas. 
```js
    canvasController.addNode(newNode);
```
The node will appear at the offsetX, offseY position within the coordinate system for the canvas.  

### If command stack is needed

This method allows the host application to create a node, or supernode, from a palette template object by creating and executing a command which will be added to the command stack (so the user can `undo` / `redo` it) and will also cause the `beforeEditActionHandler` and `editActionHandler` callbacks  to be called.


First your code retrieves a node template from the palette as described above and then calls this method:
```js
    const data = {
        nodeTemplate: template,
        offsetX: 200,
        offsetY: 400
    };

    canvasController.createNodeCommand(data, pipelineId)
```

Note: If `pipelineId` is omitted the node will be created in the current "top-level" pipeline.

## Creating and adding a node using Pipeline Flow document

This approach works by your code adding one or more JSON objects directly to the pipeline flow object, either before the pipeline flow document is loaded into common-canvas using `CanvasController.setPipelineFlow(pFlow)`, or afterwards by retrieving the pipeline flow object from common-canvas using `CanvasController.getPipelineFlow()` and then updating the nodes array of whichever pipeline you want to modify. This would require your code to navigate to the `pipeline` object (that you want to update) in the `pipelines` array of the pipeline flow and then add the node object to the `nodes` array in the pipeline object. 

After updating the pipeline flow object your code would need to reload it into common-canvas using `CanvasController.setPipelineFlow(pFlow)`.

To use this approach you would need a good understanding of the [pipeline flow schema](https://github.com/elyra-ai/pipeline-schemas/blob/412d70176953ed9ac2e6a03f7135b09b7565fc5d/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json) and [pipeline flow UI schema](https://github.com/elyra-ai/pipeline-schemas/blob/412d70176953ed9ac2e6a03f7135b09b7565fc5d/common-pipeline/pipeline-flow/pipeline-flow-ui-v3-schema.json).
