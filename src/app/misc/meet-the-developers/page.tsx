import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  image: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Gerlie Campion",
    role: "Technical Writer and Documentation Specialist",
    email: "campiongerlie18@gmail.com",
    image: "",
  },
  {
    id: 2,
    name: "Francis Adrian Esteban",
    role: "Quality Assurance (QA) and Tester",
    email: "francisadrian.esteban@1.ustp.edu.ph",
    image: "",
  },
  {
    id: 3,
    name: "Jhey Gulde",
    role: "Backend Developer and System Architect",
    email: "gulde.jhey8@gmail.com",
    image: "",
  },
  {
    id: 4,
    name: "Kathleen Grace Gultiano",
    role: "UI/UX Designer",
    email: "gultiano.kathleengrace@gmail.com",
    image: "",
  },
  {
    id: 5,
    name: "John Carl Ramirez",
    role: "Project Manager and Full-Stack Developer",
    email: "johncarl.ramirez.dev@gmail.com",
    image: "",
  },
  {
    id: 6,
    name: "Renchille Pateño",
    role: "Support and Maintenance Team Lead",
    email: "pateno.renchille2002@gmail.com",
    image: "",
  },
];

export default function MeetTheDevelopers() {
  return (
    <main className="w-full bg-white rounded-4xl border">
      <section className="flex items-center justify-between border-b-1">
        <div className="space-y-2 p-10">
          <p className="text-6xl">Meet the developers</p>
          <p>Welcome! Here is a little about the team behind this project.</p>
        </div>
        <div className="relative h-25 w-40">
          <Image
            src="/codebridge-icon.png"
            alt="placeholder"
            fill
            className="rounded-4xl object-cover p-4"
          />
        </div>
      </section>
      <section className="grid grid-cols-2 grid-rows-3 gap-10 p-10">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="flex gap-5">
            <div className="from-brand-light to-brand-normal h-25 w-25 rounded-full bg-linear-to-t" />
            <div className="flex flex-col justify-between">
              <div>
                <p className="font-medium">{member.name}</p>
                <p>{member.role}</p>
              </div>
              <a className="border flex rounded-2xl items-center gap-4 px-4 py-2" href={`mailto:${member.email}`}>
                <Mail strokeWidth={1.25}/>
                <p>{member.email}</p>
              </a>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
