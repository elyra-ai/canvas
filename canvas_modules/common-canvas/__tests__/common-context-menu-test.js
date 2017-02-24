import React from 'react';
import CommonContextMenu from '../src/common-context-menu.jsx';
import {shallow, mount, render} from 'enzyme';
import {expect, assert} from 'chai';
import sinon from 'sinon';
import {MenuItem} from 'react-contextmenu';

describe('CommonContextMenu renders correctly', () => {

    it('all required props should have been defined', () => {
        const _contextHandler = sinon.spy();
        const _menuDefinition = getMenuDefinition();
        const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition}/>);
        expect(wrapper.contextHandler).to.be.defined;
        expect(wrapper.menuDefinition).to.be.defined;
    });

    it('should render three <MenuItem/> components', () => {
        const _contextHandler = sinon.spy();
        const _menuDefinition = getMenuDefinition();
        const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition}/>);
        expect(wrapper.find(MenuItem)).to.have.length(3);
    });

    it('should render a <div>', () => {
        const _contextHandler = sinon.spy();
        const _menuDefinition = getMenuDefinition();
        const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition}/>);
        expect(wrapper.find('div')).to.have.length(1);
    });

    it('simulates click events', () => {
        const _contextHandler = sinon.spy();
        const _menuDefinition = getMenuDefinition();
        const wrapper = shallow(<CommonContextMenu contextHandler={_contextHandler} menuDefinition={_menuDefinition}/>);
        wrapper.find(MenuItem).at(0).simulate('click');
        expect(_contextHandler.calledOnce).to.equal(true);
    });

});

function getMenuDefinition() {
  return [
    {action: "dosomething", label: "Do something"},
    {divider: true},
    {action: "dosomethingelse", label: "Do something else"}
  ];
}
