"use client";

import { useState } from "react";

interface AccountData {
  // declare interface here, create other interfaces if desired
  // model interface from the existing database schema
}

export default function AccountsPage() {
  const [data, setData] = useState(""); //hooks are always above

  const AccountDataObj: AccountData = {
    // dummy data, considering wapay backend, use interface for type safety
  };

  return (
    <div>
      <h1>Account Page</h1>
    </div>
  );
}


