/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2017
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

// global namespace

let _State = _State || {
  // True when object model support is enabled
  let enabled = false;

  // Diagram data as defined in the Diagram JSON specifiction:
  // https://ibm.ent.box.com/folder/17889516178
  let diagram = {};

  // ... etc.
};


let ObjectModel = ObjectModel || {

  /**
   * Turns canvas object model support on or off.
   *
   * @param enable Boolean: True to turn on automatic object model support
   */
  enableObjectModel: function(enable) {
    _State.enabled = enable;
  },

  /**
   * Sets the diagram document.
   *
   * @param diagram A diagram object as defined here:
   * https://ibm.ent.box.com/folder/17889516178
   */
  setDiagram: function(diagram) {
    _State.diagram = diagram;
  },

  /**
   * Returns the current diagram.
   *
   * @return A diagram object as defined here:
   * https://ibm.ent.box.com/folder/17889516178
   */
  getDiagram: function() {
    return _State.diagram;
  }
};

module.exports = {
  enableObjectModel: ObjectModel.enableObjectModel,
  setDiagram: ObjectModel.setDiagram,
  getDiagram: ObjectModel.getDiagram
};
