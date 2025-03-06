/*
 * Copyright 2025 Elyra Authors
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


const keys = [];
keys.tab = { code: "Tab", keyCode: 9, release: true };
keys.enter = { code: "Enter", keyCode: 13, release: true };
keys.cmndSlash = { code: "Slash", keyCode: 191, metaKey: true, release: true };
keys.cmndDownArrow = { code: "ArrowDown", keyCode: 40, metaKey: true, release: true };
keys.shiftDownArrow = { code: "ArrowDown", keyCode: 40, shiftKey: true, release: true };
keys.cmndShiftDownArrow = { code: "ArrowDown", keyCode: 40, metaKey: true, shiftKey: true, release: true };
keys.cmndShiftRightArrow = { code: "ArrowRight", keyCode: 42, metaKey: true, shiftKey: true, release: true };
keys.cmndShiftMinus = { code: "Minus", keyCode: 189, metaKey: true, shiftKey: true, release: true };
keys.cmndShiftEqual = { code: "Equal", keyCode: 187, metaKey: true, shiftKey: true, release: true };
keys.cmndShiftZero = { code: "Digit0", keyCode: 48, metaKey: true, shiftKey: true, release: true };

export default keys;
