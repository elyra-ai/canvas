# Testing Guidelines for Development
## Unit Testing
The Canvas unit tests are automated with the primary purpose of providing rapid feedback to the developers.  The test cases are run during every development build.   Unit test cases are written using Jest [Jest Tutorial](https://facebook.github.io/jest/docs/en/tutorial-react.html).  The test cases should be written and delivered at the time that a feature or enhancement is delivered.

Unit test cases should focus on good coverage of a function/service.  We are current investigating code coverage analysis tools and will update this doc when it is implemented.

Unit test case coverage should focus on these areas:

   * All APIs and all UI elements.
   * All component properties.
   * A variety of input data.

Here is a good blog on [JavaScript Unit Testing](https://medium.com/javascript-scene/what-every-unit-test-needs-f6cd34d9836d)


## Functional Testing
The Canvas Functional Test cases will be automated and run during code delivery.  The function test case will be automated and written using [Cypress](https://docs.cypress.io).

Functional Testing coverage includes the following types of tests.

* Core functionality
* Inter-operate with other Canvas elements.
* Need to test both forward and backwards compatibility
* Negative / bounds
* Globalization / Localization
      * Handling of all strings using UTF-8
      * Verifying non-English unicode data is handled appropriately
      * Externalizing all strings that may be presented for the user (e.g., error messages, UI labels, etc.)
* Access control security (roles / permissions / tenant management)
* Malicious and security (code scans such as AppScan, ethical hacking)
* Accessibility for UI

## Debugging Tests

### Jest tests (unit)
https://facebook.github.io/jest/docs/troubleshooting.html

**With node 8 or newer**

- Add `debugger;` statement to your Jest test suite program where you want to stop and begin debugging.
- If you want to run just a single test within your test program (rather than all of them) temporarily change the it() method for the test to be it.only(). For example, change:

    `it("should add a node", () => { ... })`

    to be:

    `it.only("should add a node", () => { ... })`

- In the console enter: `npm run debug` or `npm run debug <test suite name>`
- Open Chrome debugging tools by pasting this into the Chrome address field: [chrome://inspect/](chrome://inspect#devices)
- You should see a 'remote' target for `node_modules/.bin/jest`. Click on the `inspect` link below it.
- Click on sources and then click the play button (right pointing blue triangle icon).
- The code should run to the point where your debugger statement was added.
