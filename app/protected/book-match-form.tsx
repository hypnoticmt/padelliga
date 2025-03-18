// app/protected/book-match-form.tsx
"use client"

import { SubmitButton } from "@/components/submit-button"
import { bookMatchAction } from "./actions"
import { useState, FormEvent } from "react"

export default function BookMatchForm({ teams }: { teams: any[] }) {
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [date, setDate] = useState("")

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await bookMatchAction(new FormData(e.currentTarget))
      // Optionally reset form or display a success message
      setTeam1("")
      setTeam2("")
      setDate("")
      alert("Match booked successfully!")
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 max-w-md">
      <label className="flex flex-col gap-1">
        <span className="text-sm">Team 1</span>
        <select
          name="team1_id"
          value={team1}
          onChange={(e) => setTeam1(e.target.value)}
          className="border border-foreground/20 p-2 rounded"
          required
        >
          <option value="">-- Select Team --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Team 2</span>
        <select
          name="team2_id"
          value={team2}
          onChange={(e) => setTeam2(e.target.value)}
          className="border border-foreground/20 p-2 rounded"
          required
        >
          <option value="">-- Select Team --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm">Match Date/Time</span>
        <input
          type="datetime-local"
          name="match_date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-foreground/20 p-2 rounded"
          required
        />
      </label>

      <SubmitButton
        type="submit"
        className="flex flex-col gap-1"
      >
        Book Match
      </SubmitButton>
    </form>
  )
}
