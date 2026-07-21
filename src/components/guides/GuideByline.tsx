import { Link } from "react-router-dom";
import { UserCircle2, CheckCircle2, ExternalLink } from "lucide-react";

export interface GuideAuthor {
  name: string;
  role: string;
}

interface GuideBylineProps {
  author: GuideAuthor;
  reviewedBy?: GuideAuthor;
  datePublished: string;
  dateModified: string;
  readTime?: string;
}

/**
 * Visible author/reviewer byline that mirrors Article JSON-LD.
 * Rendered inside <address> with rel="author" for semantic E-E-A-T signal.
 */
export function GuideByline({
  author,
  reviewedBy,
  datePublished,
  dateModified,
  readTime,
}: GuideBylineProps) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <address className="not-italic border-y border-navy/10 py-6 my-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start gap-3">
        <UserCircle2 className="h-10 w-10 text-navy/70 shrink-0" aria-hidden="true" />
        <div className="text-sm">
          <div className="text-navy/60">Written by</div>
          <Link
            to="/team"
            rel="author"
            className="font-medium text-navy hover:text-gold transition-colors"
          >
            {author.name}
          </Link>
          <div className="text-navy/60">{author.role}</div>
        </div>
      </div>

      {reviewedBy && (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-10 w-10 text-gold shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <div className="text-navy/60">Reviewed by</div>
            <Link
              to="/team"
              className="font-medium text-navy hover:text-gold transition-colors"
            >
              {reviewedBy.name}
            </Link>
            <div className="text-navy/60">{reviewedBy.role}</div>
          </div>
        </div>
      )}

      <div className="text-sm text-navy/60 sm:text-right">
        <div>
          <span className="sr-only">Published </span>
          <time dateTime={datePublished}>Published {fmt(datePublished)}</time>
        </div>
        <div>
          <span className="sr-only">Last reviewed </span>
          <time dateTime={dateModified}>Reviewed {fmt(dateModified)}</time>
        </div>
        {readTime && <div className="mt-1">{readTime}</div>}
      </div>
    </address>
  );
}

interface Citation {
  label: string;
  url: string;
}

interface GuideCitationsProps {
  items: Citation[];
}

/**
 * Visible source/citation list — pairs with `citation[]` in Article JSON-LD.
 * Uses <ol> so search engines can parse ordered references.
 */
export function GuideCitations({ items }: GuideCitationsProps) {
  if (!items.length) return null;
  return (
    <section
      aria-labelledby="sources-heading"
      className="mt-12 pt-8 border-t border-navy/10"
    >
      <h2 id="sources-heading" className="font-display text-2xl font-semibold text-navy mb-4">
        Sources & References
      </h2>
      <p className="text-sm text-navy/60 mb-4">
        This guide cites primary government and regulatory sources. Verify with the linked
        agency before any transaction.
      </p>
      <ol className="space-y-2 list-decimal list-inside text-sm">
        {items.map((c) => (
          <li key={c.url} className="text-navy/80">
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-navy hover:text-gold underline underline-offset-2 inline-flex items-center gap-1"
            >
              {c.label}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
