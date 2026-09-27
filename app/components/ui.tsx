import { Link } from "react-router";
import {
  ArrowUpRight,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  Check,
} from "lucide-react";
import { useStore } from "../lib/store";
import { money, type Product } from "../lib/catalog";
import { useEffect, useRef, type ReactNode } from "react";
export function Picture({
  name,
  alt,
  className = "",
  eager = false,
  sizes = "(max-width: 600px) 90vw, 50vw",
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  if (name.startsWith("/uploads/"))
    return (
      <img
        className={className}
        src={name}
        alt={alt}
        width={1200}
        height={1200}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  return (
    <img
      className={className}
      src={`/images/${name}-800.webp`}
      srcSet={`/images/${name}-480.webp 480w, /images/${name}-800.webp 800w, /images/${name}-1440.webp 1440w`}
      sizes={sizes}
      alt={alt}
      width={name === "hero" || name === "craft" ? 1536 : 1024}
      height={1024}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
    />
  );
}
export function TextLink({
  to,
  children,
  light = false,
}: {
  to: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={`text-link ${light ? "light" : ""}`} to={to}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { wishlist, toggleWish, currency, add } = useStore();
  return (
    <article className="product-card" data-reveal>
      <div className="product-image">
        <Link
          to={`/products/${product.slug}`}
          aria-label={`Discover ${product.name}`}
        >
          <Picture
            name={product.image}
            alt={`${product.name} in ${product.finish}`}
            sizes="(max-width: 600px) 48vw, (max-width: 1000px) 45vw, 24vw"
          />
        </Link>
        <span className="object-number">
          OBJECT {String(index + 1).padStart(2, "0")}
        </span>
        <button
          className={`icon-button save-button ${wishlist.includes(product.id) ? "saved" : ""}`}
          onClick={() => toggleWish(product.id)}
          aria-label={`${wishlist.includes(product.id) ? "Unsave" : "Save"} ${product.name}`}
          aria-pressed={wishlist.includes(product.id)}
        >
          <Heart
            size={17}
            fill={wishlist.includes(product.id) ? "currentColor" : "none"}
          />
        </button>
        <button
          className="quick-add"
          disabled={!product.stock}
          onClick={() => add(product.id)}
          aria-label={`Add ${product.name} to bag`}
        >
          <Plus size={16} />
          <span>{product.stock ? "Add to bag" : "Unavailable"}</span>
        </button>
      </div>
      <div className="product-caption">
        <div>
          <Link to={`/products/${product.slug}`} className="product-name">
            {product.name}
          </Link>
          <p>{product.finish}</p>
        </div>
        <span className="product-price">
          {money(product.prices[currency], currency)}
        </span>
      </div>
    </article>
  );
}
export function Quantity({
  value,
  onChange,
  max = 50,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="quantity-control">
      <button
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-intro container">
      <p className="eyebrow">
        <span className="tiny-star">✳</span>
        {eyebrow}
      </p>
      <h1>{title}</h1>
      {children && <div className="intro-copy">{children}</div>}
    </header>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-star">✳</span>
      <h2>{title}</h2>
      <p>{children}</p>
      <Link to="/shop" className="button">
        Explore the collection
        <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
export function Success({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const region = useRef<HTMLDivElement>(null);
  useEffect(() => {
    region.current?.focus();
  }, []);
  return (
    <div className="success-state" ref={region} tabIndex={-1} role="status">
      <span className="success-icon">
        <Check size={25} />
      </span>
      <h2>{title}</h2>
      <div>{children}</div>
      <Link to="/shop" className="text-link">
        Back to the collection
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
export function Field({
  label,
  name,
  type = "text",
  required = true,
  defaultValue,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {!required && <small> (optional)</small>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}
export function Arrow() {
  return <ArrowUpRight size={18} />;
}
