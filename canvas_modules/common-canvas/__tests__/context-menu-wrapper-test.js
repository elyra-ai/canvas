import React from 'react';
import ContextMenuWrapper from '../src/context-menu-wrapper.jsx';
import CommonContextMenu from '../src/common-context-menu.jsx';
import {shallow, mount, render} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';

describe('ContextMenuWrapper renders correctly', () => {

    var wrapper;

    const contextMenuHandler = sinon.spy();
    const _handleClickOutside = sinon.spy();
    
    const _menu = [
      {action: "item1", label: "Item 1"},
      {divider: true},
      {action: "item2", label: "Item 2"}
    ];

    let contextMenu = <CommonContextMenu
      menuDefinition={_menu}
      contextHandler={contextMenuHandler}/>;

    beforeEach(function() {
        wrapper = shallow(
          <ContextMenuWrapper
            positionLeft={100}
            positionTop={100}
            contextMenu={contextMenu}
            handleClickOutside={_handleClickOutside}>
          </ContextMenuWrapper>
        );
    });

    it('all required props should have been defined', () => {
        expect(wrapper.positionLeft).to.be.defined;
        expect(wrapper.positionTop).to.be.defined;
        expect(wrapper.contextMenu).to.be.defined;
    });


});
