/*
 * Copyright 2026 Elyra Authors
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

// Transforms SVG file content to be safe for use under a strict CSP
// style-src policy.  Two transforms are applied:
//
// 1. <style> blocks — CSS class rules are expanded to SVG presentation
//    attributes on the matching elements, then the <style> blocks are removed.
//    Only simple class selectors (.className { prop: val }) are handled;
//    complex selectors are left in place (which may still cause a violation,
//    but the transform degrades gracefully).
//
// 2. style= attributes — each declaration is converted to an SVG presentation
//    attribute.  The legacy Adobe Illustrator property "enable-background" is
//    discarded (it has no visible effect in modern browsers).
//
// Both transforms are done with string/regex operations so no DOM or external
// dependency is required.

/**
 * Transforms SVG text content to eliminate <style> blocks and style= attributes
 * that would violate a CSP style-src directive.
 * @param {string} svgText - The raw SVG file content.
 * @returns {string} Transformed SVG text safe to serve under strict CSP.
 */
export function transformSVG(svgText) {
	let result = svgText;
	result = expandStyleBlocks(result);
	result = convertStyleAttributes(result);
	return result;
}

/**
 * Parses all <style> blocks from the SVG, builds a map of CSS class rules,
 * applies them as presentation attributes on matching elements, then removes
 * the <style> blocks.
 * @param {string} svg - SVG text.
 * @returns {string} SVG text with <style> blocks removed and rules inlined.
 */
function expandStyleBlocks(svg) {
	// Collect all class rules from every <style> block
	const classRules = {};
	const styleBlockRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
	let styleMatch;
	while ((styleMatch = styleBlockRe.exec(svg)) !== null) {
		const cssText = styleMatch[1];
		const ruleRe = /\.([\w-]+)\s*\{([^}]+)\}/g;
		let ruleMatch;
		while ((ruleMatch = ruleRe.exec(cssText)) !== null) {
			const cls = ruleMatch[1];
			const props = {};
			ruleMatch[2].split(";").forEach((decl) => {
				const colonIdx = decl.indexOf(":");
				if (colonIdx !== -1) {
					const prop = decl.slice(0, colonIdx).trim();
					const val = decl.slice(colonIdx + 1).trim();
					if (prop && val && prop !== "enable-background") {
						props[prop] = val;
					}
				}
			});
			classRules[cls] = Object.assign(classRules[cls] || {}, props);
		}
	}

	// Remove all <style> blocks
	let result = svg.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

	if (Object.keys(classRules).length === 0) {
		return result;
	}

	// For each element that has a class= attribute, inject the resolved rules
	// as presentation attributes and remove the class= attribute.
	result = result.replace(/<(\w[\w-]*)\s([^>]+)>/g, (tag, tagName, attrs) => {
		const classMatch = attrs.match(/\bclass="([^"]+)"/);
		if (!classMatch) {
			return tag;
		}
		const classes = classMatch[1].split(/\s+/);
		let extraAttrs = "";
		classes.forEach((cls) => {
			const rules = classRules[cls];
			if (rules) {
				Object.entries(rules).forEach(([prop, val]) => {
					// Only add if not already present as an attribute
					const attrRe = new RegExp(`\\b${prop}\\s*=`, "i");
					if (!attrRe.test(attrs)) {
						extraAttrs += ` ${prop}="${val}"`;
					}
				});
			}
		});
		const attrsWithoutClass = attrs.replace(/\s*\bclass="[^"]*"/, "");
		return `<${tagName} ${attrsWithoutClass}${extraAttrs}>`;
	});

	return result;
}

/**
 * Converts style= attributes on SVG elements to individual presentation
 * attributes.  The "enable-background" property is discarded.
 * @param {string} svg - SVG text.
 * @returns {string} SVG text with style= attributes replaced.
 */
function convertStyleAttributes(svg) {
	return svg.replace(/\bstyle="([^"]*)"/g, (_match, styleValue) => {
		const presentationAttrs = [];
		styleValue.split(";").forEach((decl) => {
			const colonIdx = decl.indexOf(":");
			if (colonIdx !== -1) {
				const prop = decl.slice(0, colonIdx).trim();
				const val = decl.slice(colonIdx + 1).trim();
				if (prop && val && prop !== "enable-background") {
					presentationAttrs.push(`${prop}="${val}"`);
				}
			}
		});
		return presentationAttrs.join(" ");
	});
}
