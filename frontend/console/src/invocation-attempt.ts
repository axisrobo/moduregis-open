export type InvocationAttempt = {
  readonly idempotencyKey: string;
  reset(): string;
};

export function createInvocationAttempt(createKey: () => string = () => crypto.randomUUID()): InvocationAttempt {
  let idempotencyKey = createKey();
  return {
    get idempotencyKey() {
      return idempotencyKey;
    },
    reset() {
      idempotencyKey = createKey();
      return idempotencyKey;
    },
  };
}
