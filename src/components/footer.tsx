import Image from "next/image";
import { NavBar } from "../app/home/_lib/nav-data";
import { ArrowUpRight, CalendarCheck2, Home, Mail, Phone } from "lucide-react";
import Link from "next/link";

type ContactInfo = {
  icon: React.ReactNode;
  text: string;
  link?: string;
};

export const contactObj: ContactInfo[] = [
  {
    icon: <Home size={20} strokeWidth={1} />,
    text: "Room 41-109, Claro M. Recto Avenue, Lapasan, Cagayan de Oro City 9000",
  },
  {
    icon: <Mail size={20} strokeWidth={1} />,
    text: "guidance@ustp.edu.ph",
    link: "mailto:guidance@ustp.edu.ph",
  },
  {
    icon: <Phone size={20} strokeWidth={1} />,
    text: "(088) 857-1739 local 123",
    link: "tel:+63888571739",
  },
  {
    icon: <CalendarCheck2 size={20} strokeWidth={1} />,
    text: "Monday - Friday, 8:00 AM - 5:00 PM",
  },
];

export default function Footer({ navBarObj }: { navBarObj: NavBar[] }) {
  return (
    <section className="border-t border-gray-200 bg-white p-15">
      <div className="m-auto flex max-w-[1600px] justify-between gap-4">
        <div className="w-1/3 space-y-10">
          <section className="flex items-center gap-4">
            <Image src="/icon.png" alt="logo" width={40} height={40} />
            <p className="font-medium">Guidance and Counseling Services</p>
          </section>
          <p>
            We are dedicated to the holistic development of every student
            fostering emotional, psychological, and academic balance through
            support, Counseling, and care.
          </p>
          <div className="space-y-2">
            <Link
              href="/misc/privacy-policy"
              className="flex items-center gap-2"
            >
              <p>Privacy Policy</p>
              <ArrowUpRight strokeWidth={1.25} />
            </Link>
            <Link
              href="/misc/meet-the-developers"
              className="flex items-center gap-2"
            >
              <p>Meet the Developers</p>
              <ArrowUpRight strokeWidth={1.25} />
            </Link>
          </div>
        </div>
        <div className="flex gap-20">
          <div className="space-y-10">
            {navBarObj.length !== 0 && (
              <>
                <p className="font-medium">Fast Links</p>
                <div className="flex flex-col gap-4">
                  {navBarObj.map((nav) => (
                    <a href={nav.link} key={nav.title}>
                      {nav.title}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="space-y-10">
            <p className="font-medium">Contact Info</p>
            <div className="flex flex-col gap-4">
              {contactObj.map((contact, index) => (
                <div key={index} className="flex items-start gap-2">
                  {contact.icon}
                  {contact.link ? (
                    <a href={contact.link} className="text-sm">
                      {contact.text}
                    </a>
                  ) : (
                    <p className="text-sm">{contact.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
