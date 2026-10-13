import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
/* What every page shares: the menu panel and the toast. (The retail bag,
   wishlist and currency went with the shop, which now lives on Shopify.) */
type Store = {
  panel: "menu" | null;
  setPanel: (p: "menu" | null) => void;
  notice: string;
  notify: (s: string) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Store["panel"]>(null),
    [notice, notify] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => notify(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  return (
    <Context.Provider value={{ panel, setPanel, notice, notify }}>
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("Store context is missing");
  return store;
}
export async function request<T = any>(
  path: string,
  options: RequestInit = {},
) {
  if (typeof document !== "undefined" && document.documentElement.dataset.frontendPreview === "true") {
    throw new Error("This is a design preview. Online submissions will open when the site launches. Please contact Aurelio directly.");
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
