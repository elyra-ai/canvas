/*
 * Copyright 2017-2023 Elyra Authors
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

export default class SvgCanvasUtilsComments {
	// Returns the absolute x coordinate of the center of the comment
	getCommentCenterPosX(com) {
		return com.x_pos + (com.width / 2);
	}

	// Returns the absolute y coordinate of the center of the comment
	getCommentCenterPosY(com) {
		return com.y_pos + (com.height / 2);
	}
}
