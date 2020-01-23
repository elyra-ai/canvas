/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

import { IntlProvider } from "react-intl";
import { mount, shallow } from "enzyme";


const defaultLocale = "en-US";
const locale = defaultLocale;

export function mountWithIntl(node) {
	return mount(node, {
		wrappingComponent: IntlProvider,
		wrappingComponentProps: {
			locale,
			defaultLocale
		},
	});
}

export function shallowWithIntl(node) {
	return shallow(node, {
		wrappingComponent: IntlProvider,
		wrappingComponentProps: {
			locale,
			defaultLocale
		},
	});
}
