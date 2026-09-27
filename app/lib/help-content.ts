export const pages: Record<
  string,
  {
    title: string;
    eyebrow: string;
    intro: string;
    sections: [string, string][];
  }
> = {
  shipping: {
    title: "A considered arrival.",
    eyebrow: "SHIPPING & DELIVERY",
    intro:
      "Delivery details will be confirmed before Aurelio opens for live orders.",
    sections: [
      [
        "Where will Aurelio deliver?",
        "Our intended launch includes India and selected international destinations. The supported countries, shipping partners and delivery times are still being finalized.",
      ],
      [
        "What happens in this preview?",
        "The checkout creates unpaid preview orders only. Its delivery amounts are illustrative. No parcel is dispatched and no carrier booking is made.",
      ],
      [
        "International duties & taxes",
        "Import charges, tax treatment and delivery terms will be displayed before live checkout is enabled. Do not rely on preview totals as a landed-cost quote.",
      ],
      [
        "Bulk & special deliveries",
        "For larger quantities, fragile consignments or project deliveries, use the bulk enquiry form. Packing, freight and timing will be considered as part of your proposal.",
      ],
    ],
  },
  returns: {
    title: "Here to help.",
    eyebrow: "RETURNS & REFUNDS",
    intro: "Clear terms are part of a considered experience.",
    sections: [
      [
        "Preview orders",
        "No money is collected and no goods are shipped in the current preview. There is therefore no payment to refund or physical item to return.",
      ],
      [
        "Live return policy",
        "Eligibility, request windows, return costs, damage reporting and custom-order exclusions must be finalized and published before live sales.",
      ],
      [
        "A question about an order?",
        "Contact the studio with your order reference. Never send card information or passwords through the contact form.",
      ],
    ],
  },
  care: {
    title: "A little care. A long life.",
    eyebrow: "CARING FOR YOUR OBJECTS",
    intro: "The right care starts with the material and its finish.",
    sections: [
      [
        "Start gently",
        "For routine dusting, use a clean, soft, dry cloth. Avoid rough pads and abrasive cleaners. Check the individual product’s instructions before applying water, polish or any treatment.",
      ],
      [
        "Brass & surface finishes",
        "Lacquered, plated, polished and unlacquered surfaces require different care. Do not apply metal polish unless the specific product guidance recommends it.",
      ],
      [
        "A place to belong",
        "Keep decorative objects on stable surfaces. Use a protective pad where appropriate and avoid prolonged exposure to moisture unless a product is designed for it.",
      ],
      [
        "Intended use matters",
        "Decorative bowls are not automatically food-safe, and decorative vases are not automatically watertight. Check each object’s stated use. Never leave burning candles unattended.",
      ],
    ],
  },
  faq: {
    title: "A little clarity.",
    eyebrow: "FREQUENTLY ASKED",
    intro: "The things you might be wondering.",
    sections: [
      [
        "When can I shop?",
        "The catalog is being prepared. Objects will appear as Aurelio adds them. Live payments and shipping must be connected before real purchases can begin.",
      ],
      [
        "Can I place a bulk enquiry?",
        "Yes. Use the bulk enquiry form for hospitality, retail, gifting or a bespoke project. Your enquiry is saved in the studio dashboard.",
      ],
      [
        "Can I customize a piece?",
        "Many pieces can be tailored in size, finish and material. Contact the atelier or submit a bespoke brief to discuss the possibilities.",
      ],
      [
        "What are your lead times?",
        "Lead times depend on the complexity of the commission and the current atelier schedule. An estimate is supplied with your quotation.",
      ],
      [
        "Is there a minimum order quantity?",
        "Bulk minimums depend on the object, finish and customization. Share an approximate quantity so the team can review it.",
      ],
      [
        "Can I shop without an account?",
        "Guest checkout is supported. Accounts bring orders placed while signed in together in one place.",
      ],
      [
        "Do you ship internationally?",
        "Aurelio arranges worldwide export from Moradabad. Shipping quotations depend on the piece and destination. Online checkout delivery, duties and supported destinations will be confirmed before live payments are enabled.",
      ],
      [
        "Are the photographs actual Aurelio products?",
        "The site combines imagery from the original Aurelio collections and material library with generated editorial visuals. Selected Works is an archive showcase. Purchasable products and their photography are added separately.",
      ],
    ],
  },
  privacy: {
    title: "Your privacy matters.",
    eyebrow: "PREVIEW PRIVACY NOTICE",
    intro:
      "This notice describes the current development preview. A complete business privacy policy is required before public launch.",
    sections: [
      [
        "What this preview stores",
        "Forms may store your name, email, enquiry, company and contact details in the application database. Accounts store a password hash and session records. Preview orders store order and delivery details. Avoid submitting sensitive or real customer data while testing.",
      ],
      [
        "Browser storage",
        "An essential session cookie keeps you signed in. Local storage remembers your bag, wishlist and selected currency. Session storage can hold a private order access key. No advertising trackers have been added.",
      ],
      [
        "Email preferences",
        "The newsletter form records your email and consent. No marketing emails are sent from this preview. An unsubscribe and consent-management workflow must be configured before any mailing starts.",
      ],
      [
        "Access & deletion requests",
        "Use the contact form to submit a privacy request. Aurelio is the atelier line of AF International in Moradabad. Contact info@aurelio.in for privacy questions. Retention periods, processors and applicable rights must be finalized before launch.",
      ],
    ],
  },
  terms: {
    title: "A clear understanding.",
    eyebrow: "PREVIEW TERMS",
    intro:
      "Aurelio is currently a development preview, not an operational online store.",
    sections: [
      [
        "No live purchases",
        "Preview checkout does not collect payment, create a shipping obligation or guarantee availability. Test order totals and delivery estimates are illustrative.",
      ],
      [
        "Editorial presentation",
        "Original Aurelio collection, material and archive imagery is presented alongside generated visual concepts. Editorial images do not establish inventory, product specifications or certification.",
      ],
      [
        "Bulk enquiries",
        "Submitting a brief is a request for a conversation. A confirmed commercial proposal and agreed terms are required before any bulk order.",
      ],
      [
        "Before public launch",
        "The governing terms, pricing and tax disclosures, fulfillment commitments, return policy, grievance contact and applicable consumer protections must be confirmed and published.",
      ],
    ],
  },
  accessibility: {
    title: "Beauty, open to everyone.",
    eyebrow: "ACCESSIBILITY",
    intro: "A considered experience should be comfortable to use.",
    sections: [
      [
        "How this site is designed",
        "The interface uses semantic page structure, labeled controls, visible keyboard focus, modal focus management and alternatives to hover interaction. Touch controls are sized for smaller screens.",
      ],
      [
        "Motion preferences",
        "Scroll effects respect the reduced-motion setting on your device. Core content remains available without animation.",
      ],
      [
        "An ongoing practice",
        "We are testing keyboard navigation, zoom, contrast, screen reader structure and mobile layouts. This is not a claim of audited WCAG compliance. Please use the contact form if something makes the site difficult to use.",
      ],
    ],
  },
};
