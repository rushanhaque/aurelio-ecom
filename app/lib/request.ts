export async function request<T = any>(
  path: string,
  options: RequestInit = {},
) {
  if (
    typeof document !== "undefined" &&
    document.documentElement.dataset.frontendPreview === "true"
  ) {
    throw new Error(
      "This is a design preview. Online submissions will open when the site launches. Please contact Aurelio directly.",
    );
  }
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      "The service is temporarily unavailable. Please try again.",
    );
  }
  if (!res.ok) throw new Error(data.error || "Please try again.");
  return data as T;
}
