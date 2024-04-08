# API differences with schema
Because historically common-canvas has had to deal with different external flow definitions, there are some differences between the nodes, comments and links that the CanvasController API handles internally and those specified in the pipelineFlow schema. As follows:

## Object structure
  For the API methods that involve nodes, comments and links, those objects are passed in and out by the API in their internal formats rather than the formats defined in the schema files. 

The internal structure is a somewhat flattened version of that in the schema definition. That means, properties that are in `<object>.app_data.ui_data` are flattened out and appear as properties in the `<object>` itself. So for example a node that conforms to the schema might look like this:
```js
    {
      id: "1234",
      op: "select",
      ...
      app_data : {
        ui_data: {
          label: "Selection node",
          image: "/images/select.svg",
          description: "A node for selection"
          ...
        },
        other_data: {
          prop1: "Something interesting"
        }
      }
    }
```
whereas when it is passed through the API it looks like this:
```js
    {
      id: "1234",
      op: "select",
      label: "Selection node",
      image: "/images/select.svg",
      description: "A node for selection"
      ...
      app_data : {
        other_data: {
          prop1: "Something interesting"
        }
      }
    }
```
Note that, any properties in `app_data`, other than `ui_data`, are preserved in the internal format. So in the example, `app_data.other_data` in the schema format is preserved in the internal format.

## Links handing in the API
The other difference between the API and the schema formats is with links. 

In the pipeline flow schema, links are typically defined as properties within another object, for example, a node to node link is defined within a `links` array inside the `inputs` field of the target node and contains references to the `node id` and `port` of the source node. Also, links from comments to nodes are stored as an array in the comment object.

However, in the API and internally in common-canvas, links are treated as a top level object; that is, there is an array of links stored internally which can be manipulated using the API methods. Each link has a unique ID. Consequently, links can be retrieved from the API by their ID field and properties of the links can be updated again by identifying the links using their ID. If you do not specify an ID for links in your pipelineFlow document a unique global ID will be generated for each link when the pipeline flow is loaded.