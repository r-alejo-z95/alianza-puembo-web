export const NOTIFICATION_STEP_ID = "virtual-notification";

export function resolveSubmitDestination({
  isInternal,
  steps = [],
  currentStep,
  jumpTargetId,
}) {
  if (jumpTargetId !== "submit") return { type: "continue" };
  if (isInternal) return { type: "submit" };

  const notificationStepIndex = steps.findIndex(
    (step) =>
      (step?.section?.id || step?.section?._id) === NOTIFICATION_STEP_ID,
  );

  if (
    notificationStepIndex === -1 ||
    notificationStepIndex === currentStep
  ) {
    return { type: "submit" };
  }

  return { type: "step", stepIndex: notificationStepIndex };
}
