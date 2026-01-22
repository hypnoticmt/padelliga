// lib/score-validation.ts
/**
 * Padel score validation utilities
 * Ensures scores follow official padel rules
 */

export interface SetScore {
  team1Games: number;
  team2Games: number;
  setWinner: 1 | 2;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a single set score according to padel rules
 */
export function validateSetScore(set: SetScore): ValidationResult {
  const errors: string[] = [];
  const { team1Games, team2Games, setWinner } = set;

  // Basic validation
  if (team1Games < 0 || team2Games < 0) {
    errors.push("Games cannot be negative");
  }

  if (team1Games > 7 || team2Games > 7) {
    errors.push("No team can have more than 7 games in a set");
  }

  // Check if winner is correctly set
  if (team1Games > team2Games && setWinner !== 1) {
    errors.push("Set winner doesn't match the score");
  }
  if (team2Games > team1Games && setWinner !== 2) {
    errors.push("Set winner doesn't match the score");
  }
  if (team1Games === team2Games) {
    errors.push("Set cannot end in a tie");
  }

  // Valid padel set scores:
  // 6-0, 6-1, 6-2, 6-3, 6-4 (win by 2+ games)
  // 7-5 (win by 2 when it was 5-5)
  // 7-6 (tiebreak at 6-6)
  
  const winner = setWinner === 1 ? team1Games : team2Games;
  const loser = setWinner === 1 ? team2Games : team1Games;
  const diff = winner - loser;

  if (winner === 6) {
    // Standard set win: 6-0, 6-1, 6-2, 6-3, 6-4
    if (loser > 4) {
      errors.push("At 6 games, opponent can have max 4 games (unless 7-5 or 7-6)");
    }
  } else if (winner === 7) {
    // Extended set: must be 7-5 or 7-6
    if (loser !== 5 && loser !== 6) {
      errors.push("7 games is only valid for 7-5 or 7-6 scores");
    }
  } else if (winner < 6) {
    errors.push("Winning team must have at least 6 games");
  }

  // Check win by 2 rule (except for tiebreak)
  if (winner === 6 && loser === 5) {
    errors.push("Cannot win 6-5, must continue to 7-5");
  }
  if (winner === 6 && loser === 6) {
    errors.push("At 6-6, set goes to tiebreak (7-6)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a complete match score (best of 3 sets)
 */
export function validateMatchScore(sets: SetScore[]): ValidationResult {
  const errors: string[] = [];

  // Must have exactly 3 sets in padel
  if (sets.length !== 3) {
    errors.push("Padel matches must have exactly 3 sets");
  }

  // Validate each set
  sets.forEach((set, index) => {
    const setValidation = validateSetScore(set);
    if (!setValidation.valid) {
      errors.push(`Set ${index + 1}: ${setValidation.errors.join(", ")}`);
    }
  });

  // Check match winner consistency
  const team1Sets = sets.filter((s) => s.setWinner === 1).length;
  const team2Sets = sets.filter((s) => s.setWinner === 2).length;

  if (team1Sets !== 2 && team2Sets !== 2) {
    errors.push(
      "One team must win 2 out of 3 sets. Current: Team 1 won " +
        team1Sets +
        " sets, Team 2 won " +
        team2Sets +
        " sets"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate match summary string (e.g., "6-4, 3-6, 6-2")
 */
export function formatMatchScore(sets: SetScore[]): string {
  return sets
    .map((set) => `${set.team1Games}-${set.team2Games}`)
    .join(", ");
}

/**
 * Determine match winner from sets
 */
export function getMatchWinner(sets: SetScore[]): 1 | 2 | null {
  const team1Sets = sets.filter((s) => s.setWinner === 1).length;
  const team2Sets = sets.filter((s) => s.setWinner === 2).length;

  if (team1Sets === 2) return 1;
  if (team2Sets === 2) return 2;
  return null;
}

/**
 * Helper to suggest correct score when validation fails
 */
export function suggestCorrection(
  team1Games: number,
  team2Games: number
): string[] {
  const suggestions: string[] = [];

  if (team1Games === 6 && team2Games === 5) {
    suggestions.push("Continue playing. Score should be 7-5 or 6-6 (then 7-6)");
  }

  if (team1Games === 6 && team2Games === 6) {
    suggestions.push("Play tiebreak. Final score should be 7-6");
  }

  if (team1Games === 5 && team2Games === 6) {
    suggestions.push("Continue playing. Score should be 7-5 or 6-6 (then 7-6)");
  }

  if (Math.abs(team1Games - team2Games) === 1 && Math.max(team1Games, team2Games) >= 6) {
    suggestions.push("Must win by 2 games (unless tiebreak at 7-6)");
  }

  return suggestions;
}