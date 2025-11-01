import Image from "next/image";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen p-4">
      <div className="flex w-full gap-8 rounded-4xl border p-8">
        <div className="flex w-1/2 flex-col justify-center">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="logo"
                width={40}
                height={40}
                className="rounded-4xl object-cover"
              />
              <p>GCS</p>
            </div>
          </div>
          <div className="flex h-full flex-col justify-center px-10">
            {children}
          </div>
        </div>
        <div className="relative w-1/2">
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
