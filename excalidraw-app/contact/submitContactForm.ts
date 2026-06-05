import type {
  ContactFormPayload,
  ContactFormResponse,
} from "./contactFormTypes";

export const CONTACT_FORM_LIMITS = {
  name: 120,
  subject: 30,
  message: 2000,
  email: 254,
} as const;

export { validateContactForm } from "./contactFormValidation";

export type { ContactFormErrorCode } from "./contactFormValidation";

const parseContactFormResponse = (text: string): ContactFormResponse | null => {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    const data = JSON.parse(trimmed) as ContactFormResponse;
    if (data && typeof data.ok === "boolean") {
      return data;
    }
  } catch {
    return null;
  }
  return null;
};

const buildBody = (payload: ContactFormPayload): string =>
  JSON.stringify({
    name: payload.name.trim(),
    subject: payload.subject.trim(),
    email: payload.email.trim(),
    message: payload.message.trim(),
    website: payload.website ?? "",
  });

/**
 * Apps Script web apps answer POST with a 302; the JSON body is on a follow-up GET.
 * fetch(..., redirect: "follow") often keeps POST on the redirect → 405 in strict clients.
 */
export const submitContactForm = async (
  url: string,
  payload: ContactFormPayload,
): Promise<ContactFormResponse> => {
  const body = buildBody(payload);
  const headers = { "Content-Type": "text/plain;charset=utf-8" };

  const first = await fetch(url, {
    method: "POST",
    redirect: "manual",
    headers,
    body,
  });

  const redirectUrl = first.headers.get("Location");
  if (
    redirectUrl &&
    (first.status === 302 || first.status === 303 || first.status === 307)
  ) {
    const second = await fetch(redirectUrl, {
      method: "GET",
      redirect: "follow",
    });
    const parsed = parseContactFormResponse(await second.text());
    if (parsed) {
      return parsed;
    }
  }

  const direct = parseContactFormResponse(await first.text());
  if (direct) {
    return direct;
  }

  return {
    ok: false,
    error: "sendFailed",
  };
};
