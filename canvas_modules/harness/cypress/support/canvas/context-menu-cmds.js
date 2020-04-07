/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

Cypress.Commands.add("rightClickToDisplayContextMenu", (distFromLeft, distFromTop) => {
	cy.get("#canvas-div-0").rightclick(distFromLeft, distFromTop);
});

Cypress.Commands.add("clickOptionFromContextMenu", (optionName) => {
	cy.get(".context-menu-popover").find(".react-contextmenu-item:not(.contextmenu-divider)")
		.then((options) => {
			options.each((idx) => {
				if (options[idx].outerText === optionName) {
					options[idx].click();
				}
			});
		});
});

Cypress.Commands.add("clickOptionFromContextSubmenu", (submenuName, optionName) => {
	cy.get(".context-menu-popover").find(".react-contextmenu-submenu:not(.contextmenu-divider)")
		.then((contextMenuOptions) => {
			contextMenuOptions.each((idx) => {
				if (contextMenuOptions[idx].outerText === submenuName) {
					cy.wrap(contextMenuOptions[idx]).click();
					cy.get(".contextmenu-submenu").find(".react-contextmenu-item")
						.then((submenuOptions) => {
							submenuOptions.each((index) => {
								if (submenuOptions[index].outerText === optionName) {
									submenuOptions[index].click();
								}
							});
						});
				}
			});
		});
});
