import { Article } from "../types/landing";

export const mockArticles: Article[] = [
  {
    id: 1,
    title: "The Journey Within: Reflections on Self-Acceptance",
    content:
      "A personal exploration of embracing imperfections, finding meaning in vulnerability, and learning to accept oneself.",
    status: "published",
    publishedAt: {
      publisherName: "The New York Times",
      publisherIcon: "",
    },
    authorName: "Alice Johnson",
    articleImage: "",
  },
  {
    id: 2,
    title: "On Connection: Why We Need Each Other",
    content:
      "Philosophical thoughts on the importance of human connection, empathy, and the shared experience of being.",
    status: "draft",
    publishedAt: {
      publisherName: "The Guardian",
      publisherIcon: "",
    },
    authorName: "Bob Smith",
    articleImage: "",
  },
  {
    id: 3,
    title: "Finding Meaning in Everyday Life",
    content:
      "A meditation on how small moments and daily rituals can offer purpose and fulfillment.",
    status: "published",
    publishedAt: {
      publisherName: "BBC News",
      publisherIcon: "",
    },
    authorName: "Carol Lee",
    articleImage: "",
  },
  {
    id: 4,
    title: "The Paradox of Growth: Embracing Change and Uncertainty",
    content:
      "Thoughts on personal growth, the discomfort of change, and how uncertainty can lead to deeper understanding.",
    status: "archived",
    publishedAt: {
      publisherName: "TIME",
      publisherIcon: "",
    },
    authorName: "David Kim",
    articleImage: "",
  },
];
