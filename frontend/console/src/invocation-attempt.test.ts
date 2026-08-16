import { describe, expect, test } from "vitest";
import { createInvocationAttempt } from "./invocation-attempt";

describe("invocation attempt", () => {
  test("preserves the idempotency key for retries until explicitly reset", () => {
    const keys = ["first-key", "second-key"];
    const attempt = createInvocationAttempt(() => keys.shift()!);

    expect(attempt.idempotencyKey).toBe("first-key");
    expect(attempt.idempotencyKey).toBe("first-key");
    expect(attempt.reset()).toBe("second-key");
    expect(attempt.idempotencyKey).toBe("second-key");
  });
});
