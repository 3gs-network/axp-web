import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { knowledgeItems, type KnowledgeItem } from "./knowledge";

/**
 * The Knowledge Centre, edited in the AXP CRM.
 *
 * Falls back to the built-in list. That is deliberate rather than lazy: the CRM
 * has no posts in it yet, and a marketing page that goes blank the moment a
 * backend is introduced is a worse page than the one it replaced. So the static
 * items keep showing until somebody publishes a real post, and from then on the
 * published posts win.
 *
 * Goes through `apiFetch` -- and therefore through the site's own server, which
 * holds the CRM credentials. Frontend code never talks to the CRM directly:
 * AGENTS.md forbids it, and it would put the CRM's key in every visitor's
 * browser.
 */

type KnowledgePost = {
  slug: string;
  title: string;
  excerpt: string | null;
  tags: unknown;
  published_at: string | null;
};

// The CRM stores a post; the page renders a card. `type` comes from the first
// tag, because that is what the filter row is built from, and the read time is
// estimated from the excerpt at a middling 200 words a minute -- an honest
// guess, and better than an empty line where a reader expects one.
function toItem(post: KnowledgePost, index: number): KnowledgeItem {
  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
  const words = (post.excerpt ?? "").trim().split(/\s+/).filter(Boolean).length;
  return {
    type: tags[0] ?? "Housing guides",
    title: post.title,
    read: `${Math.max(1, Math.round(words / 200))} min`,
    featured: index === 0
  };
}

export function useKnowledge() {
  const [items, setItems] = useState<KnowledgeItem[]>(knowledgeItems);
  const [source, setSource] = useState<"fallback" | "crm">("fallback");

  useEffect(() => {
    let cancelled = false;

    apiFetch("/knowledge")
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as
          | { ok: true; data: { posts: KnowledgePost[] } }
          | { ok: false };
        if (cancelled || !payload.ok) return;

        const posts = payload.data.posts ?? [];
        // An empty list means nothing is published yet, not that the fetch
        // failed -- so keep the fallback rather than emptying the page.
        if (posts.length === 0) return;

        setItems(posts.map(toItem));
        setSource("crm");
      })
      .catch(() => {
        // Already surfaced by apiFetch's shared error handling; the page simply
        // keeps the content it has.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, source };
}
