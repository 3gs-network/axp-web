import "./Index.css";
import { useEffect } from "react";
import type { ReactElement } from "react";
import { CalendarDays, Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import type { KnowledgeItem } from "@/data/knowledge";
import { useKnowledgePost } from "@/data/useKnowledge";
import { trackClick } from "@/lib/track";
import { NotFoundPage } from "@/pages/not-found/Index";

const eventDay = new Intl.DateTimeFormat("en-NG", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Lagos"
});

const eventTime = new Intl.DateTimeFormat("en-NG", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Lagos"
});

function ArticleBody({ body }: { body: string }) {
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const content: ReactElement[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(lines[index].slice(2));
        index += 1;
      }
      content.push(<ul key={`list-${index}`}>{items.map((item) => <li key={item}>{item}</li>)}</ul>);
      continue;
    }

    const nextIsList = lines[index + 1]?.startsWith("- ");
    const isHeading = nextIsList || /^(Who it is for|Event details|Programme partners|Enquiries)$/i.test(line);
    content.push(isHeading ? <h2 key={`heading-${index}`}>{line}</h2> : <p key={`copy-${index}`}>{line}</p>);
    index += 1;
  }

  return <>{content}</>;
}

function EventSummary({ post }: { post: KnowledgeItem }) {
  const event = post.event;
  if (!event) return null;
  const when = new Date(event.startsAt);
  const valid = !Number.isNaN(when.getTime());
  const ends = event.endsAt ? new Date(event.endsAt) : null;
  const endTime = ends && !Number.isNaN(ends.getTime()) ? eventTime.format(ends) : null;
  const upcoming = valid && when.getTime() > Date.now();

  return (
    <aside className="knowledge-detail-summary" aria-label="Event information">
      <p className="eyebrow eyebrow--gold">Event information</p>
      <dl>
        {valid && <div><dt><CalendarDays aria-hidden="true" /></dt><dd>{eventDay.format(when)}</dd></div>}
        {valid && <div><dt><Clock aria-hidden="true" /></dt><dd>{eventTime.format(when)}{endTime ? `–${endTime}` : ""} WAT</dd></div>}
        {event.location && <div><dt><MapPin aria-hidden="true" /></dt><dd>{event.location}</dd></div>}
        {event.contactNumbers?.length ? (
          <div><dt><Phone aria-hidden="true" /></dt><dd>{event.contactNumbers.map((number) => (
            <span key={number}><a href={`tel:+234${number.replace(/\D/g, "").replace(/^0/, "")}`}>{number}</a><br /></span>
          ))}</dd></div>
        ) : null}
      </dl>
      <p className="knowledge-detail-free">Attendance is free. Registration is compulsory.</p>
      {upcoming && event.ctaUrl && (
        <a
          className="button button--primary knowledge-detail-cta"
          href={event.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick("rsvp_event", post.slug)}
        >
          {event.ctaLabel?.trim() || "Reserve your place"}
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      )}
    </aside>
  );
}

export function KnowledgeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, status } = useKnowledgePost(slug);

  useEffect(() => {
    if (!post) return;
    const previous = document.title;
    document.title = `${post.title} | AXP Africa`;
    return () => { document.title = previous; };
  }, [post]);

  if (status === "empty") return <NotFoundPage />;

  if (status === "loading" || !post) {
    return (
      <SiteLayout>
        <section className="section shell knowledge-detail-status" aria-live="polite">
          <p>{status === "unavailable" ? "This article is temporarily unavailable. Please try again shortly." : "Loading article…"}</p>
          {status === "unavailable" && <Link className="button button--outline" to="/knowledge">Return to the Knowledge Centre</Link>}
        </section>
      </SiteLayout>
    );
  }

  const event = post.event;
  const when = event ? new Date(event.startsAt) : null;
  const validDate = when && !Number.isNaN(when.getTime());

  return (
    <SiteLayout>
      <article className="knowledge-detail">
        <header className="knowledge-detail-hero">
          <div className="shell">
            <nav className="knowledge-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/knowledge">Knowledge Centre</Link><span aria-hidden="true">/</span><span>{post.type}</span>
            </nav>
            <div className="knowledge-detail-hero-grid">
              <div className="knowledge-detail-intro">
                <p className="eyebrow eyebrow--gold">{post.type}</p>
                <h1>{post.title}</h1>
                {post.excerpt && <p className="knowledge-detail-deck">{post.excerpt}</p>}
                {event && validDate && (
                  <p className="knowledge-detail-date">
                    <CalendarDays size={18} aria-hidden="true" /> {eventDay.format(when)} · {eventTime.format(when)} WAT
                  </p>
                )}
              </div>
              {post.image && <img className="knowledge-detail-cover" src={post.image} alt={`${post.title} event flyer`} />}
            </div>
          </div>
        </header>

        <div className="shell knowledge-detail-layout">
          <div className="knowledge-detail-copy">
            {post.author && <p className="knowledge-detail-byline">Presented by {post.author}</p>}
            {post.body ? <ArticleBody body={post.body} /> : post.excerpt && <p>{post.excerpt}</p>}
          </div>
          <EventSummary post={post} />
        </div>
      </article>
    </SiteLayout>
  );
}
