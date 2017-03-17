module.exports = function() {

  this.Given('I have opened the app side panel', function () {
         var actionSidebar = browser.$('#action-bar-sidepanel');
         actionSidebar.click('a');
  });

}
