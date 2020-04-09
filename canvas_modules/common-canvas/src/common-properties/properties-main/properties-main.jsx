/*
 * Copyright 2017-2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import PropertiesModal from "./../components/properties-modal";
import PropertiesEditor from "./../components/properties-editor";
import PropertiesButtons from "./../components/properties-buttons";
import EditorForm from "./../components/editor-form";
import Form from "./../form/Form";
import CommonPropertiesAction from "./../../command-actions/commonPropertiesAction";
import PropertiesController from "./../properties-controller";
import PropertyUtils from "./../util/property-utils";
import { MESSAGE_KEYS, CONDITION_RETURN_VALUE_HANDLING, CARBON_ICONS } from "./../constants/constants";
import { Size } from "./../constants/form-constants";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import pick from "lodash/pick";
import has from "lodash/has";
import Icon from "./../../icons/icon.jsx";
import { Button } from "carbon-components-react";
import { Provider } from "react-redux";
import logger from "../../../utils/logger";

import TitleEditor from "./../components/title-editor";
import classNames from "classnames";
import cloneDeep from "lodash/cloneDeep";

import { injectIntl } from "react-intl";
import styles from "./properties-main-widths.scss";

const FLYOUT_WIDTH_SMALL = parseInt(styles.flyoutWidthSmall, 10);
const FLYOUT_WIDTH_MEDIUM = parseInt(styles.flyoutWidthMedium, 10);
const FLYOUT_WIDTH_LARGE = parseInt(styles.flyoutWidthLarge, 10);

class PropertiesMain extends React.Component {
	constructor(props) {
		super(props);
		this.propertiesController = new PropertiesController();
		this.propertiesController.setCustomControls(props.customControls);
		this.propertiesController.setConditionOps(props.customConditionOps);
		this.propertiesController.setAppData(props.propertiesInfo.appData);
		this.propertiesController.setExpressionInfo(props.propertiesInfo.expressionInfo);
		this.propertiesController.setHandlers({
			controllerHandler: props.callbacks.controllerHandler,
			propertyListener: props.callbacks.propertyListener,
			actionHandler: props.callbacks.actionHandler
		});
		this.setForm(props.propertiesInfo);
		this.previousErrorMessages = {};
		// this has to be after setForm because setForm clears all error messages.
		if (props.propertiesInfo.messages) {
			this.propertiesController.validatePropertiesValues();
			this.previousErrorMessages = this.propertiesController.getErrorMessages();
		}
		this.currentParameters = this.propertiesController.getPropertyValues();
		this.state = {
			showPropertiesButtons: true,
			editorSize: this.propertiesController.getForm().editorSize
		};
		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this._getOverrideSize = this._getOverrideSize.bind(this);
		this._getResizeButton = this._getResizeButton.bind(this);
		this._isResizeButtonRequired = this._isResizeButtonRequired.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}

	componentDidMount() {
		this.props.callbacks.setPropertiesHasMounted();
	}

	UNSAFE_componentWillReceiveProps(newProps) { // eslint-disable-line camelcase, react/sort-comp
		if (newProps.propertiesInfo) {
			if (!isEqual(Object.keys(newProps.propertiesInfo), Object.keys(this.props.propertiesInfo)) ||
				(newProps.propertiesInfo.formData && !isEqual(newProps.propertiesInfo.formData, this.props.propertiesInfo.formData)) ||
				(newProps.propertiesInfo.parameterDef && !isEqual(newProps.propertiesInfo.parameterDef, this.props.propertiesInfo.parameterDef)) ||
				(newProps.propertiesInfo.appData && !isEqual(newProps.propertiesInfo.appData, this.props.propertiesInfo.appData))) {
				this.setForm(newProps.propertiesInfo);
				const newEditorSize = this.propertiesController.getForm().editorSize;
				if (this.state.editorSize !== newEditorSize) {
					this.setState({ editorSize: newEditorSize });
				}
				this.currentParameters = this.propertiesController.getPropertyValues();
				this.propertiesController.setAppData(newProps.propertiesInfo.appData);
				this.propertiesController.setCustomControls(newProps.customControls);
				this.propertiesController.setConditionOps(newProps.customConditionOps);
				this.previousErrorMessages = {};
				if (newProps.propertiesInfo.messages) {
					this.propertiesController.validatePropertiesValues();
					this.previousErrorMessages = this.propertiesController.getErrorMessages();
				}
			}
		}
	}

	onBlur(e) {
		// apply properties when focus leave common properties.
		// subdialogs and summary panel causes focus to leave but shouldn't apply settings
		if (this.props.propertiesConfig.applyOnBlur &&
			this.commonProperties && !this.commonProperties.contains(e.relatedTarget) &&
			!this.propertiesController.isSummaryPanelShowing() && !this.propertiesController.isSubPanelsShowing()) {
			this.applyPropertiesEditing(false);
		}
	}

	setForm(propertiesInfo) {
		let formData = null;

		if (propertiesInfo.formData && Object.keys(propertiesInfo.formData).length !== 0) {
			formData = propertiesInfo.formData;
		} else if (propertiesInfo.parameterDef) {
			formData = Form.makeForm(propertiesInfo.parameterDef, !this.props.propertiesConfig.rightFlyout);
		}
		// TODO: This can be removed once the WML Play service generates datasetMetadata instead of inputDataModel
		if (formData && formData.data && formData.data.inputDataModel && !formData.data.datasetMetadata) {
			formData.data.datasetMetadata = PropertyUtils.convertInputDataModel(formData.data.inputDataModel);
		}

		this.propertiesController.setForm(formData, this.props.intl);
		if (formData) {
			this.originalTitle = formData.label;
			this.propertiesController.setTitle(formData.label);
		}
		// set initial values for undo
		this.initialValueInfo = { additionalInfo: { messages: [] }, undoInfo: {} };
		this.uiParameterKeys = this._getUiOnlyKeys();
		this.initialValueInfo = this._setValueInforProperties(this.initialValueInfo);
		if (propertiesInfo.messages) {
			this.initialValueInfo.additionalInfo.messages = cloneDeep(propertiesInfo.messages);
		}
		this.initialValueInfo.undoInfo.properties = this.propertiesController.getPropertyValues(); // used for undoing when node editor open
		this.initialValueInfo.undoInfo.messages = this.propertiesController.getErrorMessages(); // used for undoing when node editor open
		this.initialValueInfo.additionalInfo.title = this.propertiesController.getTitle();
	}

	_getOverrideSize() {
		const pixelWidth = this.propertiesController.getForm().pixelWidth;
		const editorSizeInForm = this.propertiesController.getForm().editorSize;
		let overrideSize = null;

		if (pixelWidth) {
			if (editorSizeInForm === Size.SMALL) {
				if (this.state.editorSize === Size.SMALL && pixelWidth.min) {
					overrideSize = pixelWidth.min;

				} else if (this.state.editorSize === Size.MEDIUM && pixelWidth.max) {
					overrideSize = pixelWidth.max;
				}

			} else if (editorSizeInForm === Size.MEDIUM) {
				if (this.state.editorSize === Size.MEDIUM && pixelWidth.min) {
					overrideSize = pixelWidth.min;

				} else if (this.state.editorSize === Size.LARGE && pixelWidth.max) {
					overrideSize = pixelWidth.max;
				}

			} else if (editorSizeInForm === Size.LARGE && pixelWidth.max) {
				overrideSize = pixelWidth.max;
			}
		}
		return overrideSize;
	}

	_getResizeButton() {
		let resizeButton = <Icon type={CARBON_ICONS.CHEVRONARROWS.LEFT} className="properties-resize-caret-left" />;
		if (this.propertiesController.getForm().editorSize === Size.SMALL) {
			if (this.state.editorSize === Size.MEDIUM) {
				resizeButton = <Icon type={CARBON_ICONS.CHEVRONARROWS.RIGHT} className="properties-resize-caret-right" />;
			}
		} else if (this.propertiesController.getForm().editorSize === Size.MEDIUM) {
			if (this.state.editorSize === Size.LARGE) {
				resizeButton = <Icon type={CARBON_ICONS.CHEVRONARROWS.RIGHT} className="properties-resize-caret-right" />;
			}
		}
		return resizeButton;
	}

	_isResizeButtonRequired() {
		const pixelWidth = this.propertiesController.getForm().pixelWidth;

		if (this.props.propertiesConfig.enableResize !== false) {
			if (pixelWidth) {
				if (!pixelWidth.min && !pixelWidth.max) {
					logger.warn("Pixel width was provided but no min or max property was found in it.");
					return true;

				} else if (this.propertiesController.getForm().editorSize === Size.SMALL) {
					if (pixelWidth.min && !pixelWidth.max && pixelWidth.min >= FLYOUT_WIDTH_MEDIUM) {
						logger.warn("No resize button shown. Pixel width min size is greater than or equal to default max size: " + FLYOUT_WIDTH_MEDIUM);
						return false;
					} else if (!pixelWidth.min && pixelWidth.max && pixelWidth.max <= FLYOUT_WIDTH_SMALL) {
						logger.warn("No resize button shown. Pixel width max size is less than or equal to default min size: " + FLYOUT_WIDTH_SMALL);
						return false;
					} else if (pixelWidth.min >= pixelWidth.max) {
						logger.warn("No resize button shown. Pixel width min size is greater than or equal to pixel width max size.");
						return false;
					}

				} else if (this.propertiesController.getForm().editorSize === Size.MEDIUM) {
					if (pixelWidth.min && !pixelWidth.max && pixelWidth.min >= FLYOUT_WIDTH_LARGE) {
						logger.warn("No resize button shown. Pixel width min size is greater than or equal to default max size: " + FLYOUT_WIDTH_LARGE);
						return false;
					} else if (!pixelWidth.min && pixelWidth.max && pixelWidth.max <= FLYOUT_WIDTH_MEDIUM) {
						logger.warn("No resize button shown. Pixel width max size is less than or equal to default min size: " + FLYOUT_WIDTH_MEDIUM);
						return false;
					} else if (pixelWidth.min >= pixelWidth.max) {
						logger.warn("No resize button shown. Pixel width min size is greater than or equal to default max size.");
						return false;
					}

				} else if (this.propertiesController.getForm().editorSize === Size.LARGE) {
					if (pixelWidth.min) {
						logger.warn("No resize button shown. Pixel width min size ignored.");
						return false;
					}
					return false;
				}

			} else if (this.propertiesController.getForm().editorSize === Size.LARGE) {
				return false;
			}
			return true;
		}

		return false;
	}

	_setValueInforProperties(valueInfo) {
		const filterHiddenDisabled = this.props.propertiesConfig.conditionReturnValueHandling === CONDITION_RETURN_VALUE_HANDLING.NULL;
		const properties = this.propertiesController.getPropertyValues(filterHiddenDisabled);
		if (this.uiParameterKeys.length > 0) {
			valueInfo.properties = omit(properties, this.uiParameterKeys);
			valueInfo.uiProperties = pick(properties, this.uiParameterKeys);
		} else {
			valueInfo.properties = properties;
		}
		return valueInfo;
	}

	// this will return an array of control names that are ui only controls.
	_getUiOnlyKeys() {
		const uiOnlyKeys = [];
		const controls = this.propertiesController.getControls();
		if (Object.keys(controls).length > 0) {
			for (const controlKey in controls) {
				if (!has(controls, controlKey)) {
					continue;
				}
				const control = controls[controlKey];
				if (control.uionly) {
					uiOnlyKeys.push(controlKey);
				}
			}
		}
		return uiOnlyKeys;
	}

	cancelHandler() {
		if (this.props.callbacks.closePropertiesDialog) {
			this.props.callbacks.closePropertiesDialog();
		}
	}

	applyPropertiesEditing(closeProperties) {
		// validate all the input values.
		this.propertiesController.validatePropertiesValues();
		const newErrorMessages = this.propertiesController.getErrorMessages();

		// only save if title or parameters have changed or new error messages
		if (this.originalTitle !== this.propertiesController.getTitle() ||
				(this.currentParameters && JSON.stringify(this.currentParameters) !==
				JSON.stringify(this.propertiesController.getPropertyValues())) ||
				(JSON.stringify(this.previousErrorMessages) !== JSON.stringify(newErrorMessages))) {

			// set current values
			let valueInfo = { additionalInfo: {}, undoInfo: {} };
			valueInfo = this._setValueInforProperties(valueInfo);
			valueInfo.undoInfo.properties = this.propertiesController.getPropertyValues();
			const errorMessages = this.propertiesController.getErrorMessages(true, true, true);
			if (errorMessages) {
				valueInfo.additionalInfo.messages = errorMessages;
			}
			valueInfo.undoInfo.messages = this.propertiesController.getErrorMessages();
			if (this.propertiesController.getTitle()) {
				valueInfo.additionalInfo.title = this.propertiesController.getTitle();
			}
			const command = new CommonPropertiesAction(valueInfo, this.initialValueInfo,
				this.props.propertiesInfo.appData, this.props.callbacks.applyPropertyChanges);
			this.propertiesController.getCommandStack().do(command);

			// if we don't close the dialog, set the currentParameters to the new parameters
			// so we don't save again unnecessarily when clicking save but no additional changes happened
			this.currentParameters = this.propertiesController.getPropertyValues();
			// reset undo values
			this.initialValueInfo = cloneDeep(valueInfo);
			this.previousErrorMessages = this.propertiesController.getErrorMessages();
		}
		if (closeProperties) {
			this.cancelHandler(); // close property editor
		}
	}

	showPropertiesButtons(state) {
		this.setState({ showPropertiesButtons: state });
	}

	resize() {
		if (this.propertiesController.getForm().editorSize === Size.SMALL) {
			if (this.state.editorSize === Size.SMALL) {
				this.setState({
					editorSize: Size.MEDIUM
				});
			} else {
				this.setState({
					editorSize: Size.SMALL
				});
			}
		} else if (this.propertiesController.getForm().editorSize === Size.MEDIUM) {
			if (this.state.editorSize === Size.MEDIUM) {
				this.setState({
					editorSize: Size.LARGE
				});
			} else {
				this.setState({
					editorSize: Size.MEDIUM
				});
			}
		}
	}

	render() {
		let cancelHandler = this.cancelHandler;
		let applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_APPLYBUTTON_LABEL);
		// when onBlur cancel shouldn't be rendered.  Update apply button text to `Close`
		if (this.props.propertiesConfig.applyOnBlur && this.props.propertiesConfig.rightFlyout) {
			applyLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_CLOSEBUTTON_LABEL);
			cancelHandler = null;
		}
		const rejectLabel = PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_REJECTBUTTON_LABEL);

		const formData = this.propertiesController.getForm();
		if (formData !== null) {
			let propertiesDialog = [];
			let propertiesTitle = <div />;
			let buttonsContainer = <div />;
			let resizeBtn = null;

			if (this.props.propertiesConfig.rightFlyout) {
				propertiesTitle = (<TitleEditor
					labelEditable={formData.labelEditable}
					help={formData.help}
					controller={this.propertiesController}
					helpClickHandler={this.props.callbacks.helpClickHandler}
				/>);
				buttonsContainer = (<PropertiesButtons
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons={this.state.showPropertiesButtons}
				/>);
				if (this._isResizeButtonRequired()) {
					const resizeIcon = this._getResizeButton();
					resizeBtn = (
						<Button kind="ghost" className="properties-btn-resize" onClick={this.resize.bind(this)} >
							{resizeIcon}
						</Button>
					);
				}
			}

			const editorForm = (<EditorForm
				key="editor-form-key"
				controller={this.propertiesController}
				additionalComponents={this.props.propertiesInfo.additionalComponents}
				showPropertiesButtons={this.showPropertiesButtons}
				customPanels={this.props.customPanels}
				rightFlyout={this.props.propertiesConfig.rightFlyout}
			/>);

			if (this.props.propertiesConfig.containerType === "Editing") {
				propertiesDialog = (<PropertiesEditor
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					bsSize={this.state.editorSize}
					title={this.propertiesController.getTitle()}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
				>
					{editorForm}
				</PropertiesEditor>);
			} else if (this.props.propertiesConfig.containerType === "Custom") {
				propertiesDialog = (<div className="properties-custom-container">
					{editorForm}
				</div>);
			} else { // Modal
				propertiesDialog = (<PropertiesModal
					onHide={this.props.callbacks.closePropertiesDialog}
					title={this.propertiesController.getTitle()}
					bsSize={this.state.editorSize}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
				>
					{editorForm}
				</PropertiesModal>);
			}
			const className = classNames("properties-wrapper", { "properties-right-flyout": this.props.propertiesConfig.rightFlyout }, `properties-${this.state.editorSize}`);
			const overrideSize = this._getOverrideSize();
			let overrideStyle = null;
			if (overrideSize !== null) {
				overrideStyle = { width: overrideSize + "px" };
			}
			return (
				<Provider store={this.propertiesController.getStore()}>
					<div
						ref={ (ref) => (this.commonProperties = ref) }
						className={className}
						tabIndex="0"
						onBlur={this.onBlur}
						style={overrideStyle}
					>
						{resizeBtn}
						{propertiesTitle}
						{propertiesDialog}
						{buttonsContainer}
					</div>
				</Provider>
			);
		}
		return <div />;
	}
}

PropertiesMain.propTypes = {
	propertiesInfo: PropTypes.object.isRequired,
	propertiesConfig: PropTypes.shape({
		applyOnBlur: PropTypes.bool,
		rightFlyout: PropTypes.bool,
		containerType: PropTypes.string,
		enableResize: PropTypes.bool,
		conditionReturnValueHandling: PropTypes.string
	}),
	callbacks: PropTypes.shape({
		controllerHandler: PropTypes.func,
		propertyListener: PropTypes.func,
		actionHandler: PropTypes.func,
		closePropertiesDialog: PropTypes.func,
		applyPropertyChanges: PropTypes.func,
		helpClickHandler: PropTypes.func,
		setPropertiesHasMounted: PropTypes.func,
	}),
	customPanels: PropTypes.array, // array of custom panels
	customControls: PropTypes.array, // array of custom controls
	customConditionOps: PropTypes.array, // array of custom condition ops
	intl: PropTypes.object.isRequired
};

export default injectIntl(PropertiesMain, { forwardRef: true });
