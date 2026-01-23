"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { ChevronDown, ChevronUp, User } from "lucide-react";

interface Player {
  id: string;
  name: string;
  surname: string;
  phone?: string;
}

interface MatchCardProps {
  matchId: string;
  team1Name: string;
  team2Name: string;
  team1Players: Player[];
  team2Players: Player[];
  isTeam1: boolean; // true if current user is on team1
}

export default function MatchCard({
  matchId,
  team1Name,
  team2Name,
  team1Players,
  team2Players,
  isTeam1,
}: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const yourTeamName = isTeam1 ? team1Name : team2Name;
  const opponentTeamName = isTeam1 ? team2Name : team1Name;
  const opponentPlayers = isTeam1 ? team2Players : team1Players;

  return (
    <div className="border rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Main Match Info - Clickable */}
      <div className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="font-medium text-lg">
            {yourTeamName} vs {opponentTeamName}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/protected/submit-score?matchId=${matchId}`}>
            <SubmitButton className="text-sm px-4 py-2">
              Submit Score
            </SubmitButton>
          </Link>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label={isExpanded ? "Collapse match details" : "Expand match details"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t p-4 bg-muted/20">
          <div className="space-y-4">
            {/* Your Team */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Your Team
              </h4>
              <div className="text-lg font-medium mb-2">{yourTeamName}</div>
              <div className="space-y-2">
                {(isTeam1 ? team1Players : team2Players).map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {player.name} {player.surname}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opponent Team */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Opponent Team
              </h4>
              <div className="text-lg font-medium mb-2">{opponentTeamName}</div>
              <div className="space-y-2">
                {opponentPlayers.length > 0 ? (
                  opponentPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 text-sm p-2 bg-background rounded"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">
                          {player.name} {player.surname}
                        </div>
                        {player.phone && (
                          <div className="text-xs text-muted-foreground">
                            📞 {player.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No player information available
                  </div>
                )}
              </div>
            </div>

            {/* Match Scheduling Tip */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Contact the opponent team to schedule a
                time to play this match before the deadline.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}