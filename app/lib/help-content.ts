import { brand, legal } from "./brand";

/* The help and policy pages. A section's text is plain: a blank line starts a
   new paragraph, and lines beginning "- " make a list (see routes/info.tsx).
   This site takes enquiries and trade orders; the retail shop runs on Shopify,
   which carries its own shipping, returns, privacy and terms. These pages
   should be read by the owner, and ideally a lawyer, before launch. */

const address = brand.address.join(", ");

export const pages: Record<
  string,
  {
    title: string;
    eyebrow: string;
    intro: string;
    updated?: string;
    sections: [string, string][];
  }
> = {
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
        "Can I buy online?",
        "Yes, from our online shop (Visit the shop, at the top of every page). Its own pages explain delivery, payment and returns.",
      ],
      [
        "Can I place a bulk enquiry?",
        "Yes. Use the bulk enquiry form for hospitality, retail, gifting or bespoke work.",
      ],
      [
        "Can I customize a piece?",
        "Many pieces can change in size, finish and material. Send us a brief, or drop a photo or sketch of your idea in Your form, your finish.",
      ],
      [
        "What are your lead times?",
        "They depend on the piece. An estimate comes with your quotation.",
      ],
      [
        "Is there a minimum order quantity?",
        "It depends on the piece and finish: share a rough quantity and we'll advise. For a single piece, visit the online shop.",
      ],
      [
        "Do you ship internationally?",
        "Yes. We export worldwide from Moradabad. Send an export enquiry and we will quote the piece, packing, freight and duties.",
      ],
      [
        "How do I care for my piece?",
        "Each material differs. Living finishes patinate over time. See the care guide.",
      ],
      [
        "Are the photographs real products?",
        "Catalogue pages show the pieces we make. Some atmospheric images elsewhere on the site are editorial and show styling.",
      ],
    ],
  },
  privacy: {
    title: "Privacy policy",
    eyebrow: "PRIVACY",
    intro: "What we collect, why, who sees it, and the choices you have.",
    updated: legal.updated,
    sections: [
      [
        "Who we are",
        `${legal.entity}, trading as ${brand.name}, of ${address}, decides why and how your personal data is used (a "data fiduciary" under India's Digital Personal Data Protection Act, 2023). We follow that Act and the Information Technology Act, 2000.\n\nQuestions or requests: ${legal.grievanceOfficer.email}.\n\nThis policy covers this website. Our online shop runs on Shopify and has its own privacy policy.`,
      ],
      [
        "What we collect",
        "- Enquiries and messages: your name, email, company, country, what you write, and any pictures or sketches you send with an idea.\n- Quotations: the details we agree with you for a trade or custom order.\n- Newsletter: your email and your consent.\n- Technical: your IP address and basic request details in server logs, for security and to prevent abuse.",
      ],
      [
        "Why we use it",
        "- To reply to your enquiries and prepare quotations and samples.\n- To keep the website secure and prevent abuse.\n- To keep the records Indian tax and accounting law requires for orders we agree.\n- To send our notes, only if you asked for them.\n\nWe do not sell your data and we do not use advertising trackers.",
      ],
      [
        "Who we share it with",
        "We share only what each of these needs to do its job:\n\n- Amazon Web Services (hosting and email delivery) and MongoDB Atlas (our database), which store the data for us.\n- Freight and courier partners, for an order we have agreed with you.\n- Our accountants and advisers, for tax and compliance.\n- Authorities, when the law requires it.",
      ],
      [
        "How we protect it",
        "Pages are served over HTTPS. Pictures you send with an idea are private: they are not on any public address and only our studio can open them. Access to our systems is limited and protected.\n\nNo system is perfect. If a breach affects you, we will tell you and the authorities as the law requires.",
      ],
      [
        "How long we keep it",
        "- Enquiries and the pictures sent with them: until you ask us to delete them, or two years after our last conversation, whichever comes first.\n- Quotations and order records: as long as Indian tax and accounting law requires.\n- Newsletter: until you unsubscribe.",
      ],
      [
        "Your rights",
        `You may ask us to show you the data we hold about you, correct it, or erase it (unless the law obliges us to keep it). You may withdraw consent at any time: every email has an unsubscribe link, and you can also use the Preferences page. You may name another person to exercise these rights for you if you die or cannot act for yourself.\n\nWrite to ${legal.grievanceOfficer.email}. We aim to reply within 30 days. If you are not satisfied, you may complain to the Data Protection Board of India.`,
      ],
      [
        "Cookies and browser storage",
        "This site sets no cookies of its own and uses no analytics or advertising trackers. Your browser may remember that the welcome animation has played.",
      ],
      [
        "Children",
        "This site is for adults and businesses. We do not knowingly collect data from anyone under 18. If you think a child has sent us data, tell us and we will delete it.",
      ],
      [
        "Changes",
        "When we change this policy we update the date above. If a change matters to you, we will say so on the site or by email.",
      ],
      [
        "Complaints",
        `${legal.grievanceOfficer.name ? `${legal.grievanceOfficer.name}, ` : ""}${legal.grievanceOfficer.designation}: ${legal.grievanceOfficer.email}, ${legal.grievanceOfficer.phone}.`,
      ],
    ],
  },
  terms: {
    title: "Terms & conditions",
    eyebrow: "TERMS",
    intro: "The rules for using this website and ordering from Aurelio's trade desk.",
    updated: legal.updated,
    sections: [
      [
        "About these terms",
        `This website is run by ${legal.entity}, trading as ${brand.name} (“we”, “us”), of ${address}. By using it you agree to these terms and our Privacy policy. Purchases from our online shop are covered by the shop's own terms.`,
      ],
      [
        "Enquiries are not orders",
        "A brief, a picture or an enquiry starts a conversation; it is not an order, and it commits neither of us. An order needs a quotation we have confirmed in writing, with its price, lead time, advance payment and delivery terms. Export orders are agreed separately, with their own delivery and payment terms.",
      ],
      [
        "Custom and bulk orders",
        "Custom pieces are made for you, so they cannot be cancelled once work has begun, and the terms of the quotation apply. A sample, where agreed, is approved before production.",
      ],
      [
        "Handmade pieces",
        "Each piece is made by hand, so small variations in size, finish, colour and patina are normal and are not defects. We describe and photograph pieces as accurately as we can, but screens differ and measurements are approximate.",
      ],
      [
        "Pictures and ideas you send us",
        "You keep ownership of any picture, drawing or sketch you send. By sending it you confirm it is yours to share, or that you have the owner's permission. We use it only to reply to you and to prepare a quotation or sample, and we do not publish it. Who owns a design we create for you is agreed in writing as part of the commission.",
      ],
      [
        "Our designs and content",
        `The designs, photographs, text and artwork on this site belong to ${legal.entity} or its licensors. You may view and share pages for personal use, but you may not copy, sell or reproduce our designs or content without our written permission.`,
      ],
      [
        "Using the site properly",
        "Do not misuse the site: no attempts to break, overload or scrape it, to access other people's data, or to use it unlawfully.",
      ],
      [
        "Our responsibility",
        "We take care over every page, but we cannot promise the site will always be available or free of errors. To the extent the law allows, we are not liable for indirect or consequential loss. Nothing in these terms excludes liability that cannot be excluded by law. We are not responsible for delays caused by events beyond our reasonable control.",
      ],
      [
        "Law and disputes",
        `These terms are governed by the laws of India. Please write to us first and we will try to resolve any complaint quickly. Subject to any rights you have as a consumer, the courts at ${legal.jurisdiction} have jurisdiction over disputes.`,
      ],
      [
        "Changes and contact",
        `We may update these terms. Questions: ${brand.email}, ${brand.phone}.`,
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
