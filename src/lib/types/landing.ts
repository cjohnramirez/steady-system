export type Article = {
  id: number;
  title: string;
  content: string;
  status: string;
  publishedAt: Publisher;
  authorName: string;
  articleImage: string;
};

export type Publisher = {
  publisherName: string;
  publisherIcon: string;
};
