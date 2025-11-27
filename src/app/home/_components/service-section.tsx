import { GraduationCap, Handshake, HeartPlus, LibraryBig } from "lucide-react";
import Image from "next/image";
import img from "../../../assets/hero.jpg";

type Services = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const servicesObj: Services[] = [
  {
    icon: <GraduationCap size={40} strokeWidth={1} />,
    title: "Counseling",
    description:
      "Personalized sessions addressing academic, emotional, or personal concerns.",
  },
  {
    icon: <Handshake size={40} strokeWidth={1} />,
    title: "Career Guidance",
    description:
      "Helping students discover their strengths, career paths, and goals.",
  },
  {
    icon: <HeartPlus size={40} strokeWidth={1} />,
    title: "Mental Health Support",
    description:
      "Wellness programs and referral systems for psychological support.",
  },
  {
    icon: <LibraryBig size={40} strokeWidth={1} />,
    title: "Academic Advising",
    description:
      "Guidance for students facing academic challenges or decision-making struggles.",
  },
];

export default function ServiceSection() {
  return (
    <section className="flex gap-5 mt-20" id="service">
      <div className="items-left flex h-full w-1/2 flex-col justify-center space-y-4 mr-20 my-auto">
        <div className="w-fit rounded-xl border-1 border-gray-200 bg-white px-10 py-2">
          Services
        </div>
        <p className="mt-5 w-full text-left text-4xl">What We Do</p>
        <p className="w-full text-left">
          The Guidance and Counseling Services offer the following to the
          university&apos;s constituents
        </p>
        <div className="space-y-4 mt-10">
          {servicesObj.map((service) => (
            <div
              key={service.title}
              className="flex gap-4 rounded-2xl border-1 border-gray-200 bg-white p-6"
            >
              {service.icon}
              <div>
                <p className="font-medium">{service.title}</p>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white relative w-1/2 rounded-4xl h-dvh max-h-[700px] border-1 border-gray-200">
        <Image
          src={img}
          alt="Authentication image"
          fill
          priority
          className="rounded-4xl object-cover p-3"
        />
      </div>
    </section>
  );
}
