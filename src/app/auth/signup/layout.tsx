import Image from "next/image";
import Link from "next/link";

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen overflow-y-auto p-4 w-full h-full flex items-center">
      <div className="flex flex-col md:flex-row w-full gap-8 rounded-4xl border p-8 h-full bg-white">
        <div className="flex flex-col justify-center md:w-1/2">
          <div className="flex items-center justify-between gap-3">
            <Link className="flex items-center gap-3 cursor-pointer" href="/home">
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
        <div className="relative md:w-1/2 h-[400px] md:h-auto">
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
