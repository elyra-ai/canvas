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
import {TextField} from 'ap-components-react/dist/ap-components-react'
import EditorControl from './editor-control.jsx'

export default class NumberfieldControl extends EditorControl {
  constructor(props) {
    super(props);
    this.state = {
      controlValue: props.valueAccessor(props.control.name)[0]
    };
    this.getControlValue = this.getControlValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    this.setState({
      controlValue: evt.target.value
    });
  }

  getControlValue() {
    return [this.state.controlValue];
  }

  render() {
		let disablePlaceHolder = true;
		//only enable if additionText is available
		if (this.props.control.additionalText){
			disablePlaceHolder=false;
		}
    return(
      <TextField
        type="number"
        id={this.getControlID()}
        placeholder={this.props.control.additionalText}
				disabledPlaceholderAnimation={disablePlaceHolder}
        onChange={this.handleChange}
        value={this.state.controlValue}
				numberInput="close"
				onChange={e => this.setState({ controlValue: e.target.value })}
  			onReset={() => this.setState({ controlValue: "0" })}
        />
    );
  }
}


NumberfieldControl.propTypes = {
  control: React.PropTypes.object
};
