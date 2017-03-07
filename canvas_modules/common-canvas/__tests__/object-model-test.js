
import {expect, assert} from 'chai';
import _ from 'underscore';
import deepFreeze from 'deep-freeze';
import ObjectModel from '../src/object-model/object-model.js';

describe('ObjectModel handle model OK', () => {

    it('should create a stream', () => {
      console.log("should create a stream");

      let expectedStream =
           {zoom: 100,
            diagram:
              {name:"my diagram",
               nodes: [{id: "node1", name: "Node 1"},
                       {id: "node2", name: "Node 2"}]
              }
           };

     deepFreeze(expectedStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: expectedStream
      });

      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });


    it('should clear a stream', () => {
      console.log("should clear a stream");

      let startStream =
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

      deepFreeze(startStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: startStream
      });

      ObjectModel.dispatch({type: "CLEAR_STREAM"});

      let expectedStream = null;
      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });


    it('should move a node', () => {
      console.log("should move a node");

      let startStream =
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

      deepFreeze(startStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: startStream
      });

      ObjectModel.dispatch({
        type: "MOVE_OBJECTS",
        data: {nodes: ["node1", "node3", "comment2"],
               offsetX: 5,
               offsetY: 7}
      });

      let expectedStream =
          {diagram:
            {nodes: [
               {id: "node1", xPos: 15, yPos: 17},
               {id: "node2", xPos: 20, yPos: 20},
               {id: "node3", xPos: 35, yPos: 37}
              ],
             comments: [
               {id: "comment1", xPos: 50, yPos: 50},
               {id: "comment2", xPos: 65, yPos: 67}
             ],
             links: []
            }
          };

      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });

    it('should delete a node', () => {
      console.log("should delete a node");

      let startStream =
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

      deepFreeze(startStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: startStream
      });

      ObjectModel.dispatch({
        type: "DELETE_OBJECTS",
        data: {selectedObjectIds: ["node1", "node3", "comment1"]}
      });

      let expectedStream =
          {zoom: 100,
           diagram:
            {nodes: [
              {id: "node2", xPos: 20, yPos: 20}
            ],
            comments: [
              {id: "comment2", xPos: 60, yPos: 60}
            ],
            links: []
        }};

      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });

    it('should add a comment', () => {
      console.log("should add a comment");


      let startStream =
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

      deepFreeze(startStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: startStream
      });

      ObjectModel.dispatch({
        type: "ADD_COMMENT",
        data: {id: "comment3", mousePos: {x: 200, y: 300}, selectedObjectIds: []}
      });

      let expectedStream =
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


      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });


    it('should add a link', () => {
      console.log("should add a link");

      let startStream =
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

      deepFreeze(startStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: startStream
      });

      ObjectModel.dispatch({
        type: "ADD_LINK",
        data: {id: "link3", linkType: "data", srcNodeId: "node2", trgNodeId: "node3"}
      });

      ObjectModel.dispatch({
        type: "ADD_LINK",
        data: {id: "link4", linkType: "comment", srcNodeId: "comment1", trgNodeId: "node2"}
      });


      let expectedStream =
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

      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });

    it('should delete a link', () => {
      console.log("should delete a link");

      let startStream =
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

      deepFreeze(startStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: startStream
      });

      ObjectModel.dispatch({
        type: "DELETE_LINK",
        data: {id: "link1"}
      });

      let expectedStream =
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

      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });

    it('should delete a link when a node is deleted', () => {
      console.log("should delete a link when a node is deleted.");

      let startStream =
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

      deepFreeze(startStream);

      ObjectModel.dispatch({
        type: "SET_STREAM",
        data: startStream
      });

      ObjectModel.dispatch({
        type: "DELETE_OBJECTS",
        data: {selectedObjectIds: ["node1"]}
      });

      let expectedStream =
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

      let actualStream = ObjectModel.getStream();

      console.log("Expected Stream = " + JSON.stringify(expectedStream));
      console.log("Actual Stream   = " + JSON.stringify(actualStream));

      expect(_.isEqual(expectedStream, actualStream)).to.be.true;
    });



});
