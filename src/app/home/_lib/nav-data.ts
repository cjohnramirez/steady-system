/** Icon names map to lucide icons in NavigationBar; kept as strings so server layouts can pass them. */
export type NavIcon =
  | "home"
  | "about"
  | "services"
  | "announcements"
  | "appointment"
  | "articles"
  | "playlists";

export type NavBar = {
  title: string;
  link: string;
  icon: NavIcon;
};

export const homeNavBarObj: NavBar[] = [
  { title: "Home", link: "#home", icon: "home" },
  { title: "About Us", link: "#about", icon: "about" },
  { title: "Our Services", link: "#service", icon: "services" },
  { title: "Announcements", link: "#announcement", icon: "announcements" },
  { title: "Appointment", link: "#appointment", icon: "appointment" },
];

export const portalNavBarObj: NavBar[] = [
  { title: "Home", link: "#home", icon: "home" },
  { title: "Announcements", link: "#announcements", icon: "announcements" },
  { title: "Articles", link: "#articles", icon: "articles" },
  { title: "Playlists", link: "#playlists", icon: "playlists" },
];
