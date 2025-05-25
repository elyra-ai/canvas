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
keys.space = { key: "Space", release: false };
keys.tab = { key: "Tab", release: true };
keys.objectSelect = { key: "Enter", release: true };
keys.selectAll = { key: "a", metaKey: true, release: true };
keys.delete = { key: "Delete", metaKey: false, release: true };

keys.contextMenu = { key: ",", metaKey: true, release: true };
keys.moveObjectDown = { key: "ArrowDown", metaKey: true, release: true };
keys.sizeObjectDown = { key: "ArrowDown", shiftKey: true, release: true };

keys.panDown = { key: "ArrowDown", metaKey: true, shiftKey: true, release: true };
keys.panRight = { key: "ArrowRight", metaKey: true, shiftKey: true, release: true };

keys.zoomIn = { key: "8", metaKey: true, shiftKey: true, release: true };
keys.zoomOut = { key: "9", metaKey: true, shiftKey: true, release: true };
keys.zoomToFit = { key: "0", metaKey: true, shiftKey: true, release: true };

keys.cut = { key: "x", metaKey: true, shiftKey: false, release: true };
keys.copy = { key: "c", metaKey: true, shiftKey: false, release: true };
keys.paste = { key: "v", metaKey: true, shiftKey: false, release: true };

keys.undo = { key: "z", metaKey: true, shiftKey: false, release: true };
keys.redo = { key: "z", metaKey: true, shiftKey: true, release: true };

keys.addNodeFromPalette = { key: "Space", metaKey: false, shiftKey: false, release: true };


export default keys;
