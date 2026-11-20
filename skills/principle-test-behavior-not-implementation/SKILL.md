---
name: principle-test-behavior-not-implementation
description: "Apply when you write, change, or keep a test. Assert the result or effect its users can observe, including required absence. Check that a relevant defect fails the test and an internal refactor does not."
hide: true
---

# Test behavior, not implementation

A test is a claim about what users of the code can observe through its interface: return values, errors, state they can read back, and effects on outside systems. Private helpers, internal call order, and intermediate data are implementation.

Judge each test against two imagined edits:

- **Break the behavior** (a wrong value, a skipped or doubled effect). If the test still passes, it proves nothing. The usual causes are a loose assertion, an expected value computed by the code under test, and an assertion on data the test built itself.
- **Change the internals** and keep every observable result. If the test fails, it is pinned to the implementation.

Keep a test that catches the first edit and survives the second. Rewrite or delete the rest. Drive the code through its users' interface with a concrete input and derive the expected value from the requirement. What an external service receives is behavior. A call to an internal helper is not.

Judge the complete setup. Where practical, introduce the defect and confirm the check detects it. An untouched fixture or a prompt string that never reaches its consumer is not proof. The contract decides whether to assert an exact value, absence, an error message, or an invariant; do not pin incidental values. A mutation that produces the forbidden effect can prove detection without a positive case in the same test.
