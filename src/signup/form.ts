/** Wires the sign-up form on the home page to POST /newsletter/subscribe. */
export function attachSignupForm(form: HTMLFormElement, status: HTMLElement, fetcher: typeof fetch = fetch): void {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const email = new FormData(form).get("email");
    if (button) button.disabled = true;
    status.textContent = "Signing you up…";
    try {
      const res = await fetcher("/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const { message } = (await res.json()) as { message: string };
      status.textContent = message;
      if (res.ok) form.reset();
    } catch {
      status.textContent = "Something went wrong. Please try again.";
    } finally {
      if (button) button.disabled = false;
    }
  });
}

const form = typeof document === "undefined" ? null : document.querySelector<HTMLFormElement>("#newsletter-form");
const status = typeof document === "undefined" ? null : document.querySelector<HTMLElement>("#newsletter-status");
if (form && status) attachSignupForm(form, status);
