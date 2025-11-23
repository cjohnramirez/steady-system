import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUpRight, Edit2 } from "lucide-react";

export default function StudentPage() {
  return (
    <div className="h-screen space-y-6 p-10">
      <div className="h-fit space-y-2">
        <p className="text-4xl">Welcome, student!</p>
        <p>
          This is your personalized dashboard, with your profile and
          appointments
        </p>
      </div>
      <div className="grid grid-cols-3 grid-rows-2 gap-4">
        <div className="grid grid-cols-2 grid-rows-3 gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="col-span-2 m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5">
            <div className="text-5xl">😊</div>
            <div className="space-y-2">
              <p>You are Happy!</p>
              <Button variant="outline">
                <ArrowUpDown strokeWidth={1.25}  />
                <p>Change Mood</p>
              </Button>
            </div>
          </div>
          <div className="relative m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5">
            <p className="absolute bottom-5 left-5 w-1/3">View Playlists</p>
            <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
              <ArrowUpRight strokeWidth={1.25} />
            </div>
          </div>
          <div className="relative m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5">
            <p className="absolute bottom-5 left-5 w-1/3">View Events</p>
            <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
              <ArrowUpRight strokeWidth={1.25} />
            </div>
          </div>
          <div className="relative m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5">
            <p className="absolute bottom-5 left-5 w-1/3">View Playlists</p>
            <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
              <ArrowUpRight strokeWidth={1.25} />
            </div>
          </div>
          <div className="relative flex items-center gap-5 rounded-2xl border border-gray-200 p-5">
            <p className="absolute bottom-5 left-5 w-1/2">Go to Home Page</p>
            <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
              <ArrowUpRight strokeWidth={1.25} />
            </div>
          </div>
        </div>
        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Information</p>
              <p>
                Ensure these details are complete for a better service
                experience.
              </p>
            </div>
            <Button variant="outline">
              <Edit2 strokeWidth={1.25}  />
              <p>Edit Profile</p>
            </Button>
          </div>
          <div>
            
          </div>
        </div>
        <div className="col-span-3 rounded-2xl border border-gray-200 bg-white"></div>
      </div>
    </div>
  );
}
