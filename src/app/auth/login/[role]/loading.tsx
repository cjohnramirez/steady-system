import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoadingSkeleton() {
  return (
    <>
      <div className="flex w-full flex-col justify-center">
        <div className="flex w-full flex-col items-center space-y-2">
          <Skeleton className="h-8 w-full max-w-[16rem]" />
          <Skeleton className="h-6 w-full max-w-[24rem]" />
        </div>

        <div className="mt-8 space-y-8">
          {/* First Name and Last Name */}
          <div className="flex w-full gap-8">
            <div className="flex flex-1 flex-col space-y-2">
              <Skeleton className="h-5 w-full max-w-[6rem]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-1 flex-col space-y-2">
              <Skeleton className="h-5 w-full max-w-[6rem]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-5 w-full max-w-[5rem]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full max-w-[20rem]" />
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-5 w-full max-w-[6rem]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full max-w-[22rem]" />
          </div>

          {/* College and Department */}
          <div className="flex w-full gap-6">
            <div className="flex flex-1 flex-col space-y-2">
              <Skeleton className="h-5 w-full max-w-[5rem]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full max-w-[12rem]" />
            </div>
            <div className="flex flex-1 flex-col space-y-2">
              <Skeleton className="h-5 w-full max-w-[7rem]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full max-w-[14rem]" />
            </div>
          </div>

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </>
  );
}
