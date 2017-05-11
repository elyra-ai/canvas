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
import {Button, ButtonInput, ButtonToolbar, Form, Tab, Panel, Grid, Row, Col, Nav, NavItem} from 'react-bootstrap'

import {Tabs} from 'ap-components-react/dist/ap-components-react'

/*
import {
  Breadcrumb,
  Button,
  Checkbox,
  Code,
  Dropdown,
  Hyperlink,
  Icon,
  RadioGroup,
  ResponsiveTable,
  Slider,
  TextField,
  ToggleButton
} from 'ap-components-react/dist/ap-components-react'
*/

import { CONDITION_ERROR_MESSAGE } from '../constants/constants.js'
import ControlItem from './control-item.jsx'
import TextfieldControl from './textfield-control.jsx'
import TextareaControl from './textarea-control.jsx'
import ExpressionControl from './expression-control.jsx'
import PasswordControl from './password-control.jsx'
import NumberfieldControl from './numberfield-control.jsx'
import CheckboxControl from './checkbox-control.jsx'
import CheckboxsetControl from './checkboxset-control.jsx'
import RadiosetControl from './radioset-control.jsx'
import OneofselectControl from './oneofselect-control.jsx'
import SomeofselectControl from './someofselect-control.jsx'
import OneofcolumnsControl from './oneofcolumns-control.jsx'
import SomeofcolumnsControl from './someofcolumns-control.jsx'
import ColumnAllocatorControl from './column-allocator-control.jsx'
import ColumnStructureAllocatorControl from './column-structure-allocator-control.jsx'
import StructureeditorControl from './structureeditor-control.jsx'
import StructurelisteditorControl from './structure-list-editor-control.jsx'
import ColumnAllocationPanel from './../editor-panels/column-allocation-panel.jsx'
import SelectorPanel from './../editor-panels/selector-panel.jsx'
import SubPanelButton from './../editor-panels/sub-panel-button.jsx'
import UiConditions from '../ui-conditions/ui-conditions.js'
import UiConditionsParser from '../ui-conditions/ui-conditions-parser.js'

export default class EditorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      validateErrorMessage: [],
      visibleDefinition: [],
      enabledDefinitions: [],
      validationDefinitions: [],
      validationGroupDefinitions:[],
      // controlValidations: {},
      controlStates: {}
    };
    this.valuesTable = props.form.data.currentProperties;

    this.getControlValue = this.getControlValue.bind(this);
    this.updateControlValues = this.updateControlValues.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.parseUiConditions = this.parseUiConditions.bind(this);

    this.getControlValues = this.getControlValues.bind(this);
    this.getControl = this.getControl.bind(this);
    this.genPanel = this.genPanel.bind(this);
    this.genUIContent = this.genUIContent.bind(this);
    this.genUIItem = this.genUIItem.bind(this);
  }

  componentDidMount() {
    if(this.props.uiConditions){
      this.parseUiConditions();
    }
  }

  static tabId(component, id, hash) {
    if (hash) {
      return "#tab-" + component + "-" + id;
    }
    else {
      return "tab-" + component + "-" + id;
    }
  }

  getControlValue(controlId) {
    return this.valuesTable[controlId];
  }

  updateControlValues() {
    for (var ref in this.refs) {
      // Slightly hacky way of identifying non-control references with
      // 3 underscores...
      if (!(ref.startsWith('___'))) {
        this.valuesTable[ref] = this.refs[ref].getControlValue();
      }
    }
  }

  getControlValues() {
    var values = {}
    for (var ref in this.refs) {
      // Slightly hacky way of identifying non-control references with
      // 3 underscores...
      if (!(ref.startsWith('___'))) {
        //console.log(this.refs[ref]);
        //console.log(this.refs[ref].getControlValue());
        values[ref] = this.refs[ref].getControlValue();
      }
    }
    // console.log(values);
    return values;
  }

  getControl(propertyName) {
    return this.refs[propertyName];
  }

  genControl(control, idPrefix, controlValueAccessor, inputDataModel) {
    let controlId = idPrefix + control.name;

    // List of available controls is defined in models/editor/Control.scala
    if (control.controlType == "textfield") {
      return <TextfieldControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
				/>;
    }
    else if (control.controlType == "textarea") {
      return <TextareaControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
				/>;
    }
    else if (control.controlType == "expression") {
      return <ExpressionControl control={control}
				key={controlId}
				ref={controlId}
				valueAccessor={controlValueAccessor}
				validationDefinitions={this.state.validationDefinitions}
				controlStates={this.state.controlStates}
				/>;
    }
    else if (control.controlType == "passwordfield") {
      return <PasswordControl control={control} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "numberfield") {
      return <NumberfieldControl control={control} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "checkbox") {
      return <CheckboxControl control={control} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "checkboxset") {
      return <CheckboxsetControl control={control} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "radioset") {
      return <RadiosetControl control={control} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "oneofselect") {
      return <OneofselectControl control={control} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "someofselect") {
      return <SomeofselectControl control={control} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "oneofcolumns") {
      return <OneofcolumnsControl control={control} dataModel={inputDataModel} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "someofcolumns") {
      return <SomeofcolumnsControl control={control} dataModel={inputDataModel} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "allocatedcolumn") {
      // console.log("allocatedcolumn");
      return <ColumnAllocatorControl control={control} dataModel={inputDataModel} multiColumn={false} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "allocatedcolumns") {
      // console.log("allocatedcolumns");
      return <ColumnAllocatorControl control={control} dataModel={inputDataModel} multiColumn={true} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}/>;
    }
    else if (control.controlType == "allocatedstructures") {
      // console.log("allocatedstructures");
      return <ColumnStructureAllocatorControl control={control} dataModel={inputDataModel} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}
        buildUIItem={this.genUIItem}/>;
    }
    else if (control.controlType == "structureeditor") {
      // console.log("structureeditor");
      return <StructureeditorControl control={control} dataModel={inputDataModel} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}
        buildUIItem={this.genUIItem}/>;
    }
    else if (control.controlType == "structurelisteditor") {
      // console.log("structurelisteditor");
      return <StructurelisteditorControl control={control} dataModel={inputDataModel} key={controlId} ref={controlId} valueAccessor={controlValueAccessor}
        buildUIItem={this.genUIItem}/>;
    }
    else {
      return <h6 key={controlId}>{controlId}</h6>;
    }
  }

  genControlItem(key, control, idPrefix, controlValueAccessor, inputDataModel) {
    //console.log("genControlItem");

    var stateStyle = {};
    if(this.state.controlStates[control.name] === "hidden"){
      stateStyle["visibility"] = "hidden";
    }

    var label = <span></span>;
    if (control.label && control.separateLabel) {
      label = <label className="control-label" style={stateStyle} >{control.label.text}</label>;
    }
    var control = this.genControl(control, idPrefix, controlValueAccessor, inputDataModel);
    var controlItem = <ControlItem key={key} label={label} control={control}/>;
    //console.log(controlItem);
    return controlItem;
  }

  genPrimaryTabs(key, tabs, idPrefix, controlValueAccessor, inputDataModel) {
    //console.log("genPrimaryTabs");
    //console.log(tabs);
    let tabContent = [];
    for (var i=0;i < tabs.length;i++) {
      let tab = tabs[i];
      let panelItems = this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, inputDataModel);
      let additionalComponent = null;
      if (this.props.additionalComponents != null) {
        additionalComponent = this.props.additionalComponents[tab.group];
        //console.log("TabGroup=" + tab.group);
        //console.log(additionalComponent);
      }
      tabContent.push(<Tabs.Panel id={'primary-tab.' + tab.group} key={i} title={tab.text}>{panelItems}{additionalComponent}</Tabs.Panel>);
    }

    return (<Tabs key={key} defaultActiveKey={0} animation={false}>{tabContent}</Tabs>);
  }

  genSubTabs(key, tabs, idPrefix, controlValueAccessor, inputDataModel) {
    //console.log("genSubTabs");
    let subTabs = [];
    for (let i=0;i < tabs.length;i++) {
      let tab = tabs[i];
      subTabs.push(<Tabs.Panel key={i} id={'sub-tab.' + tab.group} title={tab.text}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, inputDataModel)}</Tabs.Panel>);
    }

    return (
      <Tabs vertical animation={false}>
        {subTabs}
      </Tabs>);
  }

  genPanelSelector(key, tabs, idPrefix, controlValueAccessor, inputDataModel, dependsOn) {
    //console.log("genPanelSelector: dependsOn=" + dependsOn);
    let subPanels = {};
    for (let i=0;i < tabs.length;i++) {
      let tab = tabs[i];
      //console.log("Sub-panel: group=" + tab.group + ", title=" + tab.text);
      subPanels[tab.group] = <div className="control-panel" key={tab.group}>{this.genUIItem(i, tab.content, idPrefix, controlValueAccessor, inputDataModel)}</div>;
    }

    return (
      <SelectorPanel id={'selector-panel.' + dependsOn} key={key} controlAccessor={this.getControl} panels={subPanels} dependsOn={dependsOn}>
      </SelectorPanel>
    );
  }

  genUIContent(uiItems, idPrefix, controlValueAccessor, inputDataModel) {
    //console.log("genUIContent");
    var uiContent = [];
    for (var i=0;i < uiItems.length;i++) {
      var uiItem = uiItems[i];
      //console.log(uiItem);
      uiContent.push(this.genUIItem(i, uiItem, idPrefix, controlValueAccessor, inputDataModel));
    }
    return uiContent;
  }

  genUIItem(key, uiItem, idPrefix, controlValueAccessor, inputDataModel) {
    //console.log("genUIItem");
    //console.log(uiItem);

    if (uiItem.itemType == "control") {
      return this.genControlItem(key, uiItem.control, idPrefix, controlValueAccessor, inputDataModel);
    }
    else if (uiItem.itemType == "additionalLink") {
      //console.log ("Additional link");
      //console.log(uiItem);
      var subPanel = this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, inputDataModel);
      return <SubPanelButton id={'sub-panel-button.' + key} label={uiItem.text} title={uiItem.secondaryText} panel={subPanel}/>;
    }
    else if (uiItem.itemType == "staticText") {
      return <div id={'static-text.' + key}>{uiItem.text}</div>;
    }
    else if (uiItem.itemType == "hSeparator") {
      return <hr id={'h-separator.' + key}/>;
    }
    else if (uiItem.itemType == "panel") {
      return this.genPanel(key, uiItem.panel, idPrefix, controlValueAccessor, inputDataModel);
    }
    else if (uiItem.itemType == "subTabs") {
      return this.genSubTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, inputDataModel);
    }
    else if (uiItem.itemType == "primaryTabs") {
      return this.genPrimaryTabs(key, uiItem.tabs, idPrefix, controlValueAccessor, inputDataModel);
    }
    else if (uiItem.itemType == "panelSelector") {
      return this.genPanelSelector(key, uiItem.tabs, idPrefix, controlValueAccessor, inputDataModel, uiItem.dependsOn);
    }
    else {
      return <div>Unknown: {uiItem.itemType}</div>;
    }
  }

  genPanel(key, panel, idPrefix, controlValueAccessor, inputDataModel) {
    //console.log("genPanel");
    //console.log(panel);
    let content = this.genUIContent(panel.uiItems, idPrefix, controlValueAccessor, inputDataModel);
    let id = "panel." + key;
    var uiObject;
    if (panel.panelType == "columnAllocation") {
      uiObject = <ColumnAllocationPanel id={id} key={key} panel={panel} dataModel={inputDataModel} controlAccessor={this.getControl}>
            {content}
          </ColumnAllocationPanel>;
    }
    else {
      uiObject = <div id={id} className="control-panel" key={key}>
            {content}
          </div>;
    }

    return uiObject;
  }

  handleSubmit(buttonId) {
    //console.log(buttonId);
    this.props.submitMethod(buttonId, this.refs.form);
  }

  handleMouseLeave(event) {
    // visibleDefinition
    if(this.state.visibleDefinition.length > 0) {
      console.log("validate visible definitions");
      var controlValues = this.getControlValues();

      // convert the controlValues object structure to what UiConditions take
      var userInput = {};
      for(var key in controlValues) {
        userInput[key] = controlValues[key][0];
      }

      for(let i = 0; i < this.state.visibleDefinition.length; i++) {
        var definition = this.state.visibleDefinition[i];
        try {
          var output = UiConditions.validateInput(definition, userInput);

          var tmp = this.state.controlStates;
          if(output === true){ // control should be visible
            for(let i = 0; i <  definition.visible.paramNames.length; i++) {
              delete tmp[definition.visible.paramNames[i]];
            }
            this.setState({
              controlStates : tmp
            });
          } else { // control should be hidden
            for(let i = 0; i <  definition.visible.paramNames.length; i++) {
              tmp[definition.visible.paramNames[i]] = "hidden";
            }
            this.setState({
              controlStates : tmp
            });
          }
        } catch(error) {
          console.log("Error thrown in validation: " + error);
        }
      }
      console.log("visible: " + JSON.stringify(this.state.controlStates));
    }

    // enabledDefinitions
    if(this.state.enabledDefinitions.length > 0) {
      console.log("validate enabled definitions");
      var controlValues = this.getControlValues();

      // convert the controlValues object structure to what UiConditions take
      var userInput = {};
      for(var key in controlValues) {
        userInput[key] = controlValues[key][0];
      }

      for(let i = 0; i < this.state.enabledDefinitions.length; i++) {
        var definition = this.state.enabledDefinitions[i];
        try {
          var output = UiConditions.validateInput(definition, userInput);

          var tmp = this.state.controlStates;
          if(output === true){ // control should be enabled
            for(let i = 0; i <  definition.enabled.paramNames.length; i++) {
              if(tmp[definition.enabled.paramNames[i]] !== "hidden") {
                delete tmp[definition.enabled.paramNames[i]];
              }
            }
            this.setState({
              controlStates : tmp
            });
          } else { // control should be disabled
            for(let i = 0; i <  definition.enabled.paramNames.length; i++) {
              if(tmp[definition.enabled.paramNames[i]] !== "hidden") { // if control is hidden, no need to disable it
                tmp[definition.enabled.paramNames[i]] = "disabled";
              }
            }
            this.setState({
              controlStates : tmp
            });
          }
        } catch(error) {
          console.log("Error thrown in validation: " + error);
        }
      }
      console.log("enable: " + JSON.stringify(this.state.controlStates));
    }

    // validationGroupDefinitions
    if(this.state.validationGroupDefinitions.length > 0) {
      console.log("validate group definitions");
      var validateErrorMessage = [];
      var controlValues = this.getControlValues();

      // convert the controlValues object structure to what UiConditions take
      var userInput = {};
      for(var key in controlValues) {
        userInput[key] = controlValues[key][0];
      }

      for(let i = 0; i < this.state.validationGroupDefinitions.length; i++) {
        var definition = this.state.validationGroupDefinitions[i];
        try {
          var output = UiConditions.validateInput(definition, userInput);

          // var tmp = this.state.controlValidations;
          if(output === true){
            // tmp["group_validations_"+i] = true;
            // this.setState({
            //   controlValidations : tmp
            // });
          } else {
            // tmp["group_validations_"+i] = false;
            validateErrorMessage[i]= output;
            // this.setState({
            //   controlValidations : tmp
            // });
          }
        } catch(error) {
          console.log("Error thrown in validation: " + error);
        }
      }
      this.setState({
        validateErrorMessage: validateErrorMessage
      });
    }
  }

  parseUiConditions() {
    var uiConditions = this.props.uiConditions;
    var visibleDefinition = [];
    var enabledDefinitions = [];
    var validationDefinitions = [];
    var validationGroupDefinitions = [];

    for(let i = 0; i < uiConditions.length; i++){
      if(uiConditions[i]["visible"]){
        visibleDefinition.push(uiConditions[i]);
      } else if(uiConditions[i]["enabled"]) {
        enabledDefinitions.push(uiConditions[i]);
      } else if(uiConditions[i]["validation"]) {
        try {
          var controls = UiConditionsParser.parseInput(uiConditions[i]["validation"]);
          if(controls === "multi") {
            validationGroupDefinitions.push(uiConditions[i]);
          } else { // single control
            validationDefinitions[controls] = uiConditions[i];
          }
        } catch (error) { // invalid
          console.log("Error parsing ui conditions: " + error);
        }
      } else { // invalid
        console.log("Invalid definition: " + JSON.stringify(uiConditions[i]));
      }
    }

    this.setState({
      visibleDefinition: visibleDefinition,
      enabledDefinitions: enabledDefinitions,
      validationDefinitions: validationDefinitions,
      validationGroupDefinitions, validationGroupDefinitions
    });
  }

  render() {
    var content = this.genUIContent(this.props.form.uiItems,
        "", this.getControlValue,
        this.props.form.data.inputDataModel);

    var formButtons = [];

    /*
    // Ignore the server-supplied buttons for now.
    for (var i=0;i < this.props.form.buttons.length;i++) {
      var button = this.props.form.buttons[i];
      var style = "default";
      if (button.isPrimary) {
        style = "primary";
      }

      var buttonInput = <Button key={"form-button-" + button.id} onClick={this.handleSubmit.bind(null, button.id)} bsStyle={style}>{button.text}</Button>
      formButtons.push(buttonInput);
    }
    */
    var errorMessage = <div
      className="validation-error-message group-validation-error-message"
      style={{ height: CONDITION_ERROR_MESSAGE.HIDDEN }}></div>
    if (this.state.validateErrorMessage.length > 0) {
      var errorMessages = this.state.validateErrorMessage.map(function(message, ind) {
        return <p key={ind}>{message}</p>;
      });
      errorMessage = (<div
        className="validation-error-message group-validation-error-message"
        style={{ height: CONDITION_ERROR_MESSAGE.VISIBLE }}>
        <div id="editor-form-validation" className="form__validation" style={{ "display": "block" }}>
          <span className="form__validation--invalid">{errorMessages}</span>
        </div>
      </div>);
    }

    return (
      <div className="well">
        <form id={"form-" + this.props.form.componentId} className="form-horizontal"
          onMouseLeave={this.handleMouseLeave}>
          <div className="section--light">
          {content}
          </div>
          <div>
            <ButtonToolbar>{formButtons}</ButtonToolbar>
          </div>
          {errorMessage}
        </form>
      </div>
    );
  }
}


EditorForm.propTypes = {
  form: React.PropTypes.object,
  additionalComponents: React.PropTypes.object,
  uiConditions: React.PropTypes.array
};
