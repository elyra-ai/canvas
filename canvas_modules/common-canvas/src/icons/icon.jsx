/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import React from "react";
import PropTypes from "prop-types";

const CLASS_NAME = "canvas-icon";

export default class Icon extends React.Component {
	getIcon(type) {
		const types = {
			measurementEmpty:
			<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 18 18" fill="none">
				<path d="M86.6,2.7c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3C83.6,4,84.9,2.7,86.6,2.7" />
				<path d="M111.1,2.7c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3C108.1,4,109.4,2.7,111.1,2.7" />
			</svg>,
			measurementScale:
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
				<path className={CLASS_NAME + " fill"} d="M21.13,6,26,10.87,10.87,26,6,21.14,21.13,6h0m0-2a2,2,0,0,0-1.41.59L4.58,
					19.72a2,2,0,0,0,0,2.83l4.87,4.87a2,2,0,0,0,1.42.59,2,2,0,0,0,1.41-.59L27.42,12.29a2,2,0,0,0,0-2.83L22.55,
					4.59A2,2,0,0,0,21.13,4Z"
				/>
				<line className={CLASS_NAME + " stroke"} x1="23.06" y1="15.36" x2="19.85" y2="12.15" />
				<line className={CLASS_NAME + " stroke"} x1="19.21" y1="19.21" x2="16" y2="16" />
				<line className={CLASS_NAME + " stroke"} x1="15.36" y1="23.06" x2="12.15" y2="19.85" />
			</svg>,
			measurementOrdinal:
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={CLASS_NAME + " fill"}>
				<path className={CLASS_NAME + " fill"} d="M26,4V28H24V4h2m0-2H24a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V4a2,2,0,0,0-2-2Z" />
				<path className={CLASS_NAME + " fill"} d="M17,12V28H15V12h2m0-2H15a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V12a2,2,0,0,0-2-2Z" />
				<path className={CLASS_NAME + " fill"} d="M8,18V28H6V18H8m0-2H6a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H8a2,2,0,0,0,2-2V18a2,2,0,0,0-2-2Z" />
				<line className={CLASS_NAME + " stroke"} x1="30" y1="29" x2="2" y2="29" />
			</svg>,

			measurementNominal:
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={CLASS_NAME + " fill"}>
				<path className={CLASS_NAME + " fill"} d="M13,16a1,1,0,1,0,1,1,1,1,0,0,0-1-1Z" />
				<path className={CLASS_NAME + " fill"} d="M26.41,19s0-.09,0-.13a6.88,6.88,0,0,0-.24-.89.78.78,0,0,1,0-.14,5.62,5.62,0,0,0-.39-.82l-.07-.11a5.91,5.91,
					0,0,0-.54-.77h0a6,6,0,0,0-.71-.71v0a6.37,6.37,0,0,0-.8-.56l-.06,0a7,7,0,0,0-.87-.42l-.06,0a5.47,5.47,0,0,0-1-.27h0A6.17,6.17,0,0,0,22,12a6,6,0,0,
					0-12,0,6.17,6.17,0,0,0,.38,2.11h0A6,6,0,0,0,5.5,20a5.71,5.71,0,0,0,.2,1.5h0A5.88,5.88,0,0,0,7.07,24l0,0a6.85,6.85,0,0,0,.68.63l0,0a6.25,6.25,0,0,
					0,1.6.89l.14.05a7.55,7.55,0,0,0,.85.22l.15,0a5.64,5.64,0,0,0,.93.08c.24,0,.47,0,.71,0l.19,0a4.37,4.37,0,0,0,.5-.09l.19,0,.48-.15.15-.06.5-.23.09-.05A6.07,6.07,
					0,0,0,16,24h0v0h0a5.93,5.93,0,0,0,.43.44l0,0a4.94,4.94,0,0,0,.44.36l.05,0c.15.11.29.21.44.3l.1.06.43.23.13.06.42.17.16.06.43.12.18,0,.45.08.18,0a4.49,
					4.49,0,0,0,.64,0,6,6,0,0,0,6-6A5.36,5.36,0,0,0,26.41,19ZM13.3,23.56l-.21.1-.29.11-.22.07-.33.08-.2,0a4.91,4.91,0,0,1-.55,0,4.4,4.4,0,0,1-.73-.07l-.21-.05a3.37,
					3.37,0,0,1-.48-.15l-.22-.09a5.42,5.42,0,0,1-.48-.26l-.13-.08a4,4,0,0,1-.51-.41,2,2,0,0,1-.19-.22,2.48,2.48,0,0,1-.25-.3,2.4,2.4,
					0,0,1-.18-.26c-.07-.11-.13-.23-.19-.34L7.8,21.5A3.94,3.94,0,0,1,7.5,20a4,4,0,0,1,3.26-3.93,2,2,0,0,0,1.5-2.67,4,4,0,1,1,7.48,0,2.25,2.25,0,0,0-.12.67,
					6,6,0,0,0-4.73,8A4,4,0,0,1,13.3,23.56Zm10.89-2a4.38,4.38,0,0,1-.86,1.27A4,4,0,0,1,20.5,24a4.17,4.17,0,0,1-.71-.07l-.16,0a4.31,4.31,0,0,1-.61-.19l-.18-.08A4,4,
					0,0,1,20.5,16a3.84,3.84,0,0,1,.76.08l.34.09c.13,0,.26.07.38.12l.28.14a3.72,3.72,0,0,1,.39.21l.23.17a3.07,3.07,0,0,1,
					.35.28c.07.06.13.13.2.2s.19.23.28.35l.17.23c.08.13.14.26.21.4s.09.17.12.26a3.68,
					3.68,0,0,1,.15.47,2.1,2.1,0,0,1,.06.24,3.84,3.84,0,0,1,.08.76A4.06,4.06,0,0,1,24.19,21.56Z"
				/>
			</svg>,
			measurementFlag:
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={CLASS_NAME + " fill"}>
				<path className={CLASS_NAME + " fill"} d="M16,4a4,4,0,1,1-4,4,4,4,0,0,1,4-4m0-2a6,6,0,1,0,6,6,6,6,0,0,0-6-6Z" />
				<path className={CLASS_NAME + " fill"} d="M16,20a4,4,0,1,1-4,4,4,4,0,0,1,4-4m0-2a6,6,0,1,0,6,6,6,6,0,0,0-6-6Z" />
				<circle className={CLASS_NAME + " fill"} cx="16" cy="24" r="1" />
				<path className={CLASS_NAME + " fill"} d="M16,22a2,2,0,1,0,2,2,2,2,0,0,0-2-2Z" />
			</svg>,
			measurementDiscrete:
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
				<path className={CLASS_NAME + " fill"} d="M12,4A4,4,0,1,1,8,8a4,4,0,0,1,4-4m0-2a6,6,0,1,0,6,6,6,6,0,0,0-6-6Z" />
				<path className={CLASS_NAME + " fill"} d="M12,20a4,4,0,1,1-4,4,4,4,0,0,1,4-4m0-2a6,6,0,1,0,6,6,6,6,0,0,0-6-6Z" />
				<circle className={CLASS_NAME + " fill"} cx="12" cy="24" r="1" />
				<path className={CLASS_NAME + " fill"} d="M12,22a2,2,0,1,0,2,2,2,2,0,0,0-2-2Z" />
				<path className={CLASS_NAME + " fill"} d="M24,4V28H22V4h2m0-2H22a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V4a2,2,0,0,0-2-2Z" />
			</svg>,
			downCaret:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 17 16"
					fill="none"
					strokeWidth="2"
					strokeMiterlimit="10"
					className={CLASS_NAME + " stroke"}
					{...this.props}
				>
					<linearGradient gradientUnits="userSpaceOnUse">
						<stop offset="0" />
						<stop offset="0.618" />
						<stop offset="0.6292" />
						<stop offset="0.9831" />
					</linearGradient>
					<polyline points="0.5,4 8.5,12 16.5,4 " />
				</svg>,
			upCaret:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 17 16"
					fill="none"
					strokeWidth="2"
					strokeMiterlimit="10"
					className={CLASS_NAME + " stroke"}
					{...this.props}
				>
					<polyline points="16.5,12 8.5,4 0.5,12 " />
				</svg>,
			rightArrow:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 10.4 10"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<polygon points="0.4,0 10.4,5 0.4,10 " />
				</svg>,
			search:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path
						d="M12 1C5.926 1 1 5.926 1 12s4.926 11 11 11 11-4.926 11-11S18.074 1 12 1zm0 20c-4.962 0-9-4.038-9-9s4.038-9 9-9
							9 4.038 9 9-4.038 9-9 9zM21 24l3-3 7 6.999-3 3z"
					/>
					<circle cx="21" cy="21" r="1" />
				</svg>,
			addComment:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 12.1 15.1"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M10.3,1.8C7.9-0.5,4.1-0.5,1.8,1.9s-2.3,6.2,0.1,8.5C3,11.4,4.5,12,6,12.1v3l4.3-4.5c1.2-1.2,1.8-2.9,1.8-4.5
						C12.1,4.4,11.4,2.9,10.3,1.8z M3.5,6.8C3.1,6.8,2.8,6.4,2.8,6s0.3-0.7,0.8-0.7c0.4,0,0.7,0.3,0.7,0.7C4.3,6.4,4,6.8,3.5,6.8
						C3.5,6.8,3.5,6.8,3.5,6.8L3.5,6.8z M6,6.8C5.6,6.8,5.3,6.4,5.3,6c0-0.4,0.4-0.7,0.8-0.7c0.4,0,0.7,0.3,0.7,0.7
						C6.8,6.4,6.5,6.8,6,6.8C6.1,6.8,6,6.8,6,6.8z M8.5,6.8C8.1,6.8,7.8,6.4,7.8,6c0-0.4,0.4-0.7,0.8-0.7C9,5.3,9.3,5.6,9.3,6
						C9.3,6.4,9,6.8,8.5,6.8C8.6,6.8,8.6,6.8,8.5,6.8L8.5,6.8z"
					/>
				</svg>,
			arrangeVertically:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 13.5 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M9.25,3V6h-5V3h5m1-1h-7V7h7V2Z" />
					<path d="M9.25,10v3h-5V10h5m1-1h-7v5h7V9Z" />
					<rect x="12" width="1.5" height="16" />
					<rect width="1.5" height="16" />
				</svg>,
			arrangeHorizontally:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 13.5"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M6,5.25v3H1v-3H6m1-1H0v5H7v-5Z" />
					<path d="M15,5.25v3H10v-3h5m1-1H9v5h7v-5Z" />
					<rect width="16" height="1.5" />
					<rect y="12" width="16" height="1.5" />
				</svg>,
			undo:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 11.7"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M9.5,0C6-0.1,3.1,2.8,3.1,6.3v3.4L0.8,7.5L0,8.2l3.6,3.5l3.6-3.5L6.5,7.5L4.2,9.7V6.3C4.2,3.3,6.6,1,9.5,1
						c0,0,0,0,0,0c2.9,0,5.3,2.3,5.4,5.2c0,1.4-0.6,2.8-1.6,3.8l0.8,0.7C15.3,9.6,16,8,16,6.3C15.9,2.8,13.1,0,9.5,0"
					/>
				</svg>,
			redo:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 11.7"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M6.5,0c3.5,0,6.4,2.8,6.5,6.3v3.4l2.3-2.2L16,8.2l-3.6,3.5L8.8,8.2l0.8-0.7l2.3,2.2V6.3C11.8,3.3,9.4,1,6.5,1
						c0,0,0,0,0,0C3.5,1,1.1,3.3,1.1,6.3c0,0,0,0,0,0C1.1,7.7,1.6,9,2.7,10l-0.8,0.7C0.7,9.6,0,8,0,6.3C0.1,2.8,2.9,0,6.5,0"
					/>
				</svg>,
			paste:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 10.2 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M7.7,1.9V1.3H6.9c-0.4-1-1.4-1.5-2.4-1.2c-0.5,0.2-1,0.6-1.2,1.2H2.6v0.6H0V16h10.2V1.9H7.7z M5.1,1.1
						c0.4,0,0.6,0.3,0.6,0.6S5.5,2.4,5.1,2.4S4.5,2.1,4.5,1.7l0,0C4.5,1.4,4.8,1.1,5.1,1.1z M9,14.7H1.3V3.2h1.3v0.6h5.1V3.2H9V14.7z"
					/>
				</svg>,
			delete:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 11.4 16.2"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M0,2v2.8h0.6v11.4h10.3V4.8h0.6V2H0z M9.7,15.1h-8V6h8V15.1z" />
					<path d="M3,7.1h0.6V14H3V7.1z" />
					<path d="M4.7,7.1h0.6V14H4.7V7.1z" />
					<path d="M6.4,7.1h0.6V14H6.4V7.1z" />
					<path d="M8.1,7.1h0.6V14H8.1V7.1z" />
					<path d="M2.2,0h7.1v1.3H2.2L2.2,0z" />
				</svg>,
			cut:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M8,2.9c-0.4,0-0.7-0.3-0.7-0.7S7.6,1.5,8,1.5s0.7,0.3,0.7,0.7c0,0,0,0,0,0C8.7,2.6,8.4,2.9,8,2.9z M2.2,8.7
						C1.8,8.7,1.5,8.4,1.5,8c0-0.4,0.3-0.7,0.7-0.7S2.9,7.6,2.9,8v0C2.9,8.4,2.6,8.7,2.2,8.7z M13.8,6.6H8.7V4.2
						c1.1-0.4,1.7-1.6,1.3-2.8C9.7,0.3,8.4-0.3,7.3,0.1S5.5,1.8,5.9,2.9C6.2,3.5,6.7,4,7.3,4.2v2.4C7,6.7,6.7,7,6.6,7.3H4.2
						C3.8,6.1,2.6,5.5,1.4,5.9s-1.7,1.6-1.3,2.8s1.6,1.7,2.8,1.3C3.5,9.8,4,9.3,4.2,8.7h2.3v5.1L8.7,16V8.7H16L13.8,6.6z"
					/>
				</svg>,
			copy:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 12.3 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M3.7,13.5V3.7H8v3.1h3.1v8H3.7V13.5z M1.2,1.2h7.4v1.2H2.5v9.9H1.2V1.2z M0,0v13.5h2.5V16h9.9V6.2L9.9,3.7V0H0z" />
				</svg>,
			stop:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 11 11"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M0,0h11v11H0V0z" />
				</svg>,
			run:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 11 12.3"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M0,0l11,6.1L0.1,12.3" />
				</svg>,
			paletteOpen:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 22 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M0,0v16h22V0H0z M20,14.6H8.1V8.7H13l-1.3,1.3l1,1L15.7,8l-3.1-3.1l-1,1L13,7.3H8.2V1.5H20V14.6z M13.7,8L13.7,8L13.7,8z" />
				</svg>,
			paletteClose:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 22 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M0,0v16h22V0H0z M8.1,14.6V1.5H20v5.8h-4.8L16.5,6l-1-1l-3.1,3l3.1,3.1l1-1l-1.3-1.4H20v5.8L8.1,14.6z M14.5,8L14.5,8L14.5,8z" />
				</svg>,
			zoomIn:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fillRule="evenodd"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M6.07,0a6.07,6.07,0,1,0,6.07,6.07A6.07,6.07,0,0,0,6.07,0m0,11a5,5,0,1,1,5-5,5,5,0,0,1-5,5" />
					<path d="M6.07,0a6.07,6.07,0,1,0,6.07,6.07A6.07,6.07,0,0,0,6.07,0m0,11a5,5,0,1,1,5-5,5,5,0,0,1-5,5" />
					<rect x="12.07" y="10.51" width="2.34" height="5.46" transform="translate(-5.48 13.24) rotate(-45)" />
					<polygon points="6.53 3.31 5.61 3.31 5.61 5.61 3.31 5.61 3.31 6.53 5.61 6.53 5.61 8.83 6.53 8.83 6.53 6.53 8.83 6.53 8.83 5.61 6.53 5.61 6.53 3.31" />
					<polygon points="6.53 3.31 5.61 3.31 5.61 5.61 3.31 5.61 3.31 6.53 5.61 6.53 5.61 8.83 6.53 8.83 6.53 6.53 8.83 6.53 8.83 5.61 6.53 5.61 6.53 3.31" />
				</svg>,
			zoomOut:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fillRule="evenodd"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M6.07,0A6.07,6.07,0,1,1,0,6.07,6.07,6.07,0,0,1,6.07,0Zm0,11a5,5,0,1,0-5-5A5,5,0,0,0,6.07,11Z" />
					<path d="M6.07,0A6.07,6.07,0,1,1,0,6.07,6.07,6.07,0,0,1,6.07,0Zm0,11a5,5,0,1,0-5-5A5,5,0,0,0,6.07,11Z" />
					<rect x="12.07" y="10.51" width="2.34" height="5.46" transform="translate(-5.48 13.24) rotate(-45)" />
					<rect x="3.31" y="5.52" width="5.52" height="1.1" />
					<rect x="3.31" y="5.52" width="5.52" height="1.1" />
				</svg>,
			zoomToFit:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 20.1"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M8.6,7.8h6.7v4.3H8.6V7.8z" />
					<path d="M2.8,17h18.3V2.9H2.8V17z M4.4,4.5h15.1v10.9H4.4V4.5z" />
					<path d="M1.6,1.6h1.2V0H0v2.9h1.6V1.6" />
					<path d="M21.2,0v1.6h1.2v1.3H24V0H21.2" />
					<path d="M22.4,18.5h-1.2v1.6H24v-2.9h-1.6L22.4,18.5" />
					<path d="M1.6,17.2H0v2.9h2.8v-1.6H1.6L1.6,17.2" />
				</svg>,
			notificationCounterIcon:
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 25 25"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M20.8,9.5v10c0,0.7-0.6,1.2-1.2,1.2h-15c-0.7,0-1.2-0.6-1.2-1.2v-15c0-0.7,0.6-1.2,1.2-1.2h10V2h-10
						C3.1,2,2,3.1,2,4.5v15C2,20.9,3.1,22,4.5,22h15c1.4,0,2.5-1.1,2.5-2.5v-10H20.8z"
					/>
					<circle className="dot" cx="21" cy="4" r="3" />
				</svg>,
			overflow:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<circle cx="8" cy="2" r="2" />
					<circle cx="8" cy="14" r="2" />
					<circle cx="8" cy="8" r="2" />
				</svg>,
			edit:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M22 4l3-3 6 6-3 3zM5 21l6 6 15-15-6-6L5 21zm6 3.171L7.828 21 20 8.829 23.172 12 11 24.171zM1 31l5-2-3-3z" />
				</svg>,
			remove:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M9 15h14v2H9z" />
					<path d="M16 2C8.269 2 2 8.269 2 16s6.269 14 14 14 14-6.269 14-14S23.731 2
						16 2zm0 26C9.383 28 4 22.617 4 16S9.383 4 16 4s12 5.383 12 12-5.383 12-12 12z"
					/>
				</svg>,
			info:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M10,12H6v-1h1V8H6V7h3v4h1V12z M8,4c0.6,0,1,0.4,1,1S8.6,6,8,6S7,5.6,7,5S7.4,4,8,4z M8,0C3.6,0,0,3.6,0,8
						s3.6,8,8,8s8-3.6,8-8c0-2.1-0.8-4.2-2.3-5.7C12.2,0.8,10.1,0,8,0z"
					/>
				</svg>,
			moveTop:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 19"
					fill="none"
					strokeWidth="3"
					className={CLASS_NAME + " stroke"}
					{...this.props}
				>
					<defs>
						<rect y="0" width="15" height="19" />
					</defs>
					<line x1="7.5" y1="16.5" x2="7.5" y2="6" />
					<polyline points="13,9 7.6,3.6 2.1,9 	" />
					<line strokeWidth="2" x1="1.5" y1="2" x2="13.5" y2="2" />
				</svg>,
			moveBottom:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 19"
					fill="none"
					strokeWidth="3"
					className={CLASS_NAME + " stroke"}
					{...this.props}
				>
					<defs>
						<rect width="16" height="19" />
					</defs>
					<line x1="8.5" y1="2.5" x2="8.5" y2="13" />
					<polyline points="3,10 8.4,15.4 13.9,10" />
					<line strokeWidth="2" x1="14.5" y1="17" x2="2.5" y2="17" />
				</svg>,
			moveUp:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 18"
					fill="none"
					strokeWidth="3"
					className={CLASS_NAME + " stroke"}
					{...this.props}
				>
					<defs>
						<rect width="16" height="18" />
					</defs>
					<line x1="7.5" y1="15.5" x2="7.5" y2="5" />
					<polyline points="13,8 7.6,2.6 2.1,8" />
				</svg>,
			moveDown:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 15 18"
					fill="none"
					strokeWidth="3"
					className={CLASS_NAME + " stroke"}
					{...this.props}
				>
					<defs>
						<rect width="15" height="18" />
					</defs>
					<line x1="7.5" y1="2.5" x2="7.5" y2="13" />
					<polyline points="2,10 7.4,15.4 12.9,10" />
				</svg>,
			reset:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path
						d="M18.853 4.793c-6.617 0-12 5.383-12 12v6.586L2.56 19.086 1.146 20.5l6.707 6.707L14.56 20.5l-1.414-1.414-4.293
							4.293v-6.586c0-5.514 4.486-10 10-10s10 4.486 10 10a9.934 9.934 0 0 1-2.929 7.071l1.414 1.414a11.92 11.92 0 0 0
							3.515-8.485c0-6.617-5.383-12-12-12z"
					/>
				</svg>,
			date:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 13 13"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M10.2,1.3V0.5H8.8v0.8H4.2V0.5H2.8v0.8H0.5v11.2h12V1.3H10.2z M11,11H2V4.2h9V11z" />
					<rect x="3.5" y="5.8" width="1.5" height="1.5" />
					<rect x="8" y="5.8" width="1.5" height="1.5" />
					<rect x="5.8" y="5.8" width="1.5" height="1.5" />
					<rect x="3.5" y="8" width="1.5" height="1.5" />
					<rect x="8" y="8" width="1.5" height="1.5" />
					<rect x="5.8" y="8" width="1.5" height="1.5" />
				</svg>,
			time:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 13 13"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M6.5,1.5c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5S9.3,1.5,6.5,1.5z M7.1,7.1H4.6V5.9h1.2V3.4h1.2V7.1z" />
				</svg>,
			timestamp:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 13 13"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<path d="M10.3,1.3V0.5H8.8v0.8H4.3V0.5H2.8v0.8H0.5v11.2h12V1.3H10.3z M11,11H2V4.3h9V11z" />
					<rect x="3.5" y="5.8" width="1.5" height="1.5" />
					<rect x="8" y="5.8" width="1.5" height="1.5" />
					<rect x="5.8" y="5.8" width="1.5" height="1.5" />
					<rect x="3.5" y="8" width="1.5" height="1.5" />
					<rect x="8" y="8" width="1.5" height="1.5" />
					<rect x="5.8" y="8" width="1.5" height="1.5" />
					<circle fill="#FFFFFF" cx="8.4" cy="8.2" r="3.8" />
					<path d="M8.4,4.8C6.5,4.8,5,6.3,5,8.2s1.5,3.4,3.4,3.4s3.4-1.5,3.4-3.4S10.3,4.8,8.4,4.8z M8.8,8.7H7.1V7.8H8V6.1h0.8
						V8.7z"
					/>
				</svg>,
			string:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 13 13"
					className={CLASS_NAME + " fill"}
					{...this.props}
				>
					<rect x="1.5" y="1.5" width="10" height="10" />
					<rect fill="none" x="4" y="3.8" width="5" height="5.4" />
					<text fill="#FFFFFF" fontSize="7px" transform="matrix(1 0 0 1 4.0137 8.8187)">A</text>
				</svg>,
			double:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 13 13"
					className={CLASS_NAME}
					{...this.props}
				>
					<line fill="none" className="stroke" x1="2.8" y1="3" x2="10" y2="10.2" />
					<line fill="none" className="stroke" x1="10" y1="3" x2="2.8" y2="10.2" />
					<rect fill="#FFFFFF" className="stroke" x="3" y="3.1" transform="matrix(0.7071 0.7071 -0.7071 0.7071 6.5915 -2.6578)" width="7.1" height="7.1" />
					<rect stroke="none" fill="none" x="5.1" y="4.5" width="3.6" height="4.8" />
					<text fontSize="6px" className="fill" transform="matrix(1 0 0 1 4.5 8.7242)">#</text>
				</svg>,
			integer:
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="-1 2 13 13"
					fill="none"
					className={CLASS_NAME + " stroke"}
					{...this.props}
				>
					<path d="M9,12.2l-1-1 M3,6.2L1.8,5 M2.9,11.1l-1.1,1.1 M9,5L7.9,6.1 M10.5,8.7L8,11.2l-2.5,2.5l-2.6-2.6L0.5,8.7l5-5
						l2.4,2.4L10.5,8.7z"
					/>
				</svg>,
			builder:
					<svg xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 14 19"
						className={CLASS_NAME}
						{...this.props}
					>
						<path d="M1,0 L13,0 C13.5522847,-1.01453063e-16 14,0.44771525 14,1 L14,18 C14,18.5522847 13.5522847,19 13,19 L1,19
						C0.44771525,19 6.76353751e-17,18.5522847 0,18 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0
						Z M2,2 L2,4 L12,4 L12,2 L2,2 Z M2,7 L2,9 L4,9 L4,7 L2,7 Z M2,11 L2,13 L4,13 L4,11 L2,11 Z M2,15 L2,17 L4,17 L4,15
						L2,15 Z M6,7 L6,9 L8,9 L8,7 L6,7 Z M6,11 L6,13 L8,13 L8,11 L6,11 Z M6,15 L6,17 L8,17 L8,15 L6,15 Z M10,7 L10,9 L12,9
						L12,7 L10,7 Z M10,11 L10,13 L12,13 L12,11 L10,11 Z M10,15 L10,17 L12,17 L12,15 L10,15 Z"
						/>
					</svg>,
			gear:
					<svg xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						className={CLASS_NAME + " fill"}
						{...this.props}
					>
						<path d="M27.5 16c0-.615-.062-1.213-.155-1.802L31 11l-3.106-5.098-4.359 1.424a11.471 11.471 0 0 0-3.569-2.109L19
						1h-6l-.966 4.217a11.47 11.47 0 0 0-3.57 2.11L4.105 5.902 1 11l3.655 3.199A11.496 11.496 0 0 0 4.5 16c0 .615.062
						1.213.155 1.802L1 21l3.106 5.098 4.358-1.424a11.46 11.46 0 0 0 3.57 2.11L13 31h6l.966-4.217a11.471 11.471 0 0 0
						3.569-2.109l4.359 1.424L31 21l-3.655-3.197c.093-.589.155-1.188.155-1.803zm.916 5.397l-1.406 2.308-2.853-.932-1.078-.352-.855.744a9.464
						9.464 0 0 1-2.947 1.742l-1.017.375-.242 1.056L17.406 29h-2.812l-.61-2.664-.242-1.056-1.017-.375a9.42 9.42 0 0
						1-2.948-1.742l-.856-.743-1.078.353-2.853.932-1.406-2.308 2.388-2.09.83-.727-.172-1.09A9.529 9.529 0 0 1 6.5
						16c0-.446.042-.934.13-1.49l.172-1.09-.83-.727-2.388-2.091L4.99 8.294l2.853.933 1.078.353.855-.744a9.43 9.43 0
						0 1 2.948-1.742l1.017-.375.242-1.056L14.594 3h2.812l.61 2.664.242 1.056 1.017.375c1.087.4 2.079.986 2.947
						1.742l.855.744 1.078-.352 2.854-.933 1.406 2.308-2.388 2.089-.831.727.173 1.091c.088.555.131 1.042.131
						1.489s-.043.935-.131 1.49l-.173 1.091.831.727 2.389 2.089z"
						/>
						<path d="M16 10c-3.315 0-6 2.685-6 6s2.685 6 6 6 6-2.685 6-6-2.685-6-6-6zm0 8a2 2 0 1 1 .001-4.001A2 2 0 0 1 16 18z" />
					</svg>
		};
		return types[type];
	}
	render() {
		let icon = this.getIcon(this.props.type);
		if (!icon) {
			icon = <div />;
		}
		return icon;
	}
}
Icon.propTypes = {
	type: PropTypes.string.isRequired,
	style: PropTypes.object,
};
