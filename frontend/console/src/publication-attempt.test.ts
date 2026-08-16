import { describe, expect, test } from "vitest";
import { createPublicationAttempt } from "./publication-attempt";

describe("publication attempt", () => {
  test("preserves the audit event ID for retries until explicitly reset", () => {
    const keys = ["publication-1", "publication-2"];
    const attempt = createPublicationAttempt(() => keys.shift()!);

    expect(attempt.auditEventID).toBe("publication-1");
    expect(attempt.auditEventID).toBe("publication-1");
    expect(attempt.reset()).toBe("publication-2");
    expect(attempt.auditEventID).toBe("publication-2");
  });
});
