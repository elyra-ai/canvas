
import {expect, assert} from 'chai';
import _ from 'underscore';
import deepFreeze from 'deep-freeze';
import ObjectModel from '../src/object-model/object-model.js';

describe('ObjectModel handle model OK', () => {

    it('should create a canvas', () => {
      console.log("should create a canvas");

      let expectedCanvas =
           {zoom: 100,
            diagram:
              {name:"my diagram",
               nodes: [{id: "node1", name: "Node 1"},
                       {id: "node2", name: "Node 2"}]
              }
           };

     deepFreeze(expectedCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: expectedCanvas
      });

      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });


    it('should clear a canvas', () => {
      console.log("should clear a canvas");

      let startCanvas =
          {diagram:
            {nodes: [
               {id: "node1", xPos: 10, yPos: 10},
               {id: "node2", xPos: 20, yPos: 20},
               {id: "node3", xPos: 30, yPos: 30}
              ],
             comments: [
               {id: "comment1", xPos: 50, yPos: 50},
               {id: "comment2", xPos: 60, yPos: 60}
              ]
            }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({type: "CLEAR_CANVAS"});

      let expectedCanvas = null;
      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

		it('should add a node', () => {
			console.log("should add a node");

			let startCanvas =
					{diagram:
						{nodes: [
							 {id: "node1", xPos: 10, yPos: 10},
							 {id: "node2", xPos: 20, yPos: 20},
							 {id: "node3", xPos: 30, yPos: 30}
							],
						 comments: [
							 {id: "comment1", xPos: 50, yPos: 50},
							 {id: "comment2", xPos: 60, yPos: 60}
							]
						}
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			// imageName - Just for Testing
			ObjectModel.dispatch({
				type: "ADD_NODE",
				data: {id: "node4",
							 image: "imageName",
							 inputPorts: [{name: "inPort", label: "Input Port", cardinality: "1:1"}],
							 outputPorts: [{name: "outPort", label: "Output Port", cardinality: "1:1"}],
			         xPos: 40,
			         yPos: 40,
			         label: "Type"}
			});

			let expectedCanvas =
					{diagram:
						{nodes: [
							 {id: "node1", xPos: 10, yPos: 10},
							 {id: "node2", xPos: 20, yPos: 20},
							 {id: "node3", xPos: 30, yPos: 30},
							 {id: "node4", className: "canvas-node", image: "imageName",
							 outputPorts: [{name: "outPort", label: "Output Port", cardinality: "1:1"}],
							 inputPorts: [{name: "inPort", label: "Input Port", cardinality: "1:1"}],
							 xPos: 40, yPos: 40, objectData:{description:"", label:"Type"}}
							],
						 comments: [
							 {id: "comment1", xPos: 50, yPos: 50},
							 {id: "comment2", xPos: 60, yPos: 60}
						 ]
						}
					};

			let actualCanvas = ObjectModel.getCanvas();

			console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
			console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

			expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
		});

    it('should move a node', () => {
      console.log("should move a node");

      let startCanvas =
          {diagram:
            {nodes: [
               {id: "node1", xPos: 10, yPos: 10},
               {id: "node2", xPos: 20, yPos: 20},
               {id: "node3", xPos: 30, yPos: 30}
              ],
             comments: [
               {id: "comment1", xPos: 50, yPos: 50},
               {id: "comment2", xPos: 60, yPos: 60}
              ]
            }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "MOVE_OBJECTS",
        data: {nodes: ["node1", "node2", "node3"],
               offsetX: 5,
               offsetY: 7}
      });

      let expectedCanvas =
          {diagram:
            {nodes: [
               {id: "node1", xPos: 15, yPos: 17},
               {id: "node2", xPos: 25, yPos: 27},
               {id: "node3", xPos: 35, yPos: 37}
              ],
             comments: [
               {id: "comment1", xPos: 50, yPos: 50},
               {id: "comment2", xPos: 60, yPos: 60}
             ],
             links: []
            }
          };

      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

    it('should delete a node', () => {
      console.log("should delete a node");

      let startCanvas =
          {zoom: 100,
           diagram:
            {nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ]
        }};

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "DELETE_OBJECTS",
        data: {selectedObjectIds: ["node1", "node3"]}
      });

      let expectedCanvas =
          {zoom: 100,
           diagram:
            {nodes: [
              {id: "node2", xPos: 20, yPos: 20}
            ],
            comments: [
							 {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: []
        }};

      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

		it('should disconnect a node', () => {
			console.log("should disconnect a node");

			let startCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			ObjectModel.dispatch({
				type: "DISCONNECT_NODES",
				data: {selectedNodeIds: ["node1"]}
			});

			let expectedCanvas =
					{zoom: 100,
						 diagram: {
							 nodes: [
								{id: "node1", xPos: 10, yPos: 10},
								{id: "node2", xPos: 20, yPos: 20},
								{id: "node3", xPos: 30, yPos: 30}
							 ],
							 comments: [
								{id: "comment1", xPos: 50, yPos: 50},
								{id: "comment2", xPos: 60, yPos: 60}
							],
							links: [
								{id: "link2", source: "comment1", target: "node2"}
							]
						 }
					};

			let actualCanvas = ObjectModel.getCanvas();

			console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
			console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

			expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
		});

		it('should add node attr', () => {
			console.log("should add node attr");

			let startCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			ObjectModel.dispatch({
				type: "ADD_NODE_ATTR",
				data: {objIds: ["node1"],
							 attrName:"bgcolor"}
			});

			let expectedCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10,"customAttrs":["bgcolor"]},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			let actualCanvas = ObjectModel.getCanvas();

			console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
			console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

			expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
		});

		it('should remove node attr', () => {
			console.log("should remove node attr");

			let startCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10, "customAttrs":["bgcolor"]},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			ObjectModel.dispatch({
				type: "REMOVE_NODE_ATTR",
				data: {objIds: ["node1"],
							 attrName:"bgcolor"}
			});

			let expectedCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10,"customAttrs":[]},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			let actualCanvas = ObjectModel.getCanvas();

			console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
			console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

			expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
		});

    it('should add a comment', () => {
      console.log("should add a comment");


      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "ADD_COMMENT",
        data: {id: "comment3", mousePos: {x: 200, y: 300}, selectedObjectIds: []}
      });

      let expectedCanvas =
          {zoom: 100,
             diagram: {
               nodes: [
                {id: "node1", xPos: 10, yPos: 10},
                {id: "node2", xPos: 20, yPos: 20},
                {id: "node3", xPos: 30, yPos: 30}
               ],
               comments: [
                {id: "comment1", xPos: 50, yPos: 50},
                {id: "comment2", xPos: 60, yPos: 60},
                {id: "comment3",
                 className: 'canvas-comment',
                 content: " ",
                 height: 32,
                 width: 128,
                 xPos: 200,
                 yPos: 300}
               ],
               links: []
             }
          };


      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

    it('should edit a comment', () => {
      console.log("should edit a comment");


      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "EDIT_COMMENT",
        data: {nodes: ["comment2"], offsetX: 425, offsetY: 125, height: 45, width: 250, label: "this is a new comment string"}
      });

      let expectedCanvas =
          {zoom: 100,
             diagram: {
               nodes: [
                {id: "node1", xPos: 10, yPos: 10},
                {id: "node2", xPos: 20, yPos: 20},
                {id: "node3", xPos: 30, yPos: 30}
               ],
               comments: [
                {id: "comment1", xPos: 50, yPos: 50},
                {id: "comment2",
                 xPos: 425,
                 yPos: 125,
                 content: "this is a new comment string",
                 height: 45,
                 width: 250}
               ]
             }
          };


      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

		it('should move a comment', () => {
      console.log("should move a comment");

      let startCanvas =
          {diagram:
            {nodes: [
               {id: "node1", xPos: 10, yPos: 10},
               {id: "node2", xPos: 20, yPos: 20},
               {id: "node3", xPos: 30, yPos: 30}
              ],
             comments: [
               {id: "comment1", xPos: 50, yPos: 50},
               {id: "comment2", xPos: 60, yPos: 60}
              ]
            }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "MOVE_OBJECTS",
        data: {nodes: ["comment1", "comment2"],
               offsetX: 5,
               offsetY: 7}
      });

      let expectedCanvas =
          {diagram:
            {nodes: [
               {id: "node1", xPos: 10, yPos: 10},
               {id: "node2", xPos: 20, yPos: 20},
               {id: "node3", xPos: 30, yPos: 30}
              ],
             comments: [
               {id: "comment1", xPos: 55, yPos: 57},
               {id: "comment2", xPos: 65, yPos: 67}
             ],
             links: []
            }
          };

      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

		it('should delete a comment', () => {
		  console.log("should delete a comment");

			  let startCanvas =
			      {zoom: 100,
			       diagram: {
			        nodes: [
			          {id: "node1", xPos: 10, yPos: 10},
			          {id: "node2", xPos: 20, yPos: 20},
			          {id: "node3", xPos: 30, yPos: 30}
			        ],
			        comments: [
			          {id: "comment1", xPos: 50, yPos: 50},
			          {id: "comment2", xPos: 60, yPos: 60},
								{id: "comment3", xPos: 70, yPos: 70},
			        ],
							"links":[]
			       }
			      };

			  deepFreeze(startCanvas);

			  ObjectModel.dispatch({
			    type: "SET_CANVAS",
			    data: startCanvas
			  });

				  ObjectModel.dispatch({
				    type: "DELETE_OBJECTS",
				    data: {selectedObjectIds: ["comment1", "comment2"]}
				  });

					let expectedCanvas =
							{zoom: 100,
							 diagram: {
								nodes: [
									{id: "node1", xPos: 10, yPos: 10},
									{id: "node2", xPos: 20, yPos: 20},
									{id: "node3", xPos: 30, yPos: 30}
								],
								comments: [
									{id: "comment3", xPos: 70, yPos: 70}
								],
								"links":[]
							 }
							};


		      let actualCanvas = ObjectModel.getCanvas();

		      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
		      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

		      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;

			});

			it('should add comment attr', () => {
				console.log("should add comment attr");

				let startCanvas =
						{zoom: 100,
						 diagram: {
							nodes: [
								{id: "node1", xPos: 10, yPos: 10},
								{id: "node2", xPos: 20, yPos: 20},
								{id: "node3", xPos: 30, yPos: 30}
							],
							comments: [
								{id: "comment1", xPos: 50, yPos: 50},
								{id: "comment2", xPos: 60, yPos: 60}
							],
							links: [
								{id: "link1", source: "node1", target: "node2"},
								{id: "link2", source: "comment1", target: "node2"}
							]
						 }
						};

				deepFreeze(startCanvas);

				ObjectModel.dispatch({
					type: "SET_CANVAS",
					data: startCanvas
				});

				ObjectModel.dispatch({
					type: "ADD_COMMENT_ATTR",
					data: {objIds: ["comment1"],
								 attrName:"bgcolor"}
				});

				let expectedCanvas =
						{zoom: 100,
						 diagram: {
							nodes: [
								{id: "node1", xPos: 10, yPos: 10},
								{id: "node2", xPos: 20, yPos: 20},
								{id: "node3", xPos: 30, yPos: 30}
							],
							comments: [
								{id: "comment1", xPos: 50, yPos: 50, "customAttrs":["bgcolor"]},
								{id: "comment2", xPos: 60, yPos: 60}
							],
							links: [
								{id: "link1", source: "node1", target: "node2"},
								{id: "link2", source: "comment1", target: "node2"}
							]
						 }
						};

				let actualCanvas = ObjectModel.getCanvas();

				console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
				console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

				expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
			});

			it('should remove comment attr', () => {
				console.log("should remove comment attr");

				let startCanvas =
						{zoom: 100,
						 diagram: {
							nodes: [
								{id: "node1", xPos: 10, yPos: 10},
								{id: "node2", xPos: 20, yPos: 20},
								{id: "node3", xPos: 30, yPos: 30}
							],
							comments: [
								{id: "comment1", xPos: 50, yPos: 50, "customAttrs":["bgcolor"]},
								{id: "comment2", xPos: 60, yPos: 60}
							],
							links: [
								{id: "link1", source: "node1", target: "node2"},
								{id: "link2", source: "comment1", target: "node2"}
							]
						 }
						};

				deepFreeze(startCanvas);

				ObjectModel.dispatch({
					type: "SET_CANVAS",
					data: startCanvas
				});

				ObjectModel.dispatch({
					type: "REMOVE_COMMENT_ATTR",
					data: {objIds: ["comment1"],
								 attrName:"bgcolor"}
				});

				let expectedCanvas =
						{zoom: 100,
						 diagram: {
							nodes: [
								{id: "node1", xPos: 10, yPos: 10},
								{id: "node2", xPos: 20, yPos: 20},
								{id: "node3", xPos: 30, yPos: 30}
							],
							comments: [
								{id: "comment1", xPos: 50, yPos: 50,"customAttrs":[]},
								{id: "comment2", xPos: 60, yPos: 60}
							],
							links: [
								{id: "link1", source: "node1", target: "node2"},
								{id: "link2", source: "comment1", target: "node2"}
							]
						 }
						};

				let actualCanvas = ObjectModel.getCanvas();

				console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
				console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

				expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
			});

    it('should add a link', () => {
      console.log("should add a link");

      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: [
              {id: "link1", source: "node1", target: "node2"},
              {id: "link2", source: "comment1", target: "node2"}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "ADD_LINK",
        data: {id: "link3", linkType: "data", srcNodeId: "node2", trgNodeId: "node3"}
      });

      ObjectModel.dispatch({
        type: "ADD_LINK",
        data: {id: "link4", linkType: "comment", srcNodeId: "comment1", trgNodeId: "node2"}
      });


      let expectedCanvas =
          {zoom: 100,
             diagram: {
               nodes: [
                {id: "node1", xPos: 10, yPos: 10},
                {id: "node2", xPos: 20, yPos: 20},
                {id: "node3", xPos: 30, yPos: 30}
               ],
               comments: [
                {id: "comment1", xPos: 50, yPos: 50},
                {id: "comment2", xPos: 60, yPos: 60}
              ],
              links: [
                {id: "link1", source: "node1", target: "node2"},
                {id: "link2", source: "comment1", target: "node2"},
                {id: "link3", className: "canvas-data-link", source: "node2", target: "node3"},
                {id: "link4", className: "canvas-comment-link", source: "comment1", target: "node2"}
              ]
             }
          };

      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

    it('should delete a link', () => {
      console.log("should delete a link");

      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: [
              {id: "link1", source: "node1", target: "node2"},
              {id: "link2", source: "comment1", target: "node2"}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "DELETE_LINK",
        data: {id: "link1"}
      });

      let expectedCanvas =
          {zoom: 100,
             diagram: {
               nodes: [
                {id: "node1", xPos: 10, yPos: 10},
                {id: "node2", xPos: 20, yPos: 20},
                {id: "node3", xPos: 30, yPos: 30}
               ],
               comments: [
                {id: "comment1", xPos: 50, yPos: 50},
                {id: "comment2", xPos: 60, yPos: 60}
              ],
              links: [
                {id: "link2", source: "comment1", target: "node2"}
              ]
             }
          };

      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

    it('should delete a link when a node is deleted', () => {
      console.log("should delete a link when a node is deleted.");

      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: [
              {id: "link1", source: "node1", target: "node2"},
              {id: "link2", source: "comment1", target: "node2"}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "DELETE_OBJECTS",
        data: {selectedObjectIds: ["node1"]}
      });

      let expectedCanvas =
          {zoom: 100,
             diagram: {
               nodes: [
                {id: "node2", xPos: 20, yPos: 20},
                {id: "node3", xPos: 30, yPos: 30}
               ],
               comments: [
                {id: "comment1", xPos: 50, yPos: 50},
                {id: "comment2", xPos: 60, yPos: 60}
              ],
              links: [
                {id: "link2", source: "comment1", target: "node2"}
              ]
             }
          };

      let actualCanvas = ObjectModel.getCanvas();

      console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
      console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

      expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
    });

		it('should delete a link when a comment is deleted', () => {
			console.log("should delete a link when a comment is deleted.");

			let startCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			ObjectModel.dispatch({
				type: "DELETE_OBJECTS",
				data: {selectedObjectIds: ["comment1"]}
			});

			let expectedCanvas =
					{zoom: 100,
						 diagram: {
							 nodes: [
								{id: "node1", xPos: 10, yPos: 10},
								{id: "node2", xPos: 20, yPos: 20},
								{id: "node3", xPos: 30, yPos: 30}
							 ],
							 comments: [
								{id: "comment2", xPos: 60, yPos: 60}
							],
							links: [
								{id: "link1", source: "node1", target: "node2"}
							]
						 }
					};

			let actualCanvas = ObjectModel.getCanvas();

			console.log("Expected Canvas = " + JSON.stringify(expectedCanvas));
			console.log("Actual Canvas   = " + JSON.stringify(actualCanvas));

			expect(_.isEqual(expectedCanvas, actualCanvas)).to.be.true;
		});

    it('should select an object', () => {
      console.log("should select an object.");

      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: [
              {id: "link1", source: "node1", target: "node2"},
              {id: "link2", source: "comment1", target: "node2"}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "SET_SELECTIONS",
        data: ["comment1", "node3"]
      });

      let expectedSelections = ["comment1", "node3"];
      let actualSelections = ObjectModel.getSelectedObjectIds();

      console.log("Expected Selections = " + JSON.stringify(expectedSelections));
      console.log("Actual Selections   = " + JSON.stringify(actualSelections));

      expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
    });

    it('should clear current selections', () => {
      console.log("should clear current selections.");

      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: [
              {id: "link1", source: "node1", target: "node2"},
              {id: "link2", source: "comment1", target: "node2"}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "SET_SELECTIONS",
        data: ["comment1", "node3"]
      });

      ObjectModel.dispatch({
        type: "CLEAR_SELECTIONS"
      });


      let expectedSelections = [];
      let actualSelections = ObjectModel.getSelectedObjectIds();

      console.log("Expected Selections = " + JSON.stringify(expectedSelections));
      console.log("Actual Selections   = " + JSON.stringify(actualSelections));

      expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
    });

		it('should select toggle off comment', () => {
      console.log("should select toggle off comment.");

      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: [
              {id: "link1", source: "node1", target: "node2"},
              {id: "link2", source: "comment1", target: "node2"}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "SET_SELECTIONS",
        data: ["comment1", "node3"]
      });


			ObjectModel.toggleSelection("comment1", true);


      let expectedSelections = ["node3"];
      let actualSelections = ObjectModel.getSelectedObjectIds();

      console.log("Expected Selections = " + JSON.stringify(expectedSelections));
      console.log("Actual Selections   = " + JSON.stringify(actualSelections));

      expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
    });

		it('should select toggle on comment', () => {
      console.log("should select toggle on comment.");

      let startCanvas =
          {zoom: 100,
           diagram: {
            nodes: [
              {id: "node1", xPos: 10, yPos: 10},
              {id: "node2", xPos: 20, yPos: 20},
              {id: "node3", xPos: 30, yPos: 30}
            ],
            comments: [
              {id: "comment1", xPos: 50, yPos: 50},
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: [
              {id: "link1", source: "node1", target: "node2"},
              {id: "link2", source: "comment1", target: "node2"}
            ]
           }
          };

      deepFreeze(startCanvas);

      ObjectModel.dispatch({
        type: "SET_CANVAS",
        data: startCanvas
      });

      ObjectModel.dispatch({
        type: "SET_SELECTIONS",
        data: ["node3"]
      });


			ObjectModel.toggleSelection("comment1", true);


      let expectedSelections = ["node3", "comment1"];
      let actualSelections = ObjectModel.getSelectedObjectIds();

      console.log("Expected Selections = " + JSON.stringify(expectedSelections));
      console.log("Actual Selections   = " + JSON.stringify(actualSelections));

      expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
    });

		it('should select toggle off node', () => {
			console.log("should select toggle off node.");

			let startCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			ObjectModel.dispatch({
				type: "SET_SELECTIONS",
				data: ["comment1", "node3"]
			});


			ObjectModel.toggleSelection("node3", true);


			let expectedSelections = ["comment1"];
			let actualSelections = ObjectModel.getSelectedObjectIds();

			console.log("Expected Selections = " + JSON.stringify(expectedSelections));
			console.log("Actual Selections   = " + JSON.stringify(actualSelections));

			expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
		});

		it('should select toggle on node', () => {
			console.log("should select toggle on node.");

			let startCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "comment1", target: "node2"}
						]
					 }
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			ObjectModel.dispatch({
				type: "SET_SELECTIONS",
				data: ["comment1"]
			});


			ObjectModel.toggleSelection("node3", true);


			let expectedSelections = ["comment1", "node3"];
			let actualSelections = ObjectModel.getSelectedObjectIds();

			console.log("Expected Selections = " + JSON.stringify(expectedSelections));
			console.log("Actual Selections   = " + JSON.stringify(actualSelections));

			expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
		});

		it('should select nodes in a simple subgraph', () => {
			console.log("should select nodes in a simple subgraph.");

			let startCanvas =
					{zoom: 100,
					 diagram: {
						nodes: [
							{id: "node1", xPos: 10, yPos: 10},
							{id: "node2", xPos: 20, yPos: 20},
							{id: "node3", xPos: 30, yPos: 30},
							{id: "node4", xPos: 40, yPos: 30}
						],
						comments: [
							{id: "comment1", xPos: 50, yPos: 50},
							{id: "comment2", xPos: 60, yPos: 60}
						],
						links: [
							{id: "link1", source: "node1", target: "node2"},
							{id: "link2", source: "node2", target: "node3"},
							{id: "link3", source: "node3", target: "node4"},
							{id: "link4", source: "comment1", target: "node2"}
						]
					 }
					};

			deepFreeze(startCanvas);

			ObjectModel.dispatch({
				type: "SET_CANVAS",
				data: startCanvas
			});

			ObjectModel.dispatch({
				type: "SET_SELECTIONS",
				data: ["node2"]
			});


			ObjectModel.selectSubGraph("node4");


			let expectedSelections = ["node2", "node4", "node3"];
			let actualSelections = ObjectModel.getSelectedObjectIds();

			console.log("Expected Selections = " + JSON.stringify(expectedSelections));
			console.log("Actual Selections   = " + JSON.stringify(actualSelections));

			expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
		});

	it('should select nodes in a fork subgraph', () => {
		console.log("should select nodes in a fork subgraph.");

		let startCanvas =
				{zoom: 100,
				 diagram: {
					nodes: [
						{id: "node1", xPos: 10, yPos: 10},
						{id: "node2", xPos: 20, yPos: 20},
						{id: "node3", xPos: 30, yPos: 30},
						{id: "node4", xPos: 40, yPos: 30}
					],
					comments: [
						{id: "comment1", xPos: 50, yPos: 50},
						{id: "comment2", xPos: 60, yPos: 60}
					],
					links: [
						{id: "link1", source: "node1", target: "node2"},
						{id: "link2", source: "node2", target: "node3"},
						{id: "link3", source: "node2", target: "node4"},
						{id: "link4", source: "comment1", target: "node2"}
					]
				 }
				};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node4");


		let expectedSelections = ["node1", "node4", "node2"];
		let actualSelections = ObjectModel.getSelectedObjectIds();

		console.log("Expected Selections = " + JSON.stringify(expectedSelections));
		console.log("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it('should select nodes in a merge subgraph', () => {
		console.log("should select nodes in a merge subgraph.");

		let startCanvas =
				{zoom: 100,
				 diagram: {
					nodes: [
						{id: "node1", xPos: 10, yPos: 10},
						{id: "node2", xPos: 20, yPos: 20},
						{id: "node3", xPos: 30, yPos: 30},
						{id: "node4", xPos: 40, yPos: 30}
					],
					comments: [
						{id: "comment1", xPos: 50, yPos: 50},
						{id: "comment2", xPos: 60, yPos: 60}
					],
					links: [
						{id: "link1", source: "node1", target: "node3"},
						{id: "link2", source: "node2", target: "node3"},
						{id: "link3", source: "node3", target: "node4"},
						{id: "link4", source: "comment1", target: "node2"}
					]
				 }
				};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node4");


		let expectedSelections = ["node1", "node4", "node3"];
		let actualSelections = ObjectModel.getSelectedObjectIds();

		console.log("Expected Selections = " + JSON.stringify(expectedSelections));
		console.log("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it('should select nodes in a simple partial subgraph', () => {
		console.log("should select nodes in a simple partial subgraph.");

		let startCanvas =
				{zoom: 100,
				 diagram: {
					nodes: [
						{id: "node1", xPos: 10, yPos: 10},
						{id: "node2", xPos: 20, yPos: 20},
						{id: "node3", xPos: 30, yPos: 30},
						{id: "node4", xPos: 40, yPos: 30},
						{id: "node5", xPos: 50, yPos: 30}
					],
					comments: [
						{id: "comment1", xPos: 50, yPos: 50},
						{id: "comment2", xPos: 60, yPos: 60}
					],
					links: [
						{id: "link1", source: "node1", target: "node2"},
						{id: "link2", source: "node2", target: "node3"},
						{id: "link3", source: "node3", target: "node4"},
						{id: "link5", source: "node4", target: "node5"},
						{id: "link4", source: "comment1", target: "node2"}
					]
				 }
				};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node2"]
		});


		ObjectModel.selectSubGraph("node4");


		let expectedSelections = ["node2", "node4", "node3"];
		let actualSelections = ObjectModel.getSelectedObjectIds();

		console.log("Expected Selections = " + JSON.stringify(expectedSelections));
		console.log("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it('should select nodes in a complex subgraph', () => {
		console.log("should select nodes in a complex subgraph.");

		let startCanvas =
				{zoom: 100,
				 diagram: {
					nodes: [
						{id: "node1", xPos: 10, yPos: 10},
						{id: "node2", xPos: 20, yPos: 20},
						{id: "node3", xPos: 30, yPos: 30},
						{id: "node4", xPos: 40, yPos: 30},
						{id: "node5", xPos: 50, yPos: 30},
						{id: "node6", xPos: 60, yPos: 30},
						{id: "node7", xPos: 70, yPos: 30},
						{id: "node8", xPos: 80, yPos: 30},
						{id: "node9", xPos: 90, yPos: 30},
						{id: "node10", xPos: 100, yPos: 30},
						{id: "node11", xPos: 110, yPos: 30},
						{id: "node12", xPos: 120, yPos: 30},
						{id: "node13", xPos: 130, yPos: 30}
					],
					comments: [
						{id: "comment1", xPos: 50, yPos: 50},
						{id: "comment2", xPos: 60, yPos: 60}
					],
					links: [
						{id: "link1", source: "node1", target: "node2"},
						{id: "link2", source: "node2", target: "node3"},
						{id: "link3", source: "node3", target: "node4"},
						{id: "link5", source: "node4", target: "node9"},
						{id: "link4", source: "comment1", target: "node7"},
						{id: "link6", source: "node4", target: "node10"},
						{id: "link7", source: "node4", target: "node11"},
						{id: "link8", source: "node4", target: "node12"},
						{id: "link9", source: "node9", target: "node10"},
						{id: "link10", source: "node12", target: "node11"},
						{id: "link11", source: "node11", target: "node13"},
						{id: "link12", source: "node8", target: "node4"},
						{id: "link13", source: "node1", target: "node5"},
						{id: "link14", source: "node5", target: "node6"},
						{id: "link15", source: "node1", target: "node7"},
						{id: "link16", source: "node7", target: "node4"},
						{id: "link17", source: "node6", target: "node4"}
					]
				 }
				};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node13");


		let expectedSelections = ["node1", "node13", "node2", "node3", "node4", "node11", "node12",
															"node5", "node6", "node7"];
		let actualSelections = ObjectModel.getSelectedObjectIds();

		console.log("Expected Selections = " + JSON.stringify(expectedSelections));
		console.log("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it('should select nodes in a complex patial subgraph', () => {
		console.log("should select nodes in a complex partial subgraph.");

		let startCanvas =
				{zoom: 100,
				 diagram: {
					nodes: [
						{id: "node1", xPos: 10, yPos: 10},
						{id: "node2", xPos: 20, yPos: 20},
						{id: "node3", xPos: 30, yPos: 30},
						{id: "node4", xPos: 40, yPos: 30},
						{id: "node5", xPos: 50, yPos: 30},
						{id: "node6", xPos: 60, yPos: 30},
						{id: "node7", xPos: 70, yPos: 30},
						{id: "node8", xPos: 80, yPos: 30},
						{id: "node9", xPos: 90, yPos: 30},
						{id: "node10", xPos: 100, yPos: 30},
						{id: "node11", xPos: 110, yPos: 30},
						{id: "node12", xPos: 120, yPos: 30},
						{id: "node13", xPos: 130, yPos: 30}
					],
					comments: [
						{id: "comment1", xPos: 50, yPos: 50},
						{id: "comment2", xPos: 60, yPos: 60}
					],
					links: [
						{id: "link1", source: "node1", target: "node2"},
						{id: "link2", source: "node2", target: "node3"},
						{id: "link3", source: "node3", target: "node4"},
						{id: "link5", source: "node4", target: "node9"},
						{id: "link4", source: "comment1", target: "node7"},
						{id: "link6", source: "node4", target: "node10"},
						{id: "link7", source: "node4", target: "node11"},
						{id: "link8", source: "node4", target: "node12"},
						{id: "link9", source: "node9", target: "node10"},
						{id: "link10", source: "node12", target: "node11"},
						{id: "link11", source: "node11", target: "node13"},
						{id: "link12", source: "node8", target: "node4"},
						{id: "link13", source: "node1", target: "node5"},
						{id: "link14", source: "node5", target: "node6"},
						{id: "link15", source: "node1", target: "node7"},
						{id: "link16", source: "node7", target: "node4"},
						{id: "link17", source: "node6", target: "node4"}
					]
				 }
				};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node1"]
		});


		ObjectModel.selectSubGraph("node12");


		let expectedSelections = ["node1", "node12", "node2", "node3", "node4",
															"node5", "node6", "node7"];
		let actualSelections = ObjectModel.getSelectedObjectIds();

		console.log("Expected Selections = " + JSON.stringify(expectedSelections));
		console.log("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it('should select nodes in a complex single input subgraph', () => {
		console.log("should select nodes in a complex single input subgraph.");

		let startCanvas =
				{zoom: 100,
				 diagram: {
					nodes: [
						{id: "node1", xPos: 10, yPos: 10},
						{id: "node2", xPos: 20, yPos: 20},
						{id: "node3", xPos: 30, yPos: 30},
						{id: "node4", xPos: 40, yPos: 30},
						{id: "node5", xPos: 50, yPos: 30},
						{id: "node6", xPos: 60, yPos: 30},
						{id: "node7", xPos: 70, yPos: 30},
						{id: "node8", xPos: 80, yPos: 30},
						{id: "node9", xPos: 90, yPos: 30},
						{id: "node10", xPos: 100, yPos: 30},
						{id: "node11", xPos: 110, yPos: 30},
						{id: "node12", xPos: 120, yPos: 30},
						{id: "node13", xPos: 130, yPos: 30}
					],
					comments: [
						{id: "comment1", xPos: 50, yPos: 50},
						{id: "comment2", xPos: 60, yPos: 60}
					],
					links: [
						{id: "link1", source: "node1", target: "node2"},
						{id: "link2", source: "node2", target: "node3"},
						{id: "link3", source: "node3", target: "node4"},
						{id: "link5", source: "node4", target: "node9"},
						{id: "link4", source: "comment1", target: "node7"},
						{id: "link6", source: "node4", target: "node10"},
						{id: "link7", source: "node4", target: "node11"},
						{id: "link8", source: "node4", target: "node12"},
						{id: "link9", source: "node9", target: "node10"},
						{id: "link10", source: "node12", target: "node11"},
						{id: "link11", source: "node11", target: "node13"},
						{id: "link12", source: "node8", target: "node4"},
						{id: "link13", source: "node1", target: "node5"},
						{id: "link14", source: "node5", target: "node6"},
						{id: "link15", source: "node1", target: "node7"},
						{id: "link16", source: "node7", target: "node4"},
						{id: "link17", source: "node6", target: "node4"}
					]
				 }
				};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["node8"]
		});


		ObjectModel.selectSubGraph("node11");


		let expectedSelections = ["node8", "node11", "node4", "node12"];
		let actualSelections = ObjectModel.getSelectedObjectIds();

		console.log("Expected Selections = " + JSON.stringify(expectedSelections));
		console.log("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

	it('should select nodes in a complex subgraph starting with comment', () => {
		console.log("should select nodes in a complex subgraph starting with comment.");

		let startCanvas =
				{zoom: 100,
				 diagram: {
					nodes: [
						{id: "node1", xPos: 10, yPos: 10},
						{id: "node2", xPos: 20, yPos: 20},
						{id: "node3", xPos: 30, yPos: 30},
						{id: "node4", xPos: 40, yPos: 30},
						{id: "node5", xPos: 50, yPos: 30},
						{id: "node6", xPos: 60, yPos: 30},
						{id: "node7", xPos: 70, yPos: 30},
						{id: "node8", xPos: 80, yPos: 30},
						{id: "node9", xPos: 90, yPos: 30},
						{id: "node10", xPos: 100, yPos: 30},
						{id: "node11", xPos: 110, yPos: 30},
						{id: "node12", xPos: 120, yPos: 30},
						{id: "node13", xPos: 130, yPos: 30}
					],
					comments: [
						{id: "comment1", xPos: 50, yPos: 50},
						{id: "comment2", xPos: 60, yPos: 60}
					],
					links: [
						{id: "link1", source: "node1", target: "node2"},
						{id: "link2", source: "node2", target: "node3"},
						{id: "link3", source: "node3", target: "node4"},
						{id: "link5", source: "node4", target: "node9"},
						{id: "link4", source: "comment1", target: "node7"},
						{id: "link6", source: "node4", target: "node10"},
						{id: "link7", source: "node4", target: "node11"},
						{id: "link8", source: "node4", target: "node12"},
						{id: "link9", source: "node9", target: "node10"},
						{id: "link10", source: "node12", target: "node11"},
						{id: "link11", source: "node11", target: "node13"},
						{id: "link12", source: "node8", target: "node4"},
						{id: "link13", source: "node1", target: "node5"},
						{id: "link14", source: "node5", target: "node6"},
						{id: "link15", source: "node1", target: "node7"},
						{id: "link16", source: "node7", target: "node4"},
						{id: "link17", source: "node6", target: "node4"}
					]
				 }
				};

		deepFreeze(startCanvas);

		ObjectModel.dispatch({
			type: "SET_CANVAS",
			data: startCanvas
		});

		ObjectModel.dispatch({
			type: "SET_SELECTIONS",
			data: ["comment1"]
		});


		ObjectModel.selectSubGraph("node13");


		let expectedSelections = ["comment1", "node13", "node7", "node4", "node11", "node12"];
		let actualSelections = ObjectModel.getSelectedObjectIds();

		console.log("Expected Selections = " + JSON.stringify(expectedSelections));
		console.log("Actual Selections   = " + JSON.stringify(actualSelections));

		expect(_.isEqual(expectedSelections, actualSelections)).to.be.true;
	});

});
