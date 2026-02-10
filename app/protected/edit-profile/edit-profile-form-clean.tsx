"use client";

import { useState, FormEvent } from "react";
import { SubmitButton } from "@/components/submit-button";
import { updateProfileAction } from "./actions";

export default function EditProfileForm({
  initial,
}: {
  initial: { name: string; surname: string; phone?: string };
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await updateProfileAction(formData);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 space-y-6"
    >
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          First Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initial.name}
          placeholder="Enter your first name"
          required
          disabled={submitting}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
        />
      </div>

      {/* Surname */}
      <div>
        <label htmlFor="surname" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Last Name
        </label>
        <input
          id="surname"
          name="surname"
          type="text"
          defaultValue={initial.surname}
          placeholder="Enter your last name"
          required
          disabled={submitting}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial.phone ?? ""}
          placeholder="Enter your phone number"
          disabled={submitting}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Optional: Your teammates can use this to contact you
        </p>
      </div>

      {/* Submit Button */}
      <SubmitButton
        type="submit"
        disabled={submitting}
        className="w-full py-3 text-base font-medium bg-orange-500 hover:bg-orange-600 rounded-lg transition-all disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Changes"}
      </SubmitButton>
    </form>
  );
}
