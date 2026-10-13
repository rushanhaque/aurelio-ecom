export const brand = {
  name: "Aurelio",
  company: "AF International",
  founded: "2008",
  city: "Moradabad",
  story:
    "Aurelio is the atelier line of AF International, a family workshop founded in 2008.",
  history:
    "We began in Moradabad, India's brass city, as a handful of makers. Every piece is still made by hand, to be handed down.",
  address: [
    "AF International",
    "Katghar Pachpera (near New Children Home Academy School)",
    "Moradabad 244001, Uttar Pradesh",
    "India",
  ],
  hours: "Monday–Saturday · By appointment",
  phone: "+91 78179 76738",
  telephone: "tel:+917817976738",
  email: "mohdsaudsaud595@gmail.com",
  tradeEmail: "mohdsaudsaud595@gmail.com",
  whatsapp: "https://wa.me/917817976738",
  instagram: "https://instagram.com/afinternational.in",
  map: "https://www.google.com/maps/search/?api=1&query=Katghar%20Pachpera%2C%20Moradabad%2C%20Uttar%20Pradesh%20244001%2C%20India",
  /** The retail shop runs on Shopify. Paste the store's address here, e.g.
      "https://shop.aurelio.in". Until then the shop buttons lead to Contact. */
  shopUrl: "",
};
/* Where every "Visit the shop" button goes. */
export const shopLink =
  brand.shopUrl || "/contact?topic=The%20online%20shop";
export const shopIsExternal = Boolean(brand.shopUrl);
export const commissionStages = [
  "Enquiry",
  "Design",
  "Sample",
  "Forge",
  "Finish",
  "Delivery",
];

/* Who runs this site, for the privacy policy and terms. (Retail seller
   details and shop policies live on the Shopify store.) Anything left empty is
   simply not shown. */
export const legal = {
  /** The registered legal name of the seller. */
  entity: "AF International",
  /** GST registration number, if the business is registered (15 characters). */
  gstin: "",
  /** Where the legal notices may be served; defaults to the workshop address. */
  registeredAddress: brand.address.join(", "),
  grievanceOfficer: {
    /** Required before launch: the person who answers complaints. */
    name: "",
    designation: "Grievance Officer",
    email: brand.email,
    phone: brand.phone,
  },
  /** The place whose courts hear disputes (consumers keep their own rights). */
  jurisdiction: "Moradabad, Uttar Pradesh",
  /** Shown on every policy. Update whenever a policy changes. */
  updated: "10 October 2026",
};
