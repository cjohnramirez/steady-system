export type Article = {
  id: number;
  title: string;
  content: string;
  status: string;
  publishedAt: Publisher;
  authorName: string;
  articleImage: string;
  addedAt: string;
};

export type Publisher = {
  publisherName: string;
  publisherIcon: string;
};

export type Announcements = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  annoucementImage: string;
};

export type Playlist = {
  id: number;
  title: string;
  link: string;
  creator: string;
  platform: {
    platformName: string;
    platformIcon: string;
  };
  image: string;
  emotion: string;
};
