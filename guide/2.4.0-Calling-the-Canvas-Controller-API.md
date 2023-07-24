
## Techniques for calling Canvas Controller API

There are a couple of techniques you can use to update the object model using the Canvas Controller.

### Incremental Updates
Once the pipeline flow is loaded into common-canvas using: 
```
canvasController.setPipelineFlow(pFlow)
``` 
the pipeline flow is held in memory “inside” the object model of common-canvas.   Thereafter, you can update that in-memory pipeline flow by calling canvas controller API such as: `deleteComment` or `createNode`, etc.  The canvas controller will directly update the in-memory object model based on these calls, and it will cause the canvas view to refresh to reflect the change your code requested with the API call.

It’s best to use the above technique when making small incremental changes to the object model often based on user requests.

### Extensive Updates

An alternative to making these individual API calls is to use `canvasController.getPipelineFlow(pFlow)`
which will return the full contents of the current state of the object model into a variable e.g.
```
const currentPF = this.canvasController.getPipelineFlow();   
```
You can then make changes to the pipeline flow using you own code.
For example:

```
// Wipe out all the comments in the zeroth pipeline
currentPF.pipelines[0].comments = []; 
```

and then set the pipeline flow back into common canvas with this:

```
this.canvasController.setPipelineFlow(currentPF);   
```

Note: the updating of the pipeline flow (currentPF) is entirely done by your code — there is no API to help you — so you have to understand the [pipeline flow schema](https://github.com/elyra-ai/pipeline-schemas/blob/main/common-pipeline/pipeline-flow/pipeline-flow-v3-schema.json) to understand what to do. 

This technique is probably most useful when doing extensive changes to the pipeline flow where you don’t want each change to cause a refresh of the canvas. This is because the only refresh of the canvas will be when you do the final `setPipelineFlow()` call.

