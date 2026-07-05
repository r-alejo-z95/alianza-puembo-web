import test from "node:test";
import assert from "node:assert/strict";

async function loadResolver() {
  try {
    const flow = await import("../lib/forms/public-form-flow.mjs");
    return flow.resolveSubmitDestination;
  } catch {
    return undefined;
  }
}

const publicSteps = [
  { section: { id: "registration" }, fields: [] },
  { section: { id: "virtual-notification" }, fields: [] },
];

test("public finalize navigates to the notification step before submission", async () => {
  const resolveSubmitDestination = await loadResolver();
  assert.equal(typeof resolveSubmitDestination, "function");
  assert.deepEqual(
    resolveSubmitDestination({
      isInternal: false,
      steps: publicSteps,
      currentStep: 0,
      jumpTargetId: "submit",
    }),
    { type: "step", stepIndex: 1 },
  );
});

test("public notification step permits the final submission", async () => {
  const resolveSubmitDestination = await loadResolver();
  assert.equal(typeof resolveSubmitDestination, "function");
  assert.deepEqual(
    resolveSubmitDestination({
      isInternal: false,
      steps: publicSteps,
      currentStep: 1,
      jumpTargetId: "submit",
    }),
    { type: "submit" },
  );
});

test("internal finalize submits immediately", async () => {
  const resolveSubmitDestination = await loadResolver();
  assert.equal(typeof resolveSubmitDestination, "function");
  assert.deepEqual(
    resolveSubmitDestination({
      isInternal: true,
      steps: [{ section: { id: "internal" }, fields: [] }],
      currentStep: 0,
      jumpTargetId: "submit",
    }),
    { type: "submit" },
  );
});
