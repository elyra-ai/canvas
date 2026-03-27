# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 13.x    | :white_check_mark: |
| < 13.0  | :x:                |

Only the latest major version receives security updates. We strongly recommend keeping your installation up to date.

## Reporting a Vulnerability

We take the security of Elyra Canvas seriously. If you believe you have found a security vulnerability in Elyra Canvas or any of its sub-projects, please report it to us responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by **email**. Send details to **jesus.rocha@ibm.com**

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, CSRF, injection, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: We will acknowledge receipt of your vulnerability report within 3 business days
- **Status Updates**: We will send you regular updates about our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 90 days

### Disclosure Policy

- We follow the principle of coordinated disclosure
- We will work with you to understand and resolve the issue before any public disclosure
- We request that you do not publicly disclose the vulnerability until we have released a fix
- Once a fix is released, we will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)

## Security Best Practices

When using Elyra Canvas in your applications:

1. **Keep Dependencies Updated**: Regularly update to the latest version to receive security patches
2. **Content Security Policy**: Implement appropriate CSP headers when embedding canvas components
3. **Input Validation**: Always validate and sanitize user inputs before passing them to canvas APIs
4. **Authentication**: Implement proper authentication and authorization for canvas operations
5. **Data Sanitization**: Be cautious with user-provided pipeline definitions and node configurations

## Known Security Considerations

- **Pipeline Execution**: Pipeline definitions may contain executable code. Always validate and sanitize pipeline definitions from untrusted sources
- **Custom Nodes**: Custom node implementations should be reviewed for security vulnerabilities
- **Data Handling**: Be mindful of sensitive data in pipeline configurations and node properties

## Security Updates

Security updates will be released as patch versions and announced through:

- Release notes
- The project's main README

## Additional Resources

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](code-of-conduct.md)
- [Project Documentation](https://elyra-ai.github.io/canvas/)

Thank you for helping keep Elyra Canvas and its users safe!
