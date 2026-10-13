import { brand, shopLink, shopIsExternal } from "../lib/brand";
import { Link } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowUpRight } from "lucide-react";
import { useStore } from "../lib/store";

/* The menu panel. Loaded on demand (see GlobalPanels in layout.tsx) so the
   dialog machinery is not part of every first paint. */
const links: [string, string][] = [
  ["/bulk-orders#enquire", "Start an enquiry"],
  ["/collections", "Collections"],
  ["/bulk-orders#material-atelier", "Materials & finishes"],
  ["/bulk-orders#process", "How we work"],
  ["/contact?topic=Catalogue%20request", "Request a catalogue"],
  ["/about", "About us"],
  ["/contact", "Contact us"],
  ["/faq", "FAQ"],
  ["/journal", "Journal"],
];

export default function Panels() {
  const { panel, setPanel } = useStore();
  return (
    <Dialog.Root
      open={panel !== null}
      onOpenChange={(open) => !open && setPanel(null)}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="panel-overlay" />
        <Dialog.Content className="side-panel menu-panel">
          <div className="panel-heading">
            <Dialog.Title>AURELIO</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close panel">
              <X size={22} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Explore Aurelio pages.
          </Dialog.Description>
          <div className="mobile-navigation">
            {links.map(([to, label]) => (
              <Link to={to} key={to}>
                {label}
                <ArrowUpRight size={22} />
              </Link>
            ))}
            <a
              href={shopLink}
              {...(shopIsExternal && { target: "_blank", rel: "noopener" })}
            >
              Visit the shop
              <ArrowUpRight size={22} />
            </a>
            <div className="menu-utilities">
              <a href={brand.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp the trade desk
              </a>
              <Link to="/">Aurelio home</Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
