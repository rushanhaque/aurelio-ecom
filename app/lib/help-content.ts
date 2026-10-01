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
    title: "Shipping & delivery",
    eyebrow: "DELIVERY",
    intro: "Delivery details are confirmed before live orders open.",
    sections: [
      [
        "Where we deliver",
        "India and selected countries. Partners and delivery times are still being finalised.",
      ],
      [
        "This preview",
        "Preview orders are unpaid. Delivery amounts are illustrative, and no shipping takes place.",
      ],
      [
        "Duties & taxes",
        "Import charges and delivery terms will be shown before live checkout.",
      ],
      [
        "Bulk deliveries",
        "For large or fragile orders, send a bulk enquiry. Packing and freight are quoted with your proposal.",
      ],
    ],
  },
  returns: {
    title: "Returns & refunds",
    eyebrow: "RETURNS",
    intro: "Clear terms, kept simple.",
    sections: [
      [
        "Preview orders",
        "No money is taken and nothing ships, so there is nothing to refund or return.",
      ],
      ["Live policy", "Our return terms will be published before live sales."],
      [
        "Order questions",
        "Contact us with your order reference. Never send card details or passwords.",
      ],
    ],
  },
  care: {
    title: "Care",
    eyebrow: "CARE",
    intro: "Care starts with the material and its finish.",
    sections: [
      [
        "Start gently",
        "Dust with a soft, dry cloth. Avoid abrasive cleaners. Check each product's instructions first.",
      ],
      [
        "Brass & finishes",
        "Lacquered, plated and raw surfaces need different care. Don't use metal polish unless advised.",
      ],
      ["Placement", "Keep pieces on stable surfaces, away from moisture."],
      [
        "Intended use",
        "Decorative bowls aren't always food-safe, and vases aren't always watertight. Never leave candles unattended.",
      ],
    ],
  },
  faq: {
    title: "FAQ",
    eyebrow: "FAQ",
    intro: "Quick answers.",
    sections: [
      [
        "When can I shop?",
        "The catalogue is being prepared. Live payments open once shipping is connected.",
      ],
      [
        "Can I place a bulk enquiry?",
        "Yes. Use the bulk enquiry form for hospitality, retail, gifting or bespoke work.",
      ],
      [
        "Can I customize a piece?",
        "Many pieces can change in size, finish and material. Send us a brief.",
      ],
      [
        "What are your lead times?",
        "They depend on the piece. An estimate comes with your quotation.",
      ],
      [
        "Is there a minimum order quantity?",
        "It depends on the piece and finish. Share a rough quantity and we'll advise.",
      ],
      [
        "How do I care for my piece?",
        "Each material differs. Living finishes patinate over time. See the care guide.",
      ],
      [
        "Do you offer trade orders?",
        "Yes. Many pieces are made to order. Request a quotation or send a bulk enquiry.",
      ],
      ["Can I shop without an account?", "Yes. Guest checkout is available."],
      [
        "Do you ship internationally?",
        "Yes. We arrange worldwide export from Moradabad. Quotes depend on the piece and destination.",
      ],
      [
        "Are the photographs real products?",
        "Some images are editorial. Product photography is added separately.",
      ],
    ],
  },
  privacy: {
    title: "Privacy policy",
    eyebrow: "PRIVACY",
    intro:
      "This covers the current preview. A full policy is required before launch.",
    sections: [
      [
        "What we store",
        "Forms store your name, email and message. Accounts store a password hash. Avoid submitting real customer data while testing.",
      ],
      [
        "Browser storage",
        "A session cookie keeps you signed in. Local storage remembers your bag, wishlist and currency. No advertising trackers.",
      ],
      [
        "Email",
        "The newsletter form records your email and consent. No marketing emails are sent from this preview.",
      ],
      [
        "Your requests",
        "For access or deletion, use the contact form or email info@aurelio.in.",
      ],
    ],
  },
  terms: {
    title: "Terms & conditions",
    eyebrow: "TERMS",
    intro: "Aurelio is currently a preview, not a live store.",
    sections: [
      [
        "No live purchases",
        "Preview checkout takes no payment and promises no availability. Totals and delivery estimates are illustrative.",
      ],
      [
        "Images",
        "Some imagery is editorial. It doesn't confirm stock or specifications.",
      ],
      [
        "Bulk enquiries",
        "A brief starts a conversation. A bulk order needs a confirmed proposal and agreed terms.",
      ],
      [
        "Before launch",
        "Final terms, pricing, tax and return policy will be published.",
      ],
    ],
  },
  accessibility: {
    title: "Accessibility",
    eyebrow: "ACCESSIBILITY",
    intro: "A good site should be easy for everyone to use.",
    sections: [
      [
        "How it's built",
        "Semantic structure, labelled controls, visible keyboard focus and touch-friendly sizes.",
      ],
      ["Motion", "Animations follow your device's reduced-motion setting."],
      [
        "Ongoing work",
        "We're still testing, and this isn't an audited WCAG claim. Tell us if something is hard to use.",
      ],
    ],
  },
};
