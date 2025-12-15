import { useEffect } from "react";

interface FAQItem {
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
    url: "https://therizo.com",
    telephone: "+234 123 456 7890",
    email: "hello@therizo.com",
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

// Helper function to create RealEstateAgent schema
export function createRealEstateAgentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Therizo Property and Development Corporation",
    description: "Boutique real estate firm specializing in verified Nigerian properties with clean titles and transparent pricing.",
    url: "https://therizo.com",
    telephone: "+234 123 456 7890",
    email: "hello@therizo.com",
    priceRange: "₦₦₦",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressRegion: "Lagos State",
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
        url: "https://therizo.com/logo.png",
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
