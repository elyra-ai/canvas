import React, { useRef, useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { CommonCanvas, CanvasController } from '@elyra/canvas';
import { Toggle } from '@carbon/react';
import flowData from './pipeline-flow.json';
import paletteData from './palette.json';
import '@elyra/canvas/dist/styles/common-canvas.min.css';
import './App.scss';

function App() {
  const title = "{{APP_TITLE}}";
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const canvasController = useRef(new CanvasController());

  useEffect(() => {
    canvasController.current.setPipelineFlow(flowData);
    canvasController.current.setPipelineFlowPalette(paletteData);
    canvasController.current.openPalette();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-carbon-theme',
      isDarkTheme ? 'g90' : 'g10'
    );
  }, [isDarkTheme]);

  const canvasConfig = {
    enablePaletteLayout: "Flyout",
    enableToolbarLayout: "Top",
    enableKeyboardNavigation: true,
    enableNodeFormatType: "{{NODE_FORMAT}}",
    enableContextToolbar: {{USE_CONTEXT_TOOLBAR}},
    enableLinkType: "{{LINK_TYPE}}",
    enableSnapToGridType: "{{SNAP_TO_GRID}}"
  };

  return (
    <IntlProvider locale="en">
      <div className="App">
        <div className="header">
          <h1>{title}</h1>
          <div className="theme-toggle">
            <Toggle
              id="theme-toggle"
              labelText="Theme"
              labelA="Light"
              labelB="Dark"
              toggled={isDarkTheme}
              onToggle={(checked) => setIsDarkTheme(checked)}
              size="sm"
            />
          </div>
        </div>
        <div className="canvas-container">
          <CommonCanvas
            canvasController={canvasController.current}
            config={canvasConfig}
          />
        </div>
      </div>
    </IntlProvider>
  );
}

export default App;
