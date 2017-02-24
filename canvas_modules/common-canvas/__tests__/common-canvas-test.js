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

        expect(JSON.stringify(wrapper.props().children[0].props.diagram)).to.be.not.undefined;
        expect(JSON.stringify(wrapper.props().children[0].props.initialSelection)).to.be.not.undefined;
        expect(JSON.stringify(wrapper.props().children[0].props.paletteJSON)).to.be.not.undefined;
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
    const diagram = {};
    const initialSelection = {};
    const paletteJSON = {};
    const contextMenuHandler = sinon.spy();
    const contextMenuActionHandler = sinon.spy();
    const editDiagramHandler = sinon.spy();
    const clickHandler = sinon.spy();
    const decorationHandler = sinon.spy();
    const wrapper = shallow(<CommonCanvas
      diagram={diagram}
      initialSelection={initialSelection}
      paletteJSON={paletteJSON}
      contextMenuHandler={contextMenuHandler}
      contextMenuActionHandler={contextMenuActionHandler}
      editDiagramHandler={editDiagramHandler}
      clickHandler={clickHandler}
      decorationHandler={decorationHandler}/>);

  return wrapper;
}
