module.exports = function() {

  let testUrl = process.env.UI_TEST_URL;

  this.Given('I am on the test harness',function () {
    browser.url(testUrl);
  });
}
