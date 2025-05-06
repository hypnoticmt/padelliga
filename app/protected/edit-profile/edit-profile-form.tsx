"use client";

import { useState, FormEvent } from "react";
import { SubmitButton } from "@/components/submit-button";
import { updateProfileAction } from "./actions";

export default function EditProfileForm({ initial }: { initial: { name: string; surname: string; phone?: string } }) {
  const [name, setName] = useState(initial.name);
  const [surname, setSurname] = useState(initial.surname);
  const [phone, setPhone] = useState(initial.phone || "");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateProfileAction(new FormData(e.currentTarget));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">First Name</span>
        <input
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Last Name</span>
        <input
          name="surname"
          type="text"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
          className="border p-2 rounded"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Phone Number</span>
        <input
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded"
        />
      </label>

      <SubmitButton type="submit" className="mt-4">
        Save Changes
      </SubmitButton>
    </form>
  );
}
