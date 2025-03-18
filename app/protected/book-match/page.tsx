// app/book-match/page.tsx
import { createClient } from "@/utils/supabase/server"
import BookMatchForm from "../book-match-form"

export default async function BookMatchPage() {
  const supabase = await createClient()

  // 1. Fetch teams
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")

  if (teamsError) {
    console.error("Error fetching teams:", teamsError.message)
  }

  // 2. Ensure we pass an array to BookMatchForm (avoid passing null/undefined)
  const safeTeams = teams ?? []

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Book a Match</h1>

      {safeTeams.length > 0 ? (
        <BookMatchForm teams={safeTeams} />
      ) : (
        <p className="text-sm text-foreground/70">
          No teams available. Please create a team first.
        </p>
      )}
    </div>
  )
}
