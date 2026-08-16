export type PublicationAttempt = {
  readonly auditEventID: string;
  reset(): string;
};

export function createPublicationAttempt(createKey: () => string = () => crypto.randomUUID()): PublicationAttempt {
  let auditEventID = createKey();
  return {
    get auditEventID() {
      return auditEventID;
    },
    reset() {
      auditEventID = createKey();
      return auditEventID;
    },
  };
}
