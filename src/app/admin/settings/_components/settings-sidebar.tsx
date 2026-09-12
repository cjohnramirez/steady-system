"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

const settingsObj = [
  { name: "Account Settings", link: "/admin/settings/account" },
  { name: "System Configuration", link: "/admin/settings/system" },
];

export default function SettingsSidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="w-64 space-y-8">
      <InputGroup className="bg-white">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search settings"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
          defaultValue={searchParams.get("query")?.toString()}
        />
      </InputGroup>
      <div className="flex flex-col gap-4 text-sm">
        {settingsObj.map((setting) => {
          const isActive =
            (pathname === "/admin/settings" &&
              setting.name === "Account Settings") ||
            pathname === setting.link;

          const activeStatus = clsx({
            "font-medium": isActive,
            "": !isActive,
          });

          return (
            <Link
              key={setting.name}
              href={setting.link}
              className={activeStatus}
            >
              {setting.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
