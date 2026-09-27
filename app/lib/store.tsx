import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  currencies,
  type Product,
  type Currency,
  type CartLine,
} from "./catalog";
type Store = {
  products: Product[];
  cart: CartLine[];
  wishlist: string[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  add: (id: string, quantity?: number) => void;
  quantity: (id: string, n: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  panel: "cart" | "search" | "menu" | null;
  setPanel: (p: "cart" | "search" | "menu" | null) => void;
  notice: string;
  notify: (s: string) => void;
  ready: boolean;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const [cart, setCart] = useState<CartLine[]>([]),
    [wishlist, setWishlist] = useState<string[]>([]),
    [currency, setCurrency] = useState<Currency>("INR"),
    [panel, setPanel] = useState<Store["panel"]>(null),
    [notice, notify] = useState(""),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("aurelio-store") || "{}");
      if (Array.isArray(data.cart))
        setCart(
          data.cart.filter(
            (l: any) =>
              products.some((p) => p.id === l.productId) &&
              Number.isInteger(l.quantity) &&
              l.quantity > 0 &&
              l.quantity <= 50,
          ),
        );
      if (Array.isArray(data.wishlist))
        setWishlist(
          data.wishlist.filter((id: any) => products.some((p) => p.id === id)),
        );
      if (currencies.includes(data.currency)) setCurrency(data.currency);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(
          "aurelio-store",
          JSON.stringify({ cart, wishlist, currency }),
        );
      } catch {}
  }, [cart, wishlist, currency, ready]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => notify(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  function quantity(id: string, n: number) {
    const p = products.find((p) => p.id === id);
    if (!p) return;
    setCart((lines) =>
      n <= 0
        ? lines.filter((l) => l.productId !== id)
        : lines.map((l) =>
            l.productId === id
              ? { ...l, quantity: Math.min(n, p.stock, 50) }
              : l,
          ),
    );
  }
  function add(id: string, n = 1) {
    const p = products.find((p) => p.id === id);
    if (!p || !p.stock) return;
    setCart((lines) => {
      const exists = lines.find((l) => l.productId === id);
      return exists
        ? lines.map((l) =>
            l.productId === id
              ? { ...l, quantity: Math.min(l.quantity + n, p.stock, 50) }
              : l,
          )
        : [...lines, { productId: id, quantity: Math.min(n, p.stock, 50) }];
    });
    setPanel("cart");
  }
  function toggleWish(id: string) {
    const exists = wishlist.includes(id);
    setWishlist((ids) => (exists ? ids.filter((i) => i !== id) : [...ids, id]));
    notify(
      exists
        ? "Removed from your saved objects."
        : "An object worth keeping. Saved to your wishlist.",
    );
  }
  return (
    <Context.Provider
      value={{
        products,
        cart: cart.filter((line) =>
          products.some((product) => product.id === line.productId),
        ),
        wishlist,
        currency,
        setCurrency,
        add,
        quantity,
        remove: (id) => setCart((l) => l.filter((p) => p.productId !== id)),
        clear: () => setCart([]),
        toggleWish,
        panel,
        setPanel,
        notice,
        notify,
        ready,
      }}
    >
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
    throw new Error("This is a design preview. Online submissions will open when the store launches. Please contact Aurelio directly.");
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
