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

import React from "react";
import PropertiesDialog from "./properties-dialog.jsx";
import PropertiesEditing from "./properties-editing.jsx";
import EditorForm from "./editor-controls/editor-form.jsx";
import Form from "./form/Form";
import _ from "underscore";

export default class CommonProperties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPropertiesDialog: false
		};
		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
	}

	getForm() {
		if (this.props.propertiesInfo.formData) {
			return this.props.propertiesInfo.formData;
		}
		return Form.makeForm(this.props.propertiesInfo.propertyDef);
	}

	applyPropertiesEditing() {
		var settings = this.refs.editorForm.getControlValues();
		// May need to close the dialog inside the callback in
		// case of validation errors
		this.props.propertiesInfo.closePropertiesDialog();
		this.props.propertiesInfo.applyPropertyChanges(settings, this.props.propertiesInfo.appData);
	}


	render() {
		const formData = this.getForm();
		console.log(JSON.stringify(formData));
		if (formData !== null) {
			let propertiesDialog = [];
			if (this.props.showPropertiesDialog) {
				let uiConditions = {};
				if (_.has(this.props.propertiesInfo.propertyDef.uihints, "conditions")) {
					uiConditions = {
						uiConditions: this.props.propertiesInfo.propertyDef.uihints.conditions
					};
				}
				const editorForm = (<EditorForm {...uiConditions}
					ref="editorForm"
					key={Date()}
					form={formData}
					additionalComponents={this.props.propertiesInfo.additionalComponents}
				/>);

				const title = this.props.propertiesInfo.title;
				const size = formData.editorSize;

				if (this.props.useModalDialog) {
					propertiesDialog = (<PropertiesDialog
						onHide={this.props.propertiesInfo.closePropertiesDialog}
						title={title}
						bsSize={size}
						okHandler={this.applyPropertiesEditing}
						cancelHandler={this.props.propertiesInfo.closePropertiesDialog}
					>
						{editorForm}
					</PropertiesDialog>);
				} else {
					propertiesDialog = (<PropertiesEditing
						applyLabel={this.props.applyLabel}
						rejectLabel={this.props.rejectLabel}
						bsSize={size}
						title={title}
						okHandler={this.applyPropertiesEditing}
						cancelHandler={this.props.propertiesInfo.closePropertiesDialog}
					>
						{editorForm}
					</PropertiesEditing>);
				}
			}
			return (
				<div>
					{propertiesDialog}
				</div>
			);
		}
		return <div />;
	}
}

CommonProperties.defaultProps = {
	useModalDialog: true
};

CommonProperties.propTypes = {
	showPropertiesDialog: React.PropTypes.bool.isRequired,
	applyLabel: React.PropTypes.string,
	rejectLabel: React.PropTypes.string,
	useModalDialog: React.PropTypes.bool,
	propertiesInfo: React.PropTypes.object.isRequired
};
