import React from 'react';
import ContextMenuWrapper from '../src/context-menu-wrapper.jsx';
import {shallow, mount, render} from 'enzyme';
import {expect} from 'chai';
import sinon from 'sinon';

describe('ContextMenuWrapper renders correctly', () => {

    var wrapper;
    // const _contextHandler = sinon.spy();
    const _handleClickOutside = sinon.spy();
    const _menu = [
      "item1",
      "-",
      "item2"
    ];

    beforeEach(function() {
        wrapper = shallow(
          <ContextMenuWrapper
            positionLeft={100}
            positionTop={100}
            contextMenu={_menu}
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
