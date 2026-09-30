import "./EventFlashCard.css";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useKnowledge } from "@/data/useKnowledge";
import { trackClick } from "@/lib/track";

/**
 * The next upcoming event, on the homepage.
 *
 * Driven entirely by the CRM: it is whichever published Knowledge Centre post
 * carries the soonest `event_starts_at` still in the future. So it appears when
 * marketing publishes an event and disappears by itself once that event has
 * passed -- nobody has to deploy the site to take a stale invitation down.
 *
 * Renders nothing at all when there is no upcoming event, rather than an empty
 * band or a placeholder. The homepage is not the place to explain that nothing
 * is scheduled.
 */

// The event happens in Nigeria. A visitor abroad whose browser helpfully
// converts the time to their own zone would arrive on the wrong hour, so the
// date is formatted in Lagos time and labelled WAT. Same reasoning, and same
// choice, as the Knowledge Centre's event cards.
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

export function EventFlashCard() {
  const { items } = useKnowledge();

  const next = items
    .filter((item) => item.event?.startsAt)
    .map((item) => ({ item, when: new Date(item.event!.startsAt) }))
    .filter(({ when }) => !Number.isNaN(when.getTime()) && when.getTime() > Date.now())
    .sort((a, b) => a.when.getTime() - b.when.getTime())[0];

  if (!next) return null;

  const { item, when } = next;
  const event = item.event!;

  return (
    <section className="section event-flash">
      <div className="shell event-flash-card">
        {item.image && (
          <div className="event-flash-flyer">
            <img src={item.image} alt={`Flyer for ${item.title}`} />
          </div>
        )}
        <div className="event-flash-copy">
          <p className="eyebrow eyebrow--gold">Upcoming event</p>
          <h2>{item.slug ? <Link to={`/knowledge/${item.slug}`}>{item.title}</Link> : item.title}</h2>
          <ul className="event-flash-meta">
            <li><CalendarDays size={17} aria-hidden="true" /> {eventDay.format(when)}</li>
            <li><Clock size={17} aria-hidden="true" /> From {eventTime.format(when)} WAT</li>
            {event.location && <li><MapPin size={17} aria-hidden="true" /> {event.location}</li>}
          </ul>
          <div className="event-flash-actions">
            {item.slug && <Link className="button button--outline event-flash-details" to={`/knowledge/${item.slug}`}>View event details</Link>}
            {event.ctaUrl && (
              <a
                className="button button--primary event-flash-cta"
                href={event.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("rsvp_event", item.slug)}
              >
                {event.ctaLabel?.trim() || "Reserve a place"}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
