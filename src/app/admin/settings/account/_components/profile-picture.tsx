import { useQuery } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { getAdminProfile } from "../actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePicture() {
  const { isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfile,
  });

  return (
    <section className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-8">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Profile Picture</h2>
        <p className="text-sm">
          Upload or update your profile photo. Click the profile icon to upload
          a new photo.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-16 w-16 rounded-full" />
        ) : (
          <div className="from-brand-light to-brand-normal relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-t">
            <Edit
              className="absolute right-0 bottom-0 rounded-full bg-white p-1"
              onClick={() => toast.info("This is an upcoming feature")}
            />
          </div>
        )}
      </div>
    </section>
  );
}
