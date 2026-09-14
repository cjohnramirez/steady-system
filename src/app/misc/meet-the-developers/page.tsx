import type { Metadata } from "next";
import Image from "next/image";
import { Mail } from "lucide-react";
import { UserAvatar } from "@/components/app/user-avatar";

export const metadata: Metadata = { title: "Meet the developers | GCS" };

type TeamMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  image: string;
};

const teamMembers: TeamMember[] = [
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
    <article className="bg-card w-full overflow-hidden rounded-3xl border md:rounded-4xl">
      <header className="flex flex-col-reverse gap-6 border-b p-6 sm:flex-row sm:items-center sm:justify-between md:p-10">
        <div className="space-y-3">
          <h1 className="text-4xl tracking-tight md:text-5xl">
            Meet the developers
          </h1>
          <p className="text-muted-foreground">
            The team behind the GCS system.
          </p>
        </div>
        <Image
          src="/codebridge-icon.png"
          alt="CodeBridge"
          width={120}
          height={75}
          className="h-auto w-24 object-contain"
        />
      </header>
      <ul className="grid gap-6 p-6 sm:grid-cols-2 md:p-10">
        {teamMembers.map((member) => (
          <li key={member.id} className="flex items-start gap-4">
            <UserAvatar name={member.name} src={member.image} size="md" />
            <div className="min-w-0 space-y-2">
              <div>
                <h2 className="font-medium">{member.name}</h2>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
              <a
                className="hover:bg-muted flex w-fit max-w-full items-center gap-2 rounded-full border px-3 py-1.5"
                href={`mailto:${member.email}`}
              >
                <Mail
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-4 shrink-0"
                />
                <span className="truncate">{member.email}</span>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
