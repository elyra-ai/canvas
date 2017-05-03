
import {StructureMetadata} from "./StructureInfo";
import {GroupMetadata} from "./GroupInfo";
import {ParameterMetadata} from "./ParameterInfo";
import {UIInfo} from "./UIInfo";
import _ from "underscore";

export class OperaterDef extends UIInfo{
	constructor(name, uiHints, structureMetadata, parameterMetadata, groupMetadata){
		super(undefined, undefined, undefined, uiHints);
		this.name = name;
		this.structureMetadata = structureMetadata;
		this.parameterMetadata = parameterMetadata;
		this.groupMetadata = groupMetadata;
	}
	static makeOperaterDef(operator){
		let structureMetadata = StructureMetadata.makeStructureMetadata(_.propertyOf(operator.metadata)("structures"))
		let parameterMetadata = ParameterMetadata.makeParameterMetadata(_.propertyOf(operator.metadata)("arguments"));
		let groupMetadata = GroupMetadata.makeGroupMetadata(_.propertyOf(operator.metadata)("argumentGroups"))
		return new OperaterDef(
			_.propertyOf(operator)("name"),
			_.propertyOf(operator.metadata)("uiHints"),
			structureMetadata,
			parameterMetadata,
			groupMetadata
		);
	}
}
