import { useEffect } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleSchema {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

interface RealEstateListingSchema {
  name: string;
  description: string;
  price: number;
  priceCurrency: string;
  address: {
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  numberOfRooms?: number;
  floorSize?: {
    value: number;
    unitCode: string;
  };
  image?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Generic JsonLd component for any schema data
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `jsonld-${Math.random().toString(36).slice(2, 9)}`;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data]);

  return null;
}

// Helper function to create Organization schema
export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Therizo Property and Development Corporation",
    description: "Premium Nigerian real estate firm serving serious buyers, diaspora investors, and developers with verified properties and disciplined due diligence.",
    url: "https://therizoproperties.com",
    telephone: "+234 803 483 0087",
    email: "hello@therizoproperties.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressRegion: "Lagos State",
      addressCountry: "NG",
    },
    areaServed: ["Lagos", "Abuja", "Port Harcourt", "Ogun State"],
    sameAs: [],
  };
}

// Helper function to create LocalBusiness schema
export function createLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://therizoproperties.com/#localbusiness",
    name: "Therizo Property and Development Corporation",
    description: "Premium Nigerian real estate firm serving diaspora investors with verified properties, clean titles, and disciplined due diligence across Lagos, Abuja, and Port Harcourt.",
    url: "https://therizoproperties.com",
    telephone: "+234 803 483 0087",
    email: "hello@therizoproperties.com",
    priceRange: "₦₦₦₦",
    image: "https://therizoproperties.com/og/og-home.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Suite C1, Plot 759, Kubwa Extension, F15",
      addressLocality: "Abuja",
      addressRegion: "FCT",
      postalCode: "",
      addressCountry: "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 9.0765,
      longitude: 7.3986,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Lagos" },
      { "@type": "City", name: "Abuja" },
      { "@type": "City", name: "Port Harcourt" },
      { "@type": "State", name: "Ogun State" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Nigerian Property Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Property Title Verification",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Diaspora Investment Advisory",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Premium Property Sales",
          },
        },
      ],
    },
  };
}

// Helper function to create RealEstateAgent schema
export function createRealEstateAgentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Therizo Property and Development Corporation",
    description: "Boutique real estate firm specializing in verified Nigerian properties with clean titles and transparent pricing for diaspora investors.",
    url: "https://therizoproperties.com",
    telephone: "+234 803 483 0087",
    email: "hello@therizoproperties.com",
    priceRange: "₦₦₦",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Suite C1, Plot 759, Kubwa Extension, F15",
      addressLocality: "Abuja",
      addressRegion: "FCT",
      addressCountry: "NG",
    },
    areaServed: [
      { "@type": "City", name: "Lagos" },
      { "@type": "City", name: "Abuja" },
      { "@type": "City", name: "Port Harcourt" },
    ],
  };
}

// Helper function to create FAQ schema
export function createFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Helper function to create Article schema
export function createArticleSchema(data: ArticleSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    description: data.description,
    author: {
      "@type": "Organization",
      name: data.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Therizo Property and Development Corporation",
      logo: {
        "@type": "ImageObject",
        url: "https://therizoproperties.com/logo.png",
      },
    },
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    image: data.image,
  };
}

// FAQ Schema component (for backward compatibility)
export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    
    const schema = createFAQSchema(items);
    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById("faq-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("faq-jsonld");
      if (el) el.remove();
    };
  }, [items]);

  return null;
}

// Breadcrumb Schema
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-jsonld";
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById("breadcrumb-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("breadcrumb-jsonld");
      if (el) el.remove();
    };
  }, [items]);

  return null;
}
