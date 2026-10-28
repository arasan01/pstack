---
name: principle-test-behavior-not-implementation
description: "Apply when you write, change, or keep a test. Assert the result or effect its users can observe, including required absence. Check that a relevant defect fails the test and an internal refactor does not."
hide: true
---

# Test behavior, not implementation

A test claims something about what a caller, end user, or another service can observe through its interface: return values, errors, readable state, requests, writes, or messages. Private helpers, internal call order, and intermediate data are implementation.

Judge the complete arrangement, including shared setup, against two edits:

- Break the behavior. Name a relevant defect, such as a wrong result, a skipped effect, or a duplicate effect. The test must detect it. Where practical, introduce it temporarily and observe the failure.
- Change the internals while preserving every required result and effect. The test should still pass.

Keep a test that catches the first edit and survives the second. Drive the subject through its users' interface with a concrete input. Derive the expectation from the requirement, not from the same code path as the actual value. A restated source constant, prompt string, or untouched fixture does not exercise the consumer that reads it.

The contract decides, not the assertion's syntax:

- `toBeDefined` detects a missing result but accepts a wrong one. Check the particular result when correctness requires it.
- Keep absence assertions when absence is required. Exercise a denied operation and check that it sends no email. A temporary defect that sends one can prove detection; a positive case need not be in the same test.
- A mocked external service's payload is observable behavior. Calling an internal helper is not. Checking only that a substitute ran is insufficient when its payload or resulting state defines correctness.
- Keep fixed-value checks for an explicit user-facing contract, such as a promised default or required instruction. Name that contract and the defect a changed value causes. Do not pin incidental wording.
- Keep comparisons between results when disagreement exposes the identified defect. An expectation computed through the same faulty path can confirm itself.
- An invariant or compile-time type check can express a consumer contract. Name the failure it prevents rather than calling every internal relationship behavior.

Rewrite or delete tests that exercise nothing relevant or assert nothing meaningful.
