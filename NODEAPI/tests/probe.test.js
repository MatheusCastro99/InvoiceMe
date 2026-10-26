/**
 * Temporary CI failure probe (#72). Reverted in the next commit.
 */

it("fails on purpose", () => {
  expect(1).toBe(2);
});
