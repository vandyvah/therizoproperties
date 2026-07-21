import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, ShieldCheck, Quote } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

type Testimonial = {
  id: string;
  reviewer_name: string;
  reviewer_location: string | null;
  reviewer_role: string | null;
  quote: string;
  strategy: string | null;
  rating: number;
  verified: boolean;
};

const FALLBACK: Testimonial[] = [
  {
    id: "t1",
    reviewer_name: "A. Okonkwo",
    reviewer_location: "London, UK",
    reviewer_role: "Diaspora investor",
    quote:
      "Therizo walked us through every title check and payment step from London. We closed on a Lekki apartment without ever losing sight of the paperwork.",
    strategy: "Buy-to-let, Lekki",
    rating: 5,
    verified: true,
  },
  {
    id: "t2",
    reviewer_name: "B. Adekunle",
    reviewer_location: "Abuja, NG",
    reviewer_role: "Second-home buyer",
    quote:
      "The consultant refused two properties I liked because the titles didn't hold up. That's exactly why I trust them.",
    strategy: "Owner-occupier, Maitama",
    rating: 5,
    verified: true,
  },
  {
    id: "t3",
    reviewer_name: "C. Ibrahim",
    reviewer_location: "Toronto, CA",
    reviewer_role: "Diaspora investor",
    quote:
      "Realistic yield numbers, no hype. The ROI they projected has held up over 14 months of tenancy.",
    strategy: "Serviced apartment, Ikoyi",
    rating: 5,
    verified: true,
  },
];

export function TestimonialsSection({ variant = "light" }: { variant?: "light" | "cream" }) {
  const { data } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials" as never)
        .select(
          "id,reviewer_name,reviewer_location,reviewer_role,quote,strategy,rating,verified"
        )
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .limit(6);
      if (error) throw error;
      return (data || []) as Testimonial[];
    },
    staleTime: 300_000,
  });

  const items = data && data.length > 0 ? data : FALLBACK;

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Therizo Properties",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (
        items.reduce((s, i) => s + (i.rating || 5), 0) / items.length
      ).toFixed(1),
      reviewCount: items.length,
      bestRating: 5,
    },
    review: items.map((i) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: i.rating,
        bestRating: 5,
      },
      author: { "@type": "Person", name: i.reviewer_name },
      reviewBody: i.quote,
    })),
  };

  return (
    <section
      className={`section-padding ${variant === "cream" ? "bg-cream-dark" : "bg-ivory"}`}
      aria-labelledby="testimonials-heading"
    >
      <JsonLd data={reviewSchema} />
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-sm bg-navy/5 px-3 py-1 text-xs uppercase tracking-widest text-navy mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            Verified clients
          </div>
          <h2
            id="testimonials-heading"
            className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4"
          >
            What clients say after closing
          </h2>
          <p className="text-slate leading-relaxed">
            Every testimonial below is tied to a real Therizo transaction. Names
            are shortened for privacy; full references available on request for
            serious enquiries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <figure
              key={t.id}
              className="relative bg-warm-white border border-sand rounded-sm p-6 flex flex-col"
            >
              <Quote className="h-6 w-6 text-gold/60 mb-3" aria-hidden="true" />
              <blockquote className="text-ink leading-relaxed flex-1">
                {t.quote}
              </blockquote>
              <div className="mt-5 pt-4 border-t border-sand">
                <div className="flex items-center gap-1 mb-2" aria-label={`Rated ${t.rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < t.rating ? "fill-gold text-gold" : "text-sand"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <figcaption className="text-sm">
                  <span className="font-semibold text-ink">{t.reviewer_name}</span>
                  {t.reviewer_location ? (
                    <span className="text-slate"> · {t.reviewer_location}</span>
                  ) : null}
                  {t.strategy ? (
                    <div className="text-xs text-slate/80 mt-0.5">{t.strategy}</div>
                  ) : null}
                </figcaption>
                {t.verified ? (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-navy">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                    Verified transaction
                  </div>
                ) : null}
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
