export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

/** The email that asks a new subscriber to confirm, with the link that does it. */
export function confirmationMail(email: string, link: string, ttlHours: number): Mail {
  return {
    to: email,
    subject: "Confirm your subscription",
    text: [
      "Thanks for signing up to the demo newsletter.",
      `Confirm your address within ${ttlHours} hours by opening this link:`,
      link,
      "",
      "If you didn't sign up, ignore this email and you won't hear from us again.",
    ].join("\n"),
  };
}
