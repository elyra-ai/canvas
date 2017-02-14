import React from 'react';
import CommonCanvas from '../src/common-canvas.jsx';
import DiagramCanvas from '../src/diagram-canvas.jsx';
import Palette from '../src/palette/palette.jsx';
import {shallow, mount, render} from 'enzyme';
import {expect, assert} from 'chai';
import sinon from 'sinon';
import {OverlayTrigger} from 'react-bootstrap';



describe('CommonCanvas renders correctly', () => {

    it('all required props should have been defined', () => {
        const wrapper = createCommonCanvas();
        expect(wrapper.stream).to.be.defined;
        expect(wrapper.initialSelection).to.be.defined;
        expect(wrapper.paletteJSON).to.be.defined;
        expect(wrapper.showContextMenu).to.be.defined;
        expect(wrapper.contextMenuInfo).to.be.defined;
        expect(wrapper.openContextMenu).to.be.defined;
        expect(wrapper.closeContextMenu).to.be.defined;
        expect(wrapper.contextMenuAction).to.be.defined;
        expect(wrapper.editDiagramHandler).to.be.defined;
        expect(wrapper.nodeEditHandler).to.be.defined;
        expect(wrapper.expandSuperNodeHandler).to.be.defined;
    });

    it('should render one <DialogEditor/> component', () => {
        const wrapper = createCommonCanvas();
        expect(wrapper.find(DiagramCanvas)).to.have.length(1);
    });

    it('should render one <Palette/> component', () => {
        const wrapper = createCommonCanvas();
        expect(wrapper.find(Palette)).to.have.length(1);
    });

    it('should render one <OverlayTrigger/> component', () => {
        const wrapper = createCommonCanvas();
        expect(wrapper.find(OverlayTrigger)).to.have.length(1);
    });

    it('should render a `.canvas-zoom-controls`', () => {
        const wrapper = createCommonCanvas();
        expect(wrapper.find('.canvas-zoom-controls')).to.have.length(1);
    });

});

function createCommonCanvas() {
    const stream = {};
    const initSel = {};
    const palJSON = {};
    const showContextMenu = true;
    const contextMenuInfo = {};
    const openContextMenu = sinon.spy();
    const closeContextMenu = sinon.spy();
    const contextMenuAction = sinon.spy();
    const editDiagHandler = sinon.spy();
    const nodeEditHandler = sinon.spy();
    const expandSuperNodeHandler = sinon.spy();
    const wrapper = shallow(<CommonCanvas
    stream={stream}
    initialSelection={initSel}
    paletteJSON={palJSON}
    showContextMenu={showContextMenu}
    contextMenuInfo={contextMenuInfo}
    openContextMenu={openContextMenu}
    closeContextMenu={closeContextMenu}
    contextMenuAction={contextMenuAction}
    editDiagramHandler={editDiagHandler}
    nodeEditHandler={nodeEditHandler}
    expandSuperNodeHandler={expandSuperNodeHandler}/>);

  return wrapper;
}
