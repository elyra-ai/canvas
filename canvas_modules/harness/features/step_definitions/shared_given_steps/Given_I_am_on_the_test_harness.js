module.exports = function() {

  let testUrl = process.env.TESTURL;

  this.Given('I am on the test harness',function () {
    browser.url(testUrl);
  });
}
