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
        const config = {enablePalette: true};
        const wrapper = createCommonCanvas(config);

        expect(JSON.stringify(wrapper.props().children[0].props.diagram)).to.be.not.undefined;
        expect(JSON.stringify(wrapper.props().children[0].props.initialSelection)).to.be.not.undefined;
        expect(JSON.stringify(wrapper.props().children[0].props.paletteJSON)).to.be.not.undefined;
    });

    it('should render one <DialogEditor/> component', () => {
        const config = {};
        const wrapper = createCommonCanvas(config);
        expect(wrapper.find(DiagramCanvas)).to.have.length(1);
    });

    it('should render one <Palette/> component when Palette is enabled', () => {
        const config = {enablePalette: true};
        const wrapper = createCommonCanvas(config);
        expect(wrapper.find(Palette)).to.have.length(1);
    });

    it('should render one <OverlayTrigger/> component when Palette is enabled', () => {
        const config = {enablePalette: true};
        const wrapper = createCommonCanvas(config);
        expect(wrapper.find(OverlayTrigger)).to.have.length(1);
    });

    it('should not render any <Palette/> component when Palette is disabled', () => {
        const config = {enablePalette: false};
        const wrapper = createCommonCanvas(config);
        expect(wrapper.find(Palette)).to.have.length(0);
    });

    it('should not render any <OverlayTrigger/> component when Palette is disabled', () => {
        const config = {enablePalette: false};
        const wrapper = createCommonCanvas(config);
        expect(wrapper.find(OverlayTrigger)).to.have.length(0);
    });

    it('should render a `.canvas-zoom-controls`', () => {
        const config = {};
        const wrapper = createCommonCanvas(config);
        expect(wrapper.find('.canvas-zoom-controls')).to.have.length(1);
    });
});

function createCommonCanvas(config) {
    const diagram = {};
    const initialSelection = [];
    const paletteJSON = {};
    const contextMenuHandler = sinon.spy();
    const contextMenuActionHandler = sinon.spy();
    const editDiagramHandler = sinon.spy();
    const clickHandler = sinon.spy();
    const decorationActionHandler = sinon.spy();
    const wrapper = shallow(<CommonCanvas
      config={config}
      diagram={diagram}
      initialSelection={initialSelection}
      paletteJSON={paletteJSON}
      contextMenuHandler={contextMenuHandler}
      contextMenuActionHandler={contextMenuActionHandler}
      editDiagramHandler={editDiagramHandler}
      clickHandler={clickHandler}
      decorationActionHandler={decorationActionHandler}/>);

  return wrapper;
}
