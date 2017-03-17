module.exports = function() {

  let testUrl = 'http://localhost:3001';

  this.Given(/^I have visited canvas test harness$/,function () {
    browser.url(testUrl);
  });

  this.Then('I create a new comment', function () {
    browser.rightClick(".svg-canvas",200,450);
    var contextMenu = browser.$(".context-menu-popover");
    contextMenu.$$('.react-context-menu-item')[0].$('.react-context-menu-link').click();
  });

  this.Then('I add the value "$string"', function (commentValue) {
    browser.doubleClick("textarea");
    browser.setValue("textarea", commentValue);
    browser.pause(500);
    browser.leftClick("#canvas-div",400,400);
  });

  this.Then('I see the comment value "$string"', function (commentValue) {
    expect(browser.getValue("textarea")).toBe(commentValue);
  });

  this.Then('In the internal object model I see the comment value "$string"', function (commentValue) {

         // Write code here that turns the phrase above into concrete actions
         // get the internal object model from the test harness
         // find the new comment that was inserted.
         // extract the value from the new comment
         // compare to the commentValue argument
         return 'pending';
  });
}
