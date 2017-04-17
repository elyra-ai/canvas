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

import React from 'react'
import ReactDOM from 'react-dom'
import {FormattedMessage} from 'react-intl'
import PropertiesDialog from './properties-dialog.jsx'
import EditorForm from './editor-controls/editor-form.jsx'

export default class CommonProperties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPropertiesDialog: false
    };
    this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
  }

  applyPropertiesEditing() {
    var settings = this.refs.editorForm.getControlValues();

    // May need to close the dialog inside the callback in
    // case of validation errors
    this.props.propertiesInfo.closePropertiesDialog();

    this.props.propertiesInfo.applyPropertyChanges(settings, this.props.propertiesInfo.appData);
  }

  render() {
    var propertiesDialog = [];
    if (this.props.showPropertiesDialog) {
      let form = <EditorForm ref="editorForm" key={Date()}
                  form={this.props.propertiesInfo.formData}
                  additionalComponents={this.props.propertiesInfo.additionalComponents}/>;
      let title = this.props.propertiesInfo.title;
      let size = this.props.propertiesInfo.formData.editorSize;
      propertiesDialog = <PropertiesDialog
            onHide={this.props.propertiesInfo.closePropertiesDialog}
            title={title}
            bsSize={size}
            okHandler={this.applyPropertiesEditing}
            cancelHandler={this.props.propertiesInfo.closePropertiesDialog}>{form}</PropertiesDialog>;
    }

    return (
      <div>
        {propertiesDialog}
      </div>
    );
  }
}


CommonProperties.propTypes = {
	showPropertiesDialog: React.PropTypes.bool.isRequired,
	propertiesInfo: React.PropTypes.object.isRequired
};
