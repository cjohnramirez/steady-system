"use client";

import { Button } from "@/components/ui/button";
import {
  announcementsData,
  articleData,
  playlistData,
} from "@/lib/data/landing-data";
import { ChevronRight, Plus } from "lucide-react";
import ArticleTile from "./components/article-tile";
import AnnoucementsTile from "./components/annoucements-tile";
import PlaylistTile from "./components/playlist-tile";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between">
        <div>
          <h2 className="text-md font-semibold">Articles to Read</h2>
          <p className="">Added articles here are shown in the landing page</p>
        </div>
        <Button variant={"outline"}>
          <Plus />
          Add Article
        </Button>
      </div>
      <div className="flex h-full items-stretch justify-center gap-4">
        <div className="grid grid-cols-4 gap-4">
          {articleData.slice(0, 4).map((article) => (
            <ArticleTile articleTile={article} key={article.id} />
          ))}
        </div>
        <div className="flex h-auto items-stretch">
          <Button
            variant={"outline"}
            className="flex h-full flex-col justify-center py-8"
          >
            <ChevronRight />
            See More
          </Button>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <h2 className="text-md font-semibold">Announcements and Events</h2>
          <p className="">
            Added announcements and events are shown in the landing page
          </p>
        </div>
        <Button variant={"outline"}>
          <Plus />
          Add Annoucements / Events
        </Button>
      </div>
      <div className="flex h-full items-stretch justify-center gap-4">
        <div className="grid grid-cols-4 gap-4">
          {announcementsData.slice(0, 4).map((annoucement) => (
            <AnnoucementsTile
              announcements={annoucement}
              key={annoucement.id}
            />
          ))}
        </div>
        <div className="flex h-auto items-stretch">
          <Button
            variant={"outline"}
            className="flex h-full flex-col justify-center py-8"
          >
            <ChevronRight />
            See More
          </Button>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <h2 className="text-md font-semibold">Music Recommendations</h2>
          <p className="">Added music recommendations</p>
        </div>
        <Button variant={"outline"}>
          <Plus />
          Add Playlist
        </Button>
      </div>
      <div className="flex h-full items-stretch justify-center gap-4">
        <div className="grid grid-cols-4 gap-4 w-full">
          {playlistData.slice(0, 4).map((playlist) => (
            <PlaylistTile playlistData={playlist} key={playlist.id}/>
          ))}
        </div>
        <div className="flex h-auto items-stretch">
          <Button
            variant={"outline"}
            className="flex h-full flex-col justify-center py-8"
          >
            <ChevronRight />
            See More
          </Button>
        </div>
      </div>
    </div>
  );
}
