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
import { Button, RadioButton, Icon, Dropdown } from "carbon-components-react";
import { connect } from "react-redux";
import isEqual from "lodash/isEqual";

function *generateCombinations(arr, size) {
	function *doGenerateCombinations(offset, combo) {
		if (combo.length === size) {
			yield combo;
		} else {
			for (let idx = offset; idx < arr.length; idx++) {
				yield* doGenerateCombinations(idx + 1, combo.concat(arr[idx]));
			}
		}
	}
	yield* doGenerateCombinations(0, []);
}

class CustomEffectsCtrl extends React.Component {
	constructor(props) {
		super(props);
		this.LEFT_ARROW = "⬅";
		this.RIGHT_ARROW = "➡";
		// this.LEFT_ARROW = "←";
		// this.RIGHT_ARROW = "→";
		// this.LEFT_ARROW = "↩";
		// this.RIGHT_ARROW = "↪";
		this.state = {
			buildNested: false,
			effectType: "main-effects",
			currentTermString: "",
			arrow: this.RIGHT_ARROW,
			errorMsg: "\xa0"
		};
		this.termState = "field";
		this.SOURCE_LIST_ID = { name: this.props.data[0] };
		this.UI_LIST_ID = { name: this.props.data[1] };
		let fields = [];
		let nestingLevels = [];
		if (Array.isArray(props.controlValue) && props.controlValue.length > 1) {
			fields = props.controlValue[0];
			nestingLevels = props.controlValue[1];
		}
		this.effectStructure = {
			fields: fields,
			nestingLevels: nestingLevels
		};
		this.controller = props.controller;
		this.handleRadioChange = this.handleRadioChange.bind(this);
		this.handleDropdownChange = this.handleDropdownChange.bind(this);
		this.moveSelectedFields = this.moveSelectedFields.bind(this);
		this.copySourceFieldToTerm = this.copySourceFieldToTerm.bind(this);
		this.addByToTerm = this.addByToTerm.bind(this);
		this.addTerm = this.addTerm.bind(this);
		this.removeTerms = this.removeTerms.bind(this);
		this.addWithinToTerm = this.addWithinToTerm.bind(this);
		this.clearTerm = this.clearTerm.bind(this);
	}

	componentDidMount() {
		this.sourceListCtrl = this.makeSourceList();
		this.updateEffectsList();
		this.currentTermValue = this.emptyEffect();
		const that = this;
		this.controller.addRowSelectionListener(this.SOURCE_LIST_ID, function(selections) {
			that.setState({ arrow: that.RIGHT_ARROW });
		});
		this.controller.addRowSelectionListener(this.UI_LIST_ID, function(selections) {
			that.setState({ arrow: that.LEFT_ARROW });
		});
	}

	componentDidUpdate() {
		this.reconcileSourceList();
		this.updateEffectsList();
	}

	componentWillUnmount() {
		this.controller.removeRowSelectionListener(this.SOURCE_LIST_ID);
		this.controller.removeRowSelectionListener(this.UI_LIST_ID);
	}

	setError(message) {
		this.setState({ errorMsg: message });
		const that = this;
		setTimeout(function() {
			that.setState({ errorMsg: "" });
		}, 5000);
	}

	getPropertyValue() {
		if (this.props.arrayIndex > -1) {
			let controlValue = this.controller.getPropertyValue(this.props.propertyId);
			if (!Array.isArray(controlValue)) {
				controlValue = [[[], false, [], [], "VC", 2, false]];
			}
			return controlValue.length > this.props.arrayIndex
				? controlValue[this.props.arrayIndex][0]
				: [];
		}
		return this.controller.getPropertyValue(this.props.propertyId);
	}

	updatePropertyValue(value) {
		if (this.props.arrayIndex > -1) {
			let controlValue = this.controller.getPropertyValue(this.props.propertyId);
			if (!Array.isArray(controlValue)) {
				controlValue = [[[], false, [], [], "VC", 2, false]];
			}
			controlValue[this.props.arrayIndex][0] = value;
			this.controller.updatePropertyValue(this.props.propertyId, controlValue);
		} else {
			this.controller.updatePropertyValue(this.props.propertyId, value);
		}
	}

	makeSourceList() {
		// const controlValue = [["Alpha"], ["Beta"], ["Gamma"], ["Delta"], ["Epsilon"], ["Zêta"], ["Eta"], ["Thêta"]];
		const table = this.controller.createControl(this.SOURCE_LIST_ID,
			this.props.parameterDefinition, this.props.data[0]);
		return (<div>{table}</div>);
	}

	updateEffectsList() {
		// Update the property value
		const customEffects = this.getPropertyValue();
		if (Array.isArray(customEffects)) {
			const rows = [];
			for (const term of customEffects) {
				rows.push(this.makeTermString(this.deserializeEffect(term)));
			}
			const currentValue = this.controller.getPropertyValue(this.UI_LIST_ID);
			if (!currentValue || !isEqual([...currentValue].sort(), [...rows].sort())) {
				this.controller.updatePropertyValue(this.UI_LIST_ID, rows, true);
			}
		}
	}

	makeEffectsList() {
		const table = this.controller.createControl(this.UI_LIST_ID,
			this.props.parameterDefinition, this.props.data[1]);
		return (<div>{table}</div>);
	}

	reconcileSourceList() {
		let controlValue = this.controller.getPropertyValue(this.SOURCE_LIST_ID);
		if (!controlValue) {
			controlValue = [];
		}
		// Need to use another shared field property id here so we can filter source list items
		const otherPropId = { name: "repeated_ui_measures" };
		const fields = this.controller.getFilteredDatasetMetadata(otherPropId);
		const fieldArray = fields.map((field) => field.name);
		if (!isEqual([...controlValue].sort(), [...fieldArray].sort())) {
			this.controller.updatePropertyValue(this.SOURCE_LIST_ID, fieldArray, true);
		}
	}

	genDropdownOptions(selectedValue) {
		const options = [
			{
				value: "main-effects",
				label: "Main effects"
			},
			{
				value: "2-way",
				label: "All 2-way"
			},
			{
				value: "3-way",
				label: "All 3-way"
			},
			{
				value: "4-way",
				label: "All 4-way"
			},
			{
				value: "5-way",
				label: "All 5-way"
			},
		];
		let selectedOption = options.find(function(option) {
			return option.value === selectedValue;
		});
		selectedOption = typeof selectedOption === "undefined" ? null : selectedOption;
		return {
			options: options,
			selectedOption: selectedOption
		};
	}

	interactionTypeToNumber() {
		switch (this.state.effectType) {
		case "main-effects":
		default:
			return 1;
		case "2-way":
			return 2;
		case "3-way":
			return 3;
		case "4-way":
			return 4;
		case "5-way":
			return 5;
		}
	}

	makeMovePanel() {
		const dropOpts = this.genDropdownOptions(this.state.effectType);
		const dropdownComponent = (<Dropdown
			id="harness-custom-effects-ctrl-dropdown"
			disabled={this.state.buildNested}
			type={"default"}
			items={dropOpts.options}
			onChange={this.handleDropdownChange}
			selectedItem={dropOpts.selectedOption}
			label={"T"}
		/>);
		return (<div>
			<span className="glmm-move-label">Type:</span>
			<br />
			<div className="glmm-move-dropdown">
				{dropdownComponent}
			</div>
			<br />
			<Button
				type="button"
				small
				kind="secondary"
				onClick={this.moveSelectedFields}
				disabled={this.state.buildNested}
			>
				{this.state.arrow}
			</Button>
		</div>);
	}

	buildRadios() {
		const buttons = [];
		const suffix = this.props.arrayIndex > -1 ? "_randomEffectsRadio" : "_fixedEffectsRadio";
		buttons.push(
			<div key={1} className="properties-radioset-panel glmm-radios">
				<RadioButton
					key={1}
					id={String(1 + suffix)}
					disabled={this.props.state === "disabled"}
					labelText={"Build terms"}
					value={"terms"}
					onChange={this.handleRadioChange}
					checked={this.state.buildNested === false}
				/>
			</div>
		);
		buttons.push(
			<div key={2} className="properties-radioset-panel glmm-radios">
				<RadioButton
					key={2}
					id={String(2 + suffix)}
					disabled={this.props.state === "disabled"}
					labelText={"Build nested terms"}
					value={"nested"}
					onChange={this.handleRadioChange}
					checked={this.state.buildNested === true}
				/>
			</div>
		);
		return (<div className="properties-radio-button-group horizontal">
			{buttons}
		</div>);
	}

	emptyEffect() {
		return ({
			fields: [],
			nestingLevels: []
		});
	}

	makeTermString(effect) {
		let termString = "";
		if (effect.fields.length > 0) {
			termString = effect.fields[0];
			for (let idx = 1; idx < effect.fields.length; idx++) {
				const insertionPoint = termString.indexOf(")");
				if (effect.nestingLevels[idx] > effect.nestingLevels[idx - 1]) {
					if (insertionPoint > -1) {
						termString = termString.substring(0, insertionPoint) + "(" +
							effect.fields[idx] + ")" + termString.substring(insertionPoint);
					} else {
						termString = termString + "(" + effect.fields[idx] + ")";
					}
				} else if (insertionPoint > -1) {
					termString = termString.substring(0, insertionPoint) + "*" +
							effect.fields[idx] + termString.substring(insertionPoint);
				} else {
					termString += "*" + effect.fields[idx];
				}
			}
		}
		return termString;
	}

	isFieldContinuous(fieldName) {
		const fields = this.controller.getDatasetMetadataFields();
		for (const field of fields) {
			if (field.name === fieldName) {
				return field.metadata && field.metadata.measure === "range";
			}
		}
		return false;
	}

	copySourceFieldToTerm() {
		const sourceRows = this.controller.getSelectedRows(this.SOURCE_LIST_ID);
		if (sourceRows.length) {
			const fieldName = this.controller.getPropertyValue(this.SOURCE_LIST_ID)[sourceRows[0]];
			const effect = this.currentTermValue;
			const isNested = effect.nestingLevels.length > 0 &&
				(effect.nestingLevels[effect.nestingLevels.length - 1] > 0 || this.termState === "field-within");
			const continuous = this.isFieldContinuous(fieldName);
			if (isNested && continuous) {
				this.setError("Continuous fields cannot be nested within effects");
				return;
			}
			if (effect.fields.indexOf(fieldName) > -1 && !continuous) {
				this.setError("Each categorical field in the term must be unique");
				return;
			}
			effect.fields.push(fieldName);
			if (effect.nestingLevels.length === 0) {
				effect.nestingLevels.push(0);
			} else {
				const currentLevel = effect.nestingLevels[effect.nestingLevels.length - 1];
				const level = this.termState === "field-within" ? currentLevel + 1 : currentLevel;
				effect.nestingLevels.push(level);
			}
			const termString = this.makeTermString(effect);
			this.setState({ currentTermString: termString });
			this.termState = "term";
		}
	}

	addByToTerm() {
		const effect = this.currentTermValue;
		let termString = this.makeTermString(effect);
		const insertionPoint = termString.indexOf(")");
		if (insertionPoint > -1) {
			termString = termString.substring(0, insertionPoint) + "*" + termString.substring(insertionPoint);
		} else {
			termString += "*";
		}
		this.setState({ currentTermString: termString });
		this.termState = "field";
	}

	addWithinToTerm() {
		const effect = this.currentTermValue;
		let termString = this.makeTermString(effect);
		const insertionPoint = termString.indexOf(")");
		if (insertionPoint > -1) {
			termString = termString.substring(0, insertionPoint) + "()" + termString.substring(insertionPoint);
		} else {
			termString += "()";
		}
		this.setState({ currentTermString: termString });
		this.termState = "field-within";
	}

	clearTerm() {
		this.setState({ currentTermString: "" });
		this.currentTermValue = this.emptyEffect();
		this.termState = "field";
	}

	serializeEffect(effect) {
		const retVal = [];
		retVal.push(effect.fields);
		retVal.push(effect.nestingLevels);
		return retVal;
	}

	deserializeEffect(effectArray) {
		return { fields: effectArray[0], nestingLevels: effectArray[1] };
	}

	effectExists(effect, effectList) {
		const fields0 = [...effect[0]].sort();
		const nests0 = [...effect[1]].sort();
		for (const testEffect of effectList) {
			if (isEqual(fields0, [...testEffect[0]].sort()) &&
					isEqual(nests0, [...testEffect[1]].sort())) {
				return true;
			}
		}
		return false;
	}

	addTerm() {
		if (this.state.currentTermString && this.state.currentTermString.length &&
				this.currentTermValue.fields.length > 0) {
			let controlValue = this.controller.getPropertyValue(this.UI_LIST_ID);
			if (!Array.isArray(controlValue)) {
				controlValue = [];
			}
			let masterValue = this.getPropertyValue();
			if (!Array.isArray(masterValue)) {
				masterValue = [];
			}
			const term = this.serializeEffect(this.currentTermValue);
			if (this.effectExists(term, masterValue)) {
				this.setError("This term is already in the model");
				return;
			}
			controlValue.push(this.state.currentTermString);
			masterValue.push(term);
			this.controller.updatePropertyValue(this.UI_LIST_ID, controlValue);
			this.updatePropertyValue(masterValue);
			this.controller.updateSelectedRows(this.UI_LIST_ID, [masterValue.length - 1]);
			this.focusTargetList();
			this.clearTerm();
		}
	}

	removeTerms() {
		const targetRows = this.controller.getSelectedRows(this.UI_LIST_ID);
		if (targetRows.length > 0) {
			targetRows.sort(function(val1, val2) {
				return val1 - val2;
			});
			const masterValue = this.getPropertyValue();
			const uiValue = this.controller.getPropertyValue(this.UI_LIST_ID);
			for (let idx = targetRows.length - 1; idx >= 0; idx--) {
				masterValue.splice(targetRows[idx], 1);
				uiValue.splice(targetRows[idx], 1);
			}
			this.updatePropertyValue(masterValue);
			this.controller.updatePropertyValue(this.UI_LIST_ID, uiValue);
			this.controller.updateSelectedRows(this.UI_LIST_ID, []);
		}
	}

	makeButtonPanel() {
		const sourceRows = this.controller.getSelectedRows(this.SOURCE_LIST_ID);
		const targetRows = this.controller.getSelectedRows(this.UI_LIST_ID);
		const downButton = (<Button
			type="button"
			small
			kind="secondary"
			onClick={this.copySourceFieldToTerm}
			disabled={this.state.buildNested === false || this.termState === "term" || sourceRows.length !== 1}
		>
			{"\u2b07"}
		</Button>);
		const byButton = (<Button
			type="button"
			small
			kind="secondary"
			onClick={this.addByToTerm}
			disabled={this.state.buildNested === false || this.termState.startsWith("field")}
		>
			{"By *"}
		</Button>);
		const withinButton = (<Button
			type="button"
			small
			kind="secondary"
			onClick={this.addWithinToTerm}
			disabled={this.state.buildNested === false || this.termState.startsWith("field")}
		>
			{"(Within)"}
		</Button>);
		const clearButton = (<Button
			type="button"
			small
			kind="secondary"
			onClick={this.clearTerm}
			disabled={this.state.buildNested === false || this.state.currentTermString === ""}
		>
			{"Clear Term"}
		</Button>);
		const addButton = (<Button
			type="button"
			small
			kind="secondary"
			onClick={this.addTerm}
			disabled={this.state.buildNested === false ||
				this.state.currentTermString === "" || this.termState !== "term" }
		>
			{"Add"}
		</Button>);
		const removeButton = (<Button
			type="button"
			small
			kind="secondary"
			onClick={this.removeTerms}
			disabled={this.state.buildNested === false || targetRows.length === 0}
		>
			{"Remove"}
		</Button>);
		return (<div>{downButton}{byButton}{withinButton}{clearButton}{addButton}{removeButton}</div>);
	}

	makeBuildTermControl() {
		let controlValue = this.state.currentTermString;
		if (controlValue === "") {
			controlValue = "\xa0";
		}
		const label = <span disabled={this.state.buildNested === true}>{"Build term:"}</span>;
		const readOnly = (<span className="glmm-term-builder"
			disabled={this.state.buildNested === true}
		>{controlValue}</span>);
		return (<div className="glmm-term-outer-div">{label}<br />
			<div className="glmm-term-div">{readOnly}</div></div>);
	}

	buildPanel() {
		const errorPanel = (<div className="glmm-error-panel"><span>{this.state.errorMsg}</span></div>);
		const radioset = this.buildRadios();
		const sourceList = this.sourceListCtrl;
		const effectsListCtrl = this.makeEffectsList();
		return (<div>
			{radioset}
			<br />
			<table>
				<tbody>
					<tr>
						<td className="glmm-sourcelist-cell">{sourceList}</td>
						<td className="glmm-move-panel-cell">
							<div>{this.makeMovePanel()}</div></td>
						<td className="glmm-effects-list-cell"><div>{effectsListCtrl}</div></td>
					</tr>
					<tr>
						<td colSpan="3" className="glmm-error-panel-cell"><div>{errorPanel}</div></td>
					</tr>
					<tr>
						<td colSpan="3"><div>{this.makeButtonPanel()}</div></td>
					</tr>
					<tr>
						<td colSpan="3"><div>{this.makeBuildTermControl()}</div></td>
					</tr>
				</tbody>
			</table>
		</div>);
	}

	//	<tr>
	//		<td colSpan="3"><div>{this.makeUseInterceptControl()}</div></td>
	//	</tr>

	handleDropdownChange(evt) {
		const value = evt.selectedItem.value;
		this.setState({ effectType: value });
	}

	handleRadioChange(evt) {
		// Change enablement
		this.setState({
			buildNested: evt === "nested"
		});
	}

	moveSelectedFields() {
		if (this.state.arrow === this.RIGHT_ARROW) {
			// Adding effects
			const sourceRows = this.controller.getSelectedRows(this.SOURCE_LIST_ID);
			const sourceFields = this.controller.getPropertyValue(this.SOURCE_LIST_ID);
			const fieldArray = [];
			for (const idx of sourceRows) {
				fieldArray.push(sourceFields[idx]);
			}
			let controlValue = this.controller.getPropertyValue(this.UI_LIST_ID);
			if (!Array.isArray(controlValue)) {
				controlValue = [];
			}
			let masterValue = this.getPropertyValue();
			if (!Array.isArray(masterValue)) {
				masterValue = [];
			}
			const selectedRows = [];
			const interactions = this.interactionTypeToNumber();
			for (const combo of generateCombinations(fieldArray, interactions)) {
				const effect = { fields: combo, nestingLevels: Array(combo.length).fill(0) };
				const term = this.serializeEffect(effect);
				if (!this.effectExists(term, masterValue)) {
					controlValue.push(this.makeTermString(effect));
					masterValue.push(term);
					selectedRows.push(masterValue.length - 1);
				} else if (interactions >= fieldArray.length) {
					this.setError("This term is already in the model");
				}
			}
			this.controller.updatePropertyValue(this.UI_LIST_ID, controlValue);
			this.updatePropertyValue(masterValue);
			// Select the new effects
			this.controller.updateSelectedRows(this.UI_LIST_ID, selectedRows);
			this.focusTargetList();
		} else {
			// Removing effects
			this.removeTerms();
			this.focusSourceList();
		}
	}

	focusSourceList() {
		if (global.document) {
			const id = "properties-" + this.props.data[0];
			const list = global.document.querySelector("div[data-id='" + id + "']");
			if (list) {
				list.focus();
			}
		}
		// This changes the arrow button direction
		const selectedRows = this.controller.getSelectedRows(this.SOURCE_LIST_ID);
		this.controller.updateSelectedRows(this.SOURCE_LIST_ID, selectedRows);
	}

	focusTargetList() {
		if (global.document) {
			const id = "properties-" + this.props.data[1];
			const list = global.document.querySelector("div[data-id='" + id + "']");
			if (list) {
				list.focus();
			}
		}
	}

	render() {
		let messageText;
		let icon;
		if (this.props.messageInfo && this.props.messageInfo.text) {
			messageText = this.props.messageInfo.text;
			if (this.props.messageInfo.type === "warning") {
				icon = (<Icon className="warning" name="warning--glyph" />);
			} else if (this.props.messageInfo.type === "error") {
				icon = (<Icon className="error" name="error--glyph" />);
			}
		}
		let visibility;
		// let disabled = false;
		if (this.props.state === "hidden") {
			visibility = { visibility: "hidden" };
		// } else if (this.props.state === "disabled") {
		//	disabled = true;
		}
		const effectsBuilder = this.buildPanel();
		return (
			<div style={visibility}>
				<div>
					{effectsBuilder}
				</div>
				<div className="harness-custom-control-condition">
					<div className="icon">{icon}</div>
					<div>{messageText}</div>
				</div>
			</div>
		);
	}
}

CustomEffectsCtrl.propTypes = {
	controller: PropTypes.object.isRequired,
	propertyId: PropTypes.object.isRequired,
	arrayIndex: PropTypes.number.isRequired, // set to -1 for fixed effects.
	data: PropTypes.array.isRequired,
	parameterDefinition: PropTypes.object.isRequired, // defines source and target lists
	state: PropTypes.string, // passed in by redux
	controlValue: PropTypes.array, // passed in by redux
	messageInfo: PropTypes.object // passed in by redux
};

const mapStateToProps = (state, ownProps) => ({
	controlValue: ownProps.controller.getPropertyValue(ownProps.propertyId),
	state: ownProps.controller.getControlState(ownProps.propertyId),
	messageInfo: ownProps.controller.getErrorMessage(ownProps.propertyId)
});

export default connect(mapStateToProps, null)(CustomEffectsCtrl);
