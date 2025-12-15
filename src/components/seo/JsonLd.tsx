import { useEffect } from "react";

interface OrganizationSchema {
  type: "Organization" | "RealEstateAgent" | "LocalBusiness";
  name: string;
  description: string;
  url: string;
  logo?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  areaServed?: string[];
  sameAs?: string[];
}

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

// Organization Schema
export function OrganizationJsonLd({ data }: { data: OrganizationSchema }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "organization-jsonld";
    
    const schema = {
      "@context": "https://schema.org",
      "@type": data.type,
      name: data.name,
      description: data.description,
      url: data.url,
      logo: data.logo,
      telephone: data.telephone,
      email: data.email,
      address: data.address ? {
        "@type": "PostalAddress",
        ...data.address,
      } : undefined,
      areaServed: data.areaServed,
      sameAs: data.sameAs,
    };

    script.textContent = JSON.stringify(schema);
    
    // Remove existing and add new
    const existing = document.getElementById("organization-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("organization-jsonld");
      if (el) el.remove();
    };
  }, [data]);

  return null;
}

// FAQ Schema
export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

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

// Article Schema
export function ArticleJsonLd({ data }: { data: ArticleSchema }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "article-jsonld";
    
    const schema = {
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

    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById("article-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("article-jsonld");
      if (el) el.remove();
    };
  }, [data]);

  return null;
}

// Real Estate Listing Schema
export function RealEstateListingJsonLd({ data }: { data: RealEstateListingSchema }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "realestate-jsonld";
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: data.name,
      description: data.description,
      offers: {
        "@type": "Offer",
        price: data.price,
        priceCurrency: data.priceCurrency,
      },
      address: {
        "@type": "PostalAddress",
        ...data.address,
      },
      numberOfRooms: data.numberOfRooms,
      floorSize: data.floorSize ? {
        "@type": "QuantitativeValue",
        value: data.floorSize.value,
        unitCode: data.floorSize.unitCode,
      } : undefined,
      image: data.image,
    };

    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById("realestate-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("realestate-jsonld");
      if (el) el.remove();
    };
  }, [data]);

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
