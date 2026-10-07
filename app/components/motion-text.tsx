import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/* <Words> — the house heading reveal, after the original Aurelio SplitText.
   Every word rises out of its own mask. It is rendered on the server, so the
   heading reads normally before any script runs; the motion layer only hides
   the words of headings still below the fold, and the reveal is a CSS
   transition (atelier-story.css), so no animation library is needed for it.

   It accepts mixed content — strings, <em>, <br/> — and keeps the elements,
   splitting only the text inside them. Words are numbered across the whole
   heading so the stagger runs straight through an <em>. */
export function Words({ children }: { children: ReactNode }) {
  let index = 0;
  const split = (node: ReactNode): ReactNode => {
    if (typeof node === "string" || typeof node === "number") {
      const parts = String(node).split(/(\s+)/);
      return parts.map((part, i) => {
        if (!part) return null;
        if (/^\s+$/.test(part)) return " ";
        const n = index++;
        return (
          <span className="w" key={i}>
            <span style={{ "--i": n } as CSSProperties}>{part}</span>
          </span>
        );
      });
    }
    if (Array.isArray(node))
      return node.map((child, i) => <Fragment key={i}>{split(child)}</Fragment>);
    if (isValidElement(node)) {
      const element = node as ReactElement<{ children?: ReactNode }>;
      if (element.type === Fragment)
        return <>{split(element.props.children)}</>;
      if (element.props.children === undefined) return element;
      return cloneElement(
        element,
        undefined,
        Children.map(element.props.children, split),
      );
    }
    return node;
  };
  // The spaces stay real text between the masks, so the heading still reads
  // (and is indexed) as one sentence.
  return <>{split(children)}</>;
}
