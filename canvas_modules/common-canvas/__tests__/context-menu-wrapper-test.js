import React from 'react';
import ContextMenuWrapper from '../src/context-menu-wrapper.jsx';
import CommonContextMenu from '../src/common-context-menu.jsx';
import {shallow, mount, render} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';

describe('ContextMenuWrapper renders correctly', () => {

    var wrapper;

    const _contextMenuClicked = sinon.spy();
    const _closeContextMenu = sinon.spy();

    const _menu = [
      {action: "item1", label: "Item 1"},
      {divider: true},
      {action: "item2", label: "Item 2"}
    ];

    const _mousePos = {x: 100, y: 100};

    beforeEach(function() {
        wrapper = shallow(
          <ContextMenuWrapper
            containingDivId={"common-canvas"}
            mousePos={_mousePos}
            contextMenuDef={_menu}
            contextMenuClicked={_contextMenuClicked}
            closeContextMenu={_closeContextMenu}>
          </ContextMenuWrapper>
        );
    });

    it('all required props should have been defined', () => {
        expect(wrapper.containingDivId).to.be.defined;
        expect(wrapper.mousePos).to.be.defined;
        expect(wrapper.contextMenuDef).to.be.defined;
        expect(wrapper.contextMenuClicked).to.be.defined;
        expect(wrapper.closeContextMenu).to.be.defined;
    });


});
