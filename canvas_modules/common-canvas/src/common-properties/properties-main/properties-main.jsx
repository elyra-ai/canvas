/*
 * Copyright 2017-2026 Elyra Authors
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
import TearSheet from "../panels/tearsheet";
import MainEditorPropertiesButtons from "./../components/main-editor-properties-buttons";
import EditorForm from "./../components/editor-form";
import Form from "./../form/Form";
import CommonPropertiesAction from "./../../command-actions/commonPropertiesAction";
import PropertiesController from "./../properties-controller";
import * as PropertyUtils from "./../util/property-utils";
import { MESSAGE_KEYS, CONDITION_RETURN_VALUE_HANDLING, APPLY, CANCEL, ACTIONS, CATEGORY_VIEW } from "./../constants/constants";
import { Size } from "./../constants/form-constants";
import { validateParameterDefAgainstSchema } from "../schema-validator/properties-schema-validator.js";
import { has, isEqual, omit, pick, cloneDeep, debounce } from "lodash";
import { Provider } from "react-redux";
import TitleEditor from "./../components/title-editor";
import classNames from "classnames";
import FlyoutContext from "./../../contexts/flyout-context.jsx";

import { injectIntl } from "react-intl";

// Fixed editor widths
const FLYOUT_WIDTH_SMALL = 320;
const FLYOUT_WIDTH_MEDIUM = 480;
const FLYOUT_WIDTH_LARGE = 640;
const FLYOUT_WIDTH_MAX = 900;

class PropertiesMain extends React.Component {
	constructor(props) {
		super(props);
		this.commonProperties = React.createRef();
		this.propertiesController = new PropertiesController();
		this.propertiesController.setPropertiesConfig(this.props.propertiesConfig);
		// Persist editorSize when resize() is not called
		if (this.props.propertiesInfo.initialEditorSize) {
			this.propertiesController.setEditorSize(this.props.propertiesInfo.initialEditorSize);
		}
		if (typeof props.customControls !== "undefined") {
			this.propertiesController.setCustomControls(props.customControls);
		}
		this.propertiesController.setCustomActions(props.customActions);
		this.propertiesController.setConditionOps(props.customConditionOps);
		this.propertiesController.setLight(props.light);
		this.propertiesController.setAppData(props.propertiesInfo.appData);
		this.propertiesController.setExpressionInfo(props.propertiesInfo.expressionInfo);
		this.setCallbacks();
		this.setForm(props.propertiesInfo, false);
		this.previousErrorMessages = {};
		// this has to be after setForm because setForm clears all error messages.
		// Validate all validationDefinitions but show warning messages for "colDoesExists" condition only
		this.propertiesController.validatePropertiesValues(false);
		if (props.propertiesInfo.messages) {
			this.propertiesController.validatePropertiesValues(true);
			this.previousErrorMessages = this.propertiesController.getAllErrorMessages();
		}
		// Callback after all values and messages are set
		if (this.props.callbacks.propertyListener) {
			this.props.callbacks.propertyListener({ action: ACTIONS.PROPERTIES_LOADED });
		}
		this.currentParameters = this.propertiesController.getPropertyValues();
		const editorSize = this.getEditorSize();
		this.state = {
			showPropertiesButtons: true,
			editorSize: editorSize
		};
		this.applyPropertiesEditing = this.applyPropertiesEditing.bind(this);
		this.showPropertiesButtons = this.showPropertiesButtons.bind(this);
		this.cancelHandler = this.cancelHandler.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.detectResize = this.detectResize.bind(this);

		// Rate limit how often the panel rerenders on size change
		this.detectResizeThrottled = debounce(this.detectResize, 500);

		// Track panel height to avoid resize calls whenever height changes
		this.lastPanelHeight = 0;

		// Track if we're using flyout context for width management
		this.usingFlyoutContext = false;
	}

	componentDidMount() {
		this.resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this.detectResizeThrottled(entry.contentRect, entry.target);
			}
		});
		if (this.commonProperties.current) {
			this.resizeObserver.observe(this.commonProperties.current);
		}

		this.initializeFlyoutContext();

		this.props.callbacks.setPropertiesHasMounted();
	}

	UNSAFE_componentWillReceiveProps(newProps) {
		if (this.props.light !== newProps.light) { // set the new light prop in controller
			this.propertiesController.setLight(newProps.light);
		}
		if (newProps.propertiesInfo) {
			if (!isEqual(Object.keys(newProps.propertiesInfo), Object.keys(this.props.propertiesInfo)) ||
				(newProps.propertiesInfo.parameterDef && !isEqual(newProps.propertiesInfo.parameterDef, this.props.propertiesInfo.parameterDef)) ||
				(newProps.propertiesInfo.appData && !isEqual(newProps.propertiesInfo.appData, this.props.propertiesInfo.appData))) {
				const sameParameterDefRendered = newProps.propertiesInfo.id === this.props.propertiesInfo.id;
				this.setForm(newProps.propertiesInfo, sameParameterDefRendered);
				const newEditorSize = this.propertiesController.getForm().editorSize;
				if (this.state.editorSize !== newEditorSize) {
					this.setState({ editorSize: newEditorSize });
				}
				// Reset property values for new parameterDef
				if (newProps.propertiesInfo.id && !sameParameterDefRendered) {
					this.currentParameters = this.propertiesController.getPropertyValues();
				}
				this.propertiesController.setAppData(newProps.propertiesInfo.appData);
				if (typeof newProps.customControls !== "undefined") {
					this.propertiesController.setCustomControls(newProps.customControls);
				}
				this.propertiesController.setCustomActions(newProps.customActions);
				this.propertiesController.setConditionOps(newProps.customConditionOps);
				this.previousErrorMessages = {};
				if (newProps.propertiesInfo.messages) {
					this.propertiesController.validatePropertiesValues();
					this.previousErrorMessages = this.propertiesController.getAllErrorMessages();
				}
			}
		}

		if (newProps.propertiesConfig && !isEqual(newProps.propertiesConfig, this.propertiesController.getPropertiesConfig())) {
			this.propertiesController.setPropertiesConfig(newProps.propertiesConfig);
		}
	}

	componentDidUpdate(prevProps) {
		if (!isEqual(prevProps.callbacks, this.props.callbacks)) {
			this.setCallbacks();
		}
		// Re-check flyout context if it wasn't set initially
		// This handles cases where the context becomes available after initial mount
		if (!this.usingFlyoutContext) {
			this.initializeFlyoutContext();
		}
	}

	componentWillUnmount() {
		this.resizeObserver?.disconnect();
	}

	onBlur(e) {
		// apply properties when focus leave common properties.
		// subdialogs and summary panel causes focus to leave but shouldn't apply settings
		if (this.props.propertiesConfig.applyOnBlur &&
			!this.commonProperties?.current?.contains(e.relatedTarget) &&
			!this.propertiesController.isSummaryPanelShowing() && !this.propertiesController.isSubPanelsShowing()) {
			this.applyPropertiesEditing(false);
		}
	}

	setCallbacks() {
		this.propertiesController.setHandlers({
			controllerHandler: this.props.callbacks.controllerHandler,
			propertyListener: this.props.callbacks.propertyListener,
			actionHandler: this.props.callbacks.actionHandler,
			customHeaderHandler: this.props.callbacks.customHeaderHandler,
			buttonHandler: this.props.callbacks.buttonHandler,
			buttonIconHandler: this.props.callbacks.buttonIconHandler,
			validationHandler: this.props.callbacks.validationHandler,
			titleChangeHandler: this.props.callbacks.titleChangeHandler,
			tooltipLinkHandler: this.props.callbacks.tooltipLinkHandler,
			propertyIconHandler: this.props.callbacks.propertyIconHandler,
			filterItemsHandler: this.props.callbacks.filterItemsHandler,
			panelTitleHandler: this.props.callbacks.panelTitleHandler
		});
	}

	setForm(propertiesInfo, sameParameterDefRendered) {
		let formData = null;

		if (propertiesInfo.parameterDef) {
			if (this.props.propertiesConfig.schemaValidation) {
				validateParameterDefAgainstSchema(propertiesInfo.parameterDef);
			}
			formData = Form.makeForm(propertiesInfo.parameterDef, this.props.propertiesConfig.containerType);
		}

		this.propertiesController.setForm(formData, this.props.intl, sameParameterDefRendered);
		if (formData) {
			this.originalTitle = formData.label;
		}

		// set initial values for undo
		this.initialValueInfo = { additionalInfo: { messages: [] }, undoInfo: {} };
		this.uiParameterKeys = this._getUiOnlyKeys();
		this.initialValueInfo = this._setValueInforProperties(this.initialValueInfo);
		if (propertiesInfo.messages) {
			this.initialValueInfo.additionalInfo.messages = cloneDeep(propertiesInfo.messages);
		}
		this.initialValueInfo.undoInfo.properties = this.propertiesController.getPropertyValues(); // used for undoing when node editor open
		this.initialValueInfo.undoInfo.messages = this.propertiesController.getAllErrorMessages(); // used for undoing when node editor open
		this.initialValueInfo.additionalInfo.title = this.propertiesController.getTitle();
	}

	getApplyButtonLabel() {
		if (this.props.propertiesConfig.buttonLabels && this.props.propertiesConfig.buttonLabels.primary) {
			return this.props.propertiesConfig.buttonLabels.primary;
		}
		return PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_APPLYBUTTON_LABEL);
	}

	getRejectButtonLabel() {
		if (this.props.propertiesConfig.buttonLabels && this.props.propertiesConfig.buttonLabels.secondary) {
			return this.props.propertiesConfig.buttonLabels.secondary;
		}
		return PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIESEDIT_REJECTBUTTON_LABEL);
	}

	getPropertiesActionLabel() {
		if (this.props.callbacks.propertiesActionLabelHandler) {
			const label = this.props.callbacks.propertiesActionLabelHandler();
			if (label) {
				return label;
			}
		}
		return PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_ACTION_LABEL, { node_label: this.propertiesController.getTitle() });
	}

	getEditorSize() {
		// Determine whether to persist initialEditorSize or set the defaultEditorSize in certain cases
		const defaultEditorSize = this.propertiesController.getForm().editorSize;
		const initialEditorSize = this.props.propertiesInfo.initialEditorSize;
		// When defaultEditorSize="small", initialEditorSize can be "small" or "medium". For any other value, return defaultEditorSize.
		// When defaultEditorSize="medium", initialEditorSize can be "medium" or "large". For any other value, return defaultEditorSize.
		// When defaultEditorSize="large", initialEditorSize can be "large" or "max". For any other value, return defaultEditorSize.
		if (defaultEditorSize === Size.SMALL && (initialEditorSize === Size.LARGE || initialEditorSize === Size.MAX)) {
			return defaultEditorSize;
		} else if (defaultEditorSize === Size.MEDIUM && (initialEditorSize === Size.SMALL || initialEditorSize === Size.MAX)) {
			return defaultEditorSize;
		} else if (defaultEditorSize === Size.LARGE && (initialEditorSize === Size.SMALL || initialEditorSize === Size.MEDIUM)) {
			return defaultEditorSize;
		} else if (defaultEditorSize === Size.MAX) {
			return defaultEditorSize;
		}
		return (initialEditorSize ? initialEditorSize : defaultEditorSize);
	}

	// Initializes the flyout context by communicating width constraints and resize preference.
	// Called on mount and when flyout context becomes available.
	initializeFlyoutContext() {
		if (this.context && this.context.setWidthConstraints && !this.usingFlyoutContext) {
			this.usingFlyoutContext = true;
			const minWidth = this._getMinWidthForFlyout();
			const maxWidth = this._getMaxWidthForFlyout();
			const enableResize = this.props.propertiesConfig.enableResize !== false;
			this.context.setWidthConstraints(minWidth, maxWidth, enableResize);
		}
	}

	/**
	 * Calculates the minimum width to communicate to the flyout context.
	 * Uses the editor_size and pixel_width configuration from UI hints.
	 */
	_getMinWidthForFlyout() {
		const pixelWidth = this.propertiesController.getForm().pixelWidth;
		const editorSize = this.propertiesController.getForm().editorSize;

		// If pixel_width.min is specified, use it
		if (pixelWidth && pixelWidth.min) {
			return pixelWidth.min;
		}

		// Otherwise use default widths based on editor_size
		if (editorSize === Size.SMALL) {
			return FLYOUT_WIDTH_SMALL;
		} else if (editorSize === Size.MEDIUM) {
			return FLYOUT_WIDTH_MEDIUM;
		} else if (editorSize === Size.LARGE) {
			return FLYOUT_WIDTH_LARGE;
		}
		return FLYOUT_WIDTH_MAX;
	}

	/**
	 * Calculates the maximum width to communicate to the flyout context.
	 * Uses the editor_size and pixel_width configuration from UI hints.
	 */
	_getMaxWidthForFlyout() {
		const pixelWidth = this.propertiesController.getForm().pixelWidth;
		const editorSize = this.propertiesController.getForm().editorSize;

		// If pixel_width.max is specified, use it
		if (pixelWidth && pixelWidth.max) {
			return pixelWidth.max;
		}

		// Otherwise use default widths based on editor_size
		if (editorSize === Size.SMALL) {
			return FLYOUT_WIDTH_MEDIUM;
		} else if (editorSize === Size.MEDIUM) {
			return FLYOUT_WIDTH_LARGE;
		} else if (editorSize === Size.LARGE) {
			return FLYOUT_WIDTH_MAX;
		}
		// For MAX size, there's no expandable max
		return null;
	}

	// options is an object of config options where
	//   applyProperties: true - this function is called from applyPropertiesEditing
	_setValueInforProperties(valueInfo, options) {
		const applyProperties = options && options.applyProperties === true;
		const filterHiddenDisabled = this.props.propertiesConfig.conditionReturnValueHandling === CONDITION_RETURN_VALUE_HANDLING.NULL;

		const properties = this.propertiesController.getPropertyValues({ filterHiddenDisabled: filterHiddenDisabled, applyProperties: applyProperties,
			valueFilters: this.props.propertiesConfig.returnValueFiltering });
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

	// cancelSource is "apply" if called from applyPropertiesEditing(), else "cancel"
	cancelHandler(cancelSource) {
		if (this.props.callbacks.closePropertiesDialog) {
			this.props.callbacks.closePropertiesDialog(cancelSource);
		}
	}

	applyPropertiesEditing(closeProperties) {
		// validate all the input values.
		this.propertiesController.validatePropertiesValues();
		const newErrorMessages = this.propertiesController.getAllErrorMessages();

		// only save if title or parameters have changed or new error messages
		if (this.originalTitle !== this.propertiesController.getTitle() ||
				(this.currentParameters && JSON.stringify(this.currentParameters) !==
				JSON.stringify(this.propertiesController.getPropertyValues())) ||
				(JSON.stringify(this.previousErrorMessages) !== JSON.stringify(newErrorMessages)) ||
				this.props.propertiesConfig.applyPropertiesWithoutEdit) {

			// set current values
			let valueInfo = { additionalInfo: {}, undoInfo: {} };
			valueInfo = this._setValueInforProperties(valueInfo, { applyProperties: true });
			valueInfo.undoInfo.properties = this.propertiesController.getPropertyValues();
			const errorMessages = this.propertiesController.getErrorMessages(true, true, true, false);
			if (errorMessages) {
				valueInfo.additionalInfo.messages = errorMessages;
			}
			valueInfo.undoInfo.messages = this.propertiesController.getAllErrorMessages();
			if (this.propertiesController.getTitle()) {
				valueInfo.additionalInfo.title = this.propertiesController.getTitle();
			}
			const propertiesActionLabel = this.getPropertiesActionLabel();
			const command = new CommonPropertiesAction(valueInfo, this.initialValueInfo,
				this.props.propertiesInfo.appData, this.props.callbacks.applyPropertyChanges, propertiesActionLabel);
			this.propertiesController.getCommandStack().do(command);

			// if we don't close the dialog, set the currentParameters to the new parameters
			// so we don't save again unnecessarily when clicking save but no additional changes happened
			this.currentParameters = this.propertiesController.getPropertyValues();
			// reset undo values
			this.initialValueInfo = cloneDeep(valueInfo);
			this.previousErrorMessages = this.propertiesController.getAllErrorMessages();
		}
		if (closeProperties) {
			this.cancelHandler(APPLY); // close property editor
		}
	}

	showPropertiesButtons(state) {
		this.setState({ showPropertiesButtons: state });
	}

	detectResize(contentRect, target) {
		if (contentRect.height !== this.lastPanelHeight) {
			this.lastPanelHeight = contentRect.height;
		}
	}

	render() {
		const applyOnBlurEnabled = this.props.propertiesConfig.applyOnBlur && this.props.propertiesConfig.rightFlyout;
		let cancelHandler = this.cancelHandler.bind(this, CANCEL);
		// when onBlur cancel shouldn't be rendered.
		if (applyOnBlurEnabled) {
			cancelHandler = null;
		}
		const applyLabel = this.getApplyButtonLabel();
		const rejectLabel = this.getRejectButtonLabel();
		const propertiesLabel = this.propertiesController.getTitle();

		const formData = this.propertiesController.getForm();
		if (formData !== null) {
			let propertiesDialog = [];
			let propertiesTitle = <div />;
			let buttonsContainer = <div />;
			let hasHeading = false;

			if (this.props.propertiesConfig.rightFlyout) {
				propertiesTitle = (<TitleEditor
					labelEditable={formData.labelEditable}
					help={formData.help}
					description={formData.description}
					controller={this.propertiesController}
					helpClickHandler={this.props.callbacks.helpClickHandler}
					closeHandler={applyOnBlurEnabled ? this.applyPropertiesEditing.bind(this, true) : null}
					icon={formData.icon}
					heading={formData.heading}
					showHeading={this.props.propertiesConfig.heading}
					showHeadingDesc={this.props.propertiesConfig.showHeadingDesc}
					titleInfo={formData.title}
					rightFlyoutTabsView={this.props.propertiesConfig.categoryView === CATEGORY_VIEW.TABS}
				/>);

				hasHeading = this.props.propertiesConfig.heading && (formData.icon || formData.heading);

				buttonsContainer = (<MainEditorPropertiesButtons
					controller={this.propertiesController}
					okHandler={!applyOnBlurEnabled ? this.applyPropertiesEditing.bind(this, true) : null}
					cancelHandler={cancelHandler}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					showPropertiesButtons={this.state.showPropertiesButtons}
					disableSaveOnRequiredErrors={this.props.propertiesConfig.disableSaveOnRequiredErrors}
				/>);
			}

			const editorForm = (<EditorForm
				key="editor-form-key"
				controller={this.propertiesController}
				additionalComponents={this.props.propertiesInfo.additionalComponents}
				showPropertiesButtons={this.showPropertiesButtons}
				customPanels={this.props.customPanels}
				rightFlyout={this.props.propertiesConfig.rightFlyout}
				categoryView={this.props.propertiesConfig.categoryView}
				showAlertsTab={this.props.propertiesConfig.showAlertsTab !== false}
			/>);

			if (this.props.propertiesConfig.containerType === "Editing") {
				propertiesDialog = (<PropertiesEditor
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					bsSize={this.state.editorSize}
					title={propertiesLabel}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
				>
					{editorForm}
				</PropertiesEditor>);

			} else if (this.props.propertiesConfig.containerType === "Custom") {
				propertiesDialog = (
					<div className={classNames("properties-custom-container",
						{
							"properties-custom-container-with-heading": !applyOnBlurEnabled && hasHeading,
							"properties-custom-container-applyOnBlur": applyOnBlurEnabled && !hasHeading,
							"properties-custom-container-applyOnBlur-with-heading": applyOnBlurEnabled && hasHeading
						}
					)}
					>
						{editorForm}
					</div>);

			} else if (this.props.propertiesConfig.containerType === "Tearsheet") {
				propertiesDialog = (<TearSheet
					open
					onCloseCallback={this.props.propertiesConfig.applyOnBlur ? this.applyPropertiesEditing.bind(this, true) : null}
					tearsheet={{
						title: propertiesLabel,
						content: editorForm
					}}
					applyLabel={applyLabel}
					rejectLabel={rejectLabel}
					okHandler={this.applyPropertiesEditing.bind(this, true)}
					cancelHandler={cancelHandler}
					showPropertiesButtons={this.state.showPropertiesButtons}
					applyOnBlur={this.props.propertiesConfig.applyOnBlur}
					controller={this.propertiesController}
					disableSaveOnRequiredErrors={this.props.propertiesConfig.disableSaveOnRequiredErrors}
				/>);

			} else { // Modal
				propertiesDialog = (<PropertiesModal
					onHide={this.props.callbacks.closePropertiesDialog}
					title={propertiesLabel}
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

			const className = classNames("properties-wrapper",
				{
					"properties-right-flyout": this.props.propertiesConfig.rightFlyout,
					"properties-light-enabled": this.props.light,
					"properties-light-disabled": !this.props.light
				}
			);
			return (
				<Provider store={this.propertiesController.getStore()}>
					<div className="properties-right-flyout-container">
						<aside
							aria-label={PropertyUtils.formatMessage(this.props.intl, MESSAGE_KEYS.PROPERTIES_LABEL, { label: propertiesLabel })}
							role="region"
							ref={this.commonProperties}
							className={className}
							onBlur={this.onBlur}
						>
							{propertiesTitle}
							{propertiesDialog}
							{buttonsContainer}
						</aside>
					</div>
				</Provider>
			);
		}
		return <div />;
	}
}

// Enable access to FlyoutContext via this.context
PropertiesMain.contextType = FlyoutContext;

PropertiesMain.propTypes = {
	propertiesInfo: PropTypes.object.isRequired,
	propertiesConfig: PropTypes.shape({
		applyOnBlur: PropTypes.bool,
		disableSaveOnRequiredErrors: PropTypes.bool,
		rightFlyout: PropTypes.bool,
		categoryView: PropTypes.oneOf([CATEGORY_VIEW.ACCORDIONS, CATEGORY_VIEW.TABS]),
		containerType: PropTypes.string,
		enableResize: PropTypes.bool,
		conditionReturnValueHandling: PropTypes.string,
		returnValueFiltering: PropTypes.array,
		heading: PropTypes.bool,
		showHeadingDesc: PropTypes.bool,
		buttonLabels: PropTypes.shape({
			primary: PropTypes.string,
			secondary: PropTypes.string
		}),
		schemaValidation: PropTypes.bool,
		applyPropertiesWithoutEdit: PropTypes.bool,
		conditionHiddenPropertyHandling: PropTypes.oneOf(["null", "undefined", "value"]),
		conditionDisabledPropertyHandling: PropTypes.oneOf(["null", "undefined", "value"]),
		maxLengthForMultiLineControls: PropTypes.number,
		maxLengthForSingleLineControls: PropTypes.number,
		showCharacterCounter: PropTypes.bool,
		convertValueDataTypes: PropTypes.bool,
		showRequiredIndicator: PropTypes.bool,
		showAlertsTab: PropTypes.bool,
		locale: PropTypes.string,
		enableTanstackTable: PropTypes.bool
	}),
	callbacks: PropTypes.shape({
		controllerHandler: PropTypes.func,
		propertyListener: PropTypes.func,
		actionHandler: PropTypes.func,
		closePropertiesDialog: PropTypes.func,
		applyPropertyChanges: PropTypes.func,
		helpClickHandler: PropTypes.func,
		setPropertiesHasMounted: PropTypes.func,
		customHeaderHandler: PropTypes.func,
		buttonHandler: PropTypes.func,
		buttonIconHandler: PropTypes.func,
		validationHandler: PropTypes.func,
		titleChangeHandler: PropTypes.func,
		propertiesActionLabelHandler: PropTypes.func,
		tooltipLinkHandler: PropTypes.func,
		propertyIconHandler: PropTypes.func,
		filterItemsHandler: PropTypes.func,
		panelTitleHandler: PropTypes.func
	}),
	customPanels: PropTypes.array, // array of custom panels
	customControls: PropTypes.array, // array of custom controls
	customActions: PropTypes.array, // array of custom actions
	customConditionOps: PropTypes.array, // array of custom condition ops
	light: PropTypes.bool,
	intl: PropTypes.object.isRequired
};

export default injectIntl(PropertiesMain, { forwardRef: true });
