# Selection Change Handler

This is an optional callback. It is triggered whenever the set of selected objects on the canvas changes
either through selection or deselection.


## selectionChangeHandler
```js
    selectionChangeHandler(data)
```
The callback contains a JavaScript object with the following format:
```
{
    "selection": [
      "id6PXRG57DGIV"
    ],
    "selectedNodes": [
      {
        "id": "id6PXRG57DGIV",
        "type": "binding",
        "operator_id_ref": "variablefile",
        "output_ports": [...],
        "input_ports": [],
        "label": "DRUG1n",
        "description": "",
        "image": "",
        "x_pos": 96,
        "y_pos": 219,
        "class_name": "canvas-node",
        "decorations": [],
        "parameters": [],
        "messages": [],
        "inputPortsHeight": 0,
        "outputPortsHeight": 20,
        "height": 75,
        "width": 70
      }
    ],
    "selectedComments": [],
    "addedNodes": [
      {
        "id": "id6PXRG57DGIV",
        "type": "binding",
        "operator_id_ref": "variablefile",
        "output_ports": [...],
        "input_ports": [],
        "label": "DRUG1n",
        "description": "",
        "image": "",
        "x_pos": 96,
        "y_pos": 219,
        "class_name": "canvas-node",
        "decorations": [],
        "parameters": [],
        "messages": [],
        "inputPortsHeight": 0,
        "outputPortsHeight": 20,
        "height": 75,
        "width": 70
      }
    ],
    "addedComments": [],
    "deselectedNodes": [
      {
        "id": "id2PZSCTRPRIJ",
        "type": "execution_node",
        "operator_id_ref": "derive",
        "output_ports": [...],
        "input_ports": [...],
        "label": "Na_to_K",
        "description": "",
        "image": "",
        "x_pos": 219.01116943359375,
        "y_pos": 162.3754425048828,
        "class_name": "canvas-node",
        "decorations": [],
        "parameters": [],
        "messages": [...],
        "inputPortsHeight": 20,
        "outputPortsHeight": 20,
        "height": 75,
        "width": 70
      }
    ],
    "deselectedComments": [
      {
        "id": "id42ESQA3VPXB",
        "content": " comment 1",
        "height": 34,
        "width": 128,
        "x_pos": 132,
        "y_pos": 103,
        "class_name": "canvas-comment-1"
      }
    ],
    previousPipelineId: "123-456",
    selectedPipelineId: "789-012"
}
```

- selection: Array with ids of selected nodes and comments
- selectedNodes: Array of selected node objects
- selectedComments: Array of selected comment objects
- addedNodes: Array with node objects that were added to the selection
- addedComments: Array with comment objects that were added to the selection
- deselectedNodes: Array with node objects that were removed from the selection
- deselectedComments: Array with comment objects that were removed from the selection
- previousPipelineId: The ID of the Pipeline for the selected objects prior to the selection action
- selectedPipelineId: The ID of the Pipeline for the newly selected objects

