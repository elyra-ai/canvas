
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
							 {id: "node4", className: "canvas-node",style: "", image: "imageName",
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
                 style:"",
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
                {id: "link3", className: "canvas-data-link", style: "", source: "node2", target: "node3"},
                {id: "link4", className: "canvas-comment-link", style: "", source: "comment1", target: "node2"}
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


});
