import React from 'react';
import CommonProperties from '../src/common-properties.jsx';
import PropertiesDialog from '../src/properties-dialog.jsx';
import {shallow, mount, render} from 'enzyme';
import {expect, assert} from 'chai';
import sinon from 'sinon';



describe('CommonProperties renders correctly', () => {

    it('all required props should have been defined', () => {
        const wrapper = createCommonProperties();

        expect(wrapper.showPropertiesDialog).to.be.defined;
        expect(wrapper.propertiesInfo).to.be.defined;
        expect(wrapper.applyPropertyChanges).to.be.defined;
        expect(wrapper.closePropertiesDialog).to.be.defined;
    });

    it('should render one <PropertiesDialog/> component', () => {
        const wrapper = createCommonProperties();
        expect(wrapper.find(PropertiesDialog)).to.have.length(1);
    });

});

function createCommonProperties() {
  const showPropertiesDialog = true;
  const propertiesInfo = {};
  const applyPropertyChanges = sinon.spy();
  const closePropertiesDialog = sinon.spy();

  propertiesInfo.title = "Test Title";
  propertiesInfo.formData = {};
  propertiesInfo.appData = {};
  propertiesInfo.additionalComponents = {};
  propertiesInfo.applyPropertyChanges = applyPropertyChanges;
  propertiesInfo.closePropertiesDialog = closePropertiesDialog;

  const wrapper = shallow(<CommonProperties
    showPropertiesDialog={showPropertiesDialog}
    propertiesInfo={propertiesInfo}/>);

  return wrapper;
}
