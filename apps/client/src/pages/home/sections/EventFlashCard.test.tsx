import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { KnowledgeItem } from "@/data/knowledge";

const items = vi.hoisted(() => ({ current: [] as KnowledgeItem[] }));

vi.mock("@/data/useKnowledge", () => ({
  useKnowledge: () => ({ items: items.current, source: "crm" as const })
}));

// Firing a real tracking request from a unit test would reach the network and
// put a row in the CRM.
vi.mock("@/lib/track", () => ({ trackClick: vi.fn() }));

const { EventFlashCard } = await import("./EventFlashCard");

const DAY = 24 * 60 * 60 * 1000;

const renderCard = () => render(<MemoryRouter><EventFlashCard /></MemoryRouter>);

function event(title: string, offsetDays: number, extra: Partial<KnowledgeItem> = {}): KnowledgeItem {
  return {
    type: "Events",
    title,
    read: "1 min",
    featured: false,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    event: {
      startsAt: new Date(Date.now() + offsetDays * DAY).toISOString(),
      location: "Ibom-LED, IBB Avenue, Uyo",
      ctaUrl: "https://forms.cloud.microsoft/e/WAAceJL2xk",
      ctaLabel: "Reserve your place"
    },
    ...extra
  };
}

afterEach(() => {
  items.current = [];
  document.body.innerHTML = "";
});

describe("EventFlashCard", () => {
  it("shows an upcoming event with its venue and invite link", () => {
    items.current = [event("My Land, My Home HomeReady Training", 14)];
    renderCard();

    expect(screen.getByText("My Land, My Home HomeReady Training")).toBeTruthy();
    expect(screen.getByText(/Ibom-LED/)).toBeTruthy();

    const rsvp = screen.getByRole("link", { name: "Reserve your place" });
    expect(rsvp.getAttribute("href")).toBe("https://forms.cloud.microsoft/e/WAAceJL2xk");
    // An external invite opened in a new tab must not hand the form a live
    // reference back to this window.
    expect(rsvp.getAttribute("rel")).toContain("noopener");
    expect(screen.getByRole("link", { name: "View event details" }).getAttribute("href"))
      .toBe("/knowledge/my-land,-my-home-homeready-training");
  });

  it("renders nothing when every event has already happened", () => {
    items.current = [event("Last year's training", -30)];
    const { container } = renderCard();
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when there are no events at all", () => {
    items.current = [{ type: "Housing guides", title: "An ordinary article", read: "5 min", featured: false }];
    const { container } = renderCard();
    expect(container.firstChild).toBeNull();
  });

  it("shows the soonest upcoming event, not merely the first in the list", () => {
    items.current = [event("Later event", 60), event("Sooner event", 7), event("Past event", -5)];
    renderCard();

    expect(screen.getByText("Sooner event")).toBeTruthy();
    expect(screen.queryByText("Later event")).toBeNull();
    expect(screen.queryByText("Past event")).toBeNull();
  });

  it("still renders when the post has no flyer image", () => {
    items.current = [event("No flyer", 10)];
    renderCard();
    expect(screen.getByText("No flyer")).toBeTruthy();
    expect(document.querySelector(".event-flash-flyer")).toBeNull();
  });
});
