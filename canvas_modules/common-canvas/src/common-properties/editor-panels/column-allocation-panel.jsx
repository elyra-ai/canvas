/****************************************************************
** IBM Confidential
**
** OCO Source Materials
**
** SPSS Modeler
**
** (c) Copyright IBM Corp. 2016
**
** The source code for this program is not published or otherwise
** divested of its trade secrets, irrespective of what has been
** deposited with the U.S. Copyright Office.
*****************************************************************/

import React from 'react'
import ReactDOM from 'react-dom'
import {FormattedMessage} from 'react-intl'
import {Grid, Row, Col, Panel, Button, ButtonGroup} from 'react-bootstrap'
import ColumnSource from './column-source.jsx'

import MoveLeftIcon from '../../../assets/images/move_left.svg';
import MoveRightIcon from '../../../assets/images/move_right.svg';

var _ = require('underscore');

export default class ColumnAllocationPanel extends React.Component {
  constructor(props) {
    super(props);
    console.log("ColumnAllocationPanel: constructor()");
    console.log(props);
    this.state = {
      allocatedColumns: []
    };
  }

  componentDidMount() {
    this.updateColumnSource();
  }

  updateColumnSource() {
    console.log("updateColumnSource()");
    let allocatedFields = [];

    for (var i=0;i < this.props.children.length; i++) {
      let child = this.props.children[i];

      // Child should be a ControlItem so access the control ref
      let controlName = child.props.control.ref;
      //console.log("Allocator=" + controlName);
      let control = this.props.controlAccessor(controlName);
      //console.log(control);
      let allocated = control.getAllocatedColumns();
      //console.log(allocated);
      allocatedFields = _.union(allocatedFields, allocated);
    }

    //console.log(allocatedFields);
    this.refs.columnSource.setAllocatedColumns(allocatedFields);
    // this.setState({allocatedColumns: allocatedFields});
  }

  allocate(targetControl) {
    //console.log("allocate");
    //console.log(targetControl);

    let control = this.props.controlAccessor(targetControl);
    //console.log(control);

    // Add the columns selected in the column source to the target control.
    let selected = this.refs.columnSource.getSelectedColumns();
    control.addColumns(selected, this.updateColumnSource.bind(this));

    //this.updateColumnSource();
  }

  deallocate(targetControl) {
    //console.log("deallocate");
    //console.log(targetControl);

    let control = this.props.controlAccessor(targetControl);
    //console.log(control);

    // Removed the columns selected target control from the target control
    // so they can be made available in the column source.
    let selected = control.getSelectedColumns();
    control.removeColumns(selected, this.updateColumnSource.bind(this));

    //this.updateColumnSource();
  }

  render() {
    let allocLabel = ">";
    let deallocLabel = "<";

    console.log("ColumnAllocator.render()");

    let controlItems = [];
    for (var i=0;i < this.props.children.length; i++) {
      //console.log("ColumnAllocator:child");
      //console.log(this.props.children[i]);
      let child = this.props.children[i];

      // Child should be a ControlItem so access the control ref
      let controlName = child.props.control.ref;

      controlItems.push(
          <Row key={i}>
            <Col md={1} style={{"marginTop":"18px","top":"50%","transform":"translateY(70%)"}} >
              <img className="field-allocator-button" src={MoveLeftIcon} onClick={this.deallocate.bind(this, controlName)}></img>
              <img className="field-allocator-button" src={MoveRightIcon} onClick={this.allocate.bind(this, controlName)}></img>
            </Col>
            <Col md={3}>
             {child}
            </Col>
          </Row>
        );
      /*
      controlItems.push(
          <div className="column-controls-item">
            <Button bsSize="small" onClick={this.deallocate.bind(this, controlName)}>{deallocLabel}</Button>
            <Button bsSize="small" onClick={this.allocate.bind(this, controlName)}>{allocLabel}</Button>
            {child}
          </div>
        );
      */
    }

    return (
        <Grid>
          <Row className="column-allocation-panel-row">
            <Col
              md={2}
              className="column-allocation-panel-column">
              <ColumnSource
                id={'column-source.' + this.props.panel.id}
                ref="columnSource"
                name={this.props.panel.id}
                dataModel={this.props.dataModel}
                rows={this.props.children.length * 5}/>
            </Col>
            <Col
              md={4}
              className="column-allocation-panel-column">
              <Grid>
                {controlItems}
              </Grid>
            </Col>
          </Row>
        </Grid>

      /*
      <div className="column-allocation-panel">
        <div className="column-source-panel">
          <ColumnSource ref="columnSource" name={this.props.panel.id}
            dataModel={this.props.dataModel}/>
        </div>
        <div className="column-controls-panel" >
          {controlItems}
        </div>
      </div>
      */
    );
  }
}


ColumnAllocationPanel.propTypes = {
  panel: React.PropTypes.object,
  dataModel: React.PropTypes.object,
  controlAccessor: React.PropTypes.func
};
