import { apiUrl } from "@/lib/api-base";
import { notifyApiError } from "@/lib/api-error";

export type ApiFetchInit = RequestInit & {
  /** Show the shared error toast on a non-OK response. Default true. */
  notify?: boolean;
};

export async function apiFetch(path: string, init?: ApiFetchInit) {
  const { notify = true, ...requestInit } = init ?? {};
  const response = await fetch(apiUrl(path), requestInit);

  if (!response.ok && notify) {
    await notifyApiError(response);
  }

  return response;
}
