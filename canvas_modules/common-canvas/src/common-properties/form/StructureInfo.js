/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

 import {UIInfo} from "./UIInfo"
 import {ParameterDef, ParameterMetadata} from "./ParameterInfo"
 import {EditStyle} from "./form-constants"
 import _ from "underscore";

class StructureDef extends UIInfo{
	constructor(name, keyDefinition, parameterMetadata, uiHints){
		super(undefined, undefined, undefined, uiHints);
		this.name = name;
		this.keyDefinition = keyDefinition;
		this.parameterMetadata = parameterMetadata;
	}

	isEditStyleSubpanel(){
    return (this.editStyle() === EditStyle.SUBPANEL)
  }

	parameterNames(){
		let params = [];
		if (this.parameterMetadata){
			for(let param of this.parameterMetadata.paramDefs){
				params.push(param.name);
			}
		}
		return params;
	}

	isEditStyleInlinel() {
		return (this.editStyle() === EditStyle.INLINE)
	}

	keyAttributeIndex() {
		if (this.keyDefinition) {
			// Assume the key is always in the first column
			return 0;
		}else {
			return -1;
		}
	}

	defaultStructure(addKeyDefinition){
		let defaults = [];
		this.parameterMetadata.paramDefs.forEach(function(param){
			defaults.push(_.propertyOf(param)("defaultValue"));
		})
		if (addKeyDefinition && this.keyDefinition) {
			// Assume the key is always in the first column
			defaults.unshift(_.propertyOf(this.keyDefinition)("defaultValue"));
		}
		return defaults;
	}

	static makeStructure(structureOp){
		let paramDefs;
		if (_.has(structureOp.metadata,"arguments")){
			paramDefs = [];
			for (let param of structureOp.metadata.arguments){
				paramDefs.push(ParameterDef.makeParameterDef(param));
			}
		}
		return new StructureDef(
			_.propertyOf(structureOp)("name"),
			ParameterDef.makeParameterDef(_.propertyOf(structureOp.metadata)("keyDefinition")),
			ParameterMetadata.makeParameterMetadata(paramDefs),
			_.propertyOf(structureOp.metadata)("uiHints")
		)
	}
}

export class StructureMetadata{
	constructor(structures){
		this.structures = structures;
	}

	getStructure(name){
		let structureDef;
		this.structures.forEach(function(structure){
			if (structure.name === name){
				structureDef = structure;
			}
		})
		return structureDef;
	}

	static makeStructureMetadata(structuresOp){
		if (structuresOp){
			let structures = [];
			for (let structure of structuresOp){
				structures.push(StructureDef.makeStructure(structure));
			}
			return new StructureMetadata(structures);
		}
	}
}
