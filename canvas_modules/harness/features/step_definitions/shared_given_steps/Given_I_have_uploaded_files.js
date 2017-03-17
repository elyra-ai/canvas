module.exports = function() {
  let baseFileDir = process.env.BASE_FILE_DIR;

  this.Then('I have uploaded diagram "$string"', function (diagramFile) {
         var canvasInput = browser.$('#canvasFileInput');
         browser.pause(500);
         // this will not work with relative paths
         canvasInput.setValue(baseFileDir+diagramFile);
         browser.$('.canvasField').click('a');
  });

  this.Then('I have uploaded palette "$string"', function (paletteFile) {
         var paletteInput = browser.$('#paletteJsonInput');
         browser.pause(500);
         // this will not work with relative paths
         paletteInput.setValue(baseFileDir+paletteFile);
         browser.$('#sidepanel-palette-input').click('a');
  });
}
