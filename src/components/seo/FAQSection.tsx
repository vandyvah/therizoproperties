import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQJsonLd } from "./JsonLd";

interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
  faqs?: FAQItem[]; // alias for items
  className?: string;
}

export function FAQSection({
  title,
  subtitle,
  items,
  faqs,
  className = "",
}: FAQSectionProps) {
  const faqItems = items || faqs || [];
  if (faqItems.length === 0) return null;

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      <FAQJsonLd items={faqItems} />
      {title && (
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
      <Accordion type="single" collapsible className="space-y-3">
        {faqItems.map((item, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="bg-card border border-border rounded-lg px-6"
          >
            <AccordionTrigger className="text-left font-display font-medium text-foreground hover:text-gold py-4">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
