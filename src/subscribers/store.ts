export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export interface Subscriber {
  email: string;
  status: SubscriberStatus;
  createdAt: Date;
  confirmedAt: Date | null;
}

/** Subscribers keyed by lower-cased email. */
export interface SubscriberStore {
  find(email: string): Promise<Subscriber | null>;
  save(subscriber: Subscriber): Promise<void>;
}

export class MemorySubscriberStore implements SubscriberStore {
  private readonly rows = new Map<string, Subscriber>();

  async find(email: string): Promise<Subscriber | null> {
    return this.rows.get(email.toLowerCase()) ?? null;
  }

  async save(subscriber: Subscriber): Promise<void> {
    this.rows.set(subscriber.email.toLowerCase(), { ...subscriber });
  }
}
