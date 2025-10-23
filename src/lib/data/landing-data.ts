import { Announcements, Article, Playlist } from "../types/landing";

export const articleData: Article[] = [
  {
    id: 1,
    title: "The Journey Within: Reflections on Self-Acceptance",
    content:
      "A personal exploration of embracing imperfections, finding meaning in vulnerability, and learning to accept oneself.",
    publishedAt: {
      publisherName: "The New York Times",
      publisherIcon: "",
    },
    authorName: "Alice Johnson",
    articleImage: "",
    addedAt: "2024-06-10T09:00:00Z",
  },
  {
    id: 2,
    title: "On Connection: Why We Need Each Other",
    content:
      "Philosophical thoughts on the importance of human connection, empathy, and the shared experience of being.",
    publishedAt: {
      publisherName: "The Guardian",
      publisherIcon: "",
    },
    authorName: "Bob Smith",
    articleImage: "",
    addedAt: "2024-06-10T09:05:00Z",
  },
  {
    id: 3,
    title: "Finding Meaning in Everyday Life",
    content:
      "A meditation on how small moments and daily rituals can offer purpose and fulfillment.",
    publishedAt: {
      publisherName: "BBC News",
      publisherIcon: "",
    },
    authorName: "Carol Lee",
    articleImage: "",
    addedAt: "2024-06-10T09:10:00Z",
  },
  {
    id: 4,
    title: "The Paradox of Growth: Embracing Change and Uncertainty",
    content:
      "Thoughts on personal growth, the discomfort of change, and how uncertainty can lead to deeper understanding.",
    publishedAt: {
      publisherName: "TIME",
      publisherIcon: "",
    },
    authorName: "David Kim",
    articleImage: "",
    addedAt: "2024-06-10T09:15:00Z",
  },
];

export const announcementsData: Announcements[] = [
  {
    id: 1,
    title: "Peer Support Group Session",
    startDate: "2024-06-15T09:00:00Z",
    endDate: "2024-06-15T10:30:00Z",
    location: "Counseling Center Room 101",
    description:
      "Join our peer support group to share experiences and learn coping strategies in a safe environment.",
    annoucementImage: "",
  },
  {
    id: 2,
    title: "Stress Management Workshop",
    startDate: "2024-06-18T13:00:00Z",
    endDate: "2024-06-18T15:00:00Z",
    location: "Multipurpose Hall",
    description:
      "Interactive workshop on techniques for managing stress and promoting mental wellness.",
    annoucementImage: "",
  },
  {
    id: 3,
    title: "Career Guidance Seminar",
    startDate: "2024-06-22T10:00:00Z",
    endDate: "2024-06-22T12:00:00Z",
    location: "Auditorium",
    description:
      "Seminar on career planning, resume building, and interview skills for students.",
    annoucementImage: "",
  },
  {
    id: 4,
    title: "One-on-One Counseling Sign-Up",
    startDate: "2024-06-25T08:00:00Z",
    endDate: "2024-06-25T17:00:00Z",
    location: "Counseling Office",
    description:
      "Register for individual counseling sessions with our guidance counselors.",
    annoucementImage: "",
  },
];

export const playlistData: Playlist[] = [
  {
    id: 1,
    title: "Morning Motivation",
    link: "https://open.spotify.com/playlist/1",
    creator: "Jane Doe",
    platform: {
      platformName: "Spotify",
      platformIcon: "",
    },
    image: "",
    emotion: "Motivated",
  },
  {
    id: 2,
    title: "Focus & Study",
    link: "https://music.youtube.com/playlist?list=2",
    creator: "John Smith",
    platform: {
      platformName: "YouTube Music",
      platformIcon: "",
    },
    image: "",
    emotion: "Focused",
  },
  {
    id: 3,
    title: "Relaxing Evenings",
    link: "https://soundcloud.com/user/playlist/3",
    creator: "Emily Clark",
    platform: {
      platformName: "SoundCloud",
      platformIcon: "",
    },
    image: "",
    emotion: "Relaxed",
  },
  {
    id: 4,
    title: "Feel Good Hits",
    link: "https://music.apple.com/playlist/4",
    creator: "Michael Lee",
    platform: {
      platformName: "Apple Music",
      platformIcon: "",
    },
    image: "",
    emotion: "Happy",
  },
];
