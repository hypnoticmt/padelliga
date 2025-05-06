"use client";

import { updateProfileAction } from "./actions";

export default function EditProfileForm({
  initial,
}: {
  initial: { name: string; surname: string; phone?: string };
}) {
  return (
    <form
      action={updateProfileAction}
      className="max-w-md mx-auto flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">First Name</span>
        <input
          name="name"
          type="text"
          defaultValue={initial.name}
          required
          className="border p-2 rounded"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Last Name</span>
        <input
          name="surname"
          type="text"
          defaultValue={initial.surname}
          required
          className="border p-2 rounded"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Phone Number</span>
        <input
          name="phone"
          type="tel"
          defaultValue={initial.phone ?? ""}
          className="border p-2 rounded"
        />
      </label>

      <button
        type="submit"
        className="mt-4 rounded bg-white text-black px-4 py-2"
      >
        Save Changes
      </button>
    </form>
  );
}
