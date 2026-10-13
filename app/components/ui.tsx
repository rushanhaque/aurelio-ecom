import { Link } from "react-router";
import { ArrowUpRight, ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Words } from "./motion-text";
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
  // Catalogue photographs ship at two sizes only.
  if (name.startsWith("catalogue/"))
    return (
      <img
        className={className}
        src={`/images/${name}-960.webp`}
        srcSet={`/images/${name}-480.webp 480w, /images/${name}-960.webp 960w`}
        sizes={sizes}
        alt={alt}
        width={960}
        height={960}
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
export function PageIntro({
  title,
  image,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  /* With an image the intro becomes a full-bleed hero under a clear header. */
  image?: string;
  children?: ReactNode;
}) {
  if (image)
    return (
      <header className="page-hero">
        <Picture name={image} alt="" sizes="100vw" eager />
        <div className="page-hero-veil" aria-hidden="true" />
        <div className="page-hero-body container">
          <h1>
            <Words>{title}</Words>
          </h1>
          {children && <div className="page-hero-copy">{children}</div>}
        </div>
      </header>
    );
  return (
    <header className="page-intro container">
      <h1>
        <Words>{title}</Words>
      </h1>
      {children && <div className="intro-copy">{children}</div>}
    </header>
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
      <Link to="/" className="text-link">
        Back to Aurelio
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

/* A bulk-enquiry piece from the aurelio.in catalogue: no price, no bag, an
   enquiry. */
export type PieceSummary = {
  slug: string;
  name: string;
  suffix: string;
  material: string;
  finish: string;
  image: string;
  index: string;
};
export function PieceCard({ piece }: { piece: PieceSummary }) {
  return (
    <article className="product-card piece-card">
      <div className="product-image">
        <Link
          to={`/pieces/${piece.slug}`}
          viewTransition
          aria-label={`${piece.name} ${piece.suffix}`}
        >
          <img
            src={`${piece.image}-480.webp`}
            srcSet={`${piece.image}-480.webp 480w, ${piece.image}-960.webp 960w`}
            sizes="(max-width: 600px) 48vw, (max-width: 1000px) 32vw, 24vw"
            alt={`${piece.name} ${piece.suffix}, ${piece.material.toLowerCase()}`}
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
          />
        </Link>
        <Link
          className="quick-add"
          to={`/bulk-orders?product=${encodeURIComponent(`${piece.name} ${piece.suffix}`)}`}
          aria-label={`Enquire about the ${piece.name} ${piece.suffix}`}
        >
          <ArrowUpRight size={16} />
          <span>Enquire</span>
        </Link>
      </div>
      <div className="product-caption">
        <div>
          <Link
            to={`/pieces/${piece.slug}`}
            viewTransition
            className="product-name"
          >
            {piece.name} <em>{piece.suffix}</em>
          </Link>
          <p>
            {piece.material} · {piece.finish}
          </p>
        </div>
        <span className="product-price piece-tag">Bulk</span>
      </div>
    </article>
  );
}
