"use client";

import { SubmitButton } from "@/components/submit-button";
import { updateProfileAction } from "./actions";

export default function EditProfileForm({
  initial,
}: {
  initial: { name: string; surname: string; phone?: string };
}) {
  return (
    <form
      action={updateProfileAction}
      className="w-full max-w-sm mx-auto p-6 bg-background border rounded-lg shadow-sm flex flex-col space-y-4"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          First Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initial.name}
          required
          className="w-full p-3 rounded-lg border text-sm"
        />
      </div>

      <div>
        <label htmlFor="surname" className="block text-sm font-medium mb-1">
          Last Name
        </label>
        <input
          id="surname"
          name="surname"
          type="text"
          defaultValue={initial.surname}
          required
          className="w-full p-3 rounded-lg border text-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone ?? ""}
          className="w-full p-3 rounded-lg border text-sm"
        />
      </div>

      <SubmitButton
        type="submit"
        className="w-full rounded-lg bg-primary font-bold p-3 hover:bg-primary/90"
      >
        Save Changes
      </SubmitButton>
    </form>
  );
}
