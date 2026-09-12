import Image from "next/image";
import Link from "next/link";

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen w-full items-center overflow-y-auto p-4">
      <div className="flex h-full w-full flex-col gap-8 rounded-4xl border bg-white p-8 md:flex-row">
        <div className="flex flex-col justify-center md:w-1/2">
          <div className="flex items-center justify-between gap-3">
            <Link
              className="flex cursor-pointer items-center gap-3"
              href="/home"
            >
              <Image
                src="/icon.png"
                alt="logo"
                width={40}
                height={40}
                className="rounded-4xl object-cover"
              />
              <p>GCS</p>
            </Link>
          </div>
          <div className="my-10 flex flex-col justify-center px-10">
            {children}
          </div>
        </div>
        <div className="relative h-[400px] md:h-auto md:w-1/2">
          <Image
            src="/auth.jpg"
            alt="Authentication image"
            fill
            priority
            className="rounded-4xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}
