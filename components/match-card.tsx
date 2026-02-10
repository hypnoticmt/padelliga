"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { ChevronDown, ChevronUp, User, Phone } from "lucide-react";

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
  isTeam1: boolean;
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
  const yourPlayers = isTeam1 ? team1Players : team2Players;

  return (
    <div className="group relative border border-border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-200">
      {/* Accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-orange" />
      
      {/* Status badge */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
          Pending
        </span>
      </div>
      
      {/* Main Match Info */}
      <div className="p-5 pl-6">
        <div 
          className="flex-1 cursor-pointer mb-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-foreground">
              {yourTeamName}
            </span>
            <span className="text-2xl text-muted-foreground font-light">vs</span>
            <span className="text-xl font-semibold text-foreground">
              {opponentTeamName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-brand-orange hover:opacity-90 font-semibold transition-colors"
          >
            <User className="h-4 w-4" />
            {isExpanded ? "Hide details" : "View opponent details"}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          <Link href={`/protected/submit-score?matchId=${matchId}`}>
            <SubmitButton className="text-sm px-5 py-2.5 bg-brand-orange hover:bg-brand-orange/90 shadow-sm transition-all">
              Submit score
            </SubmitButton>
          </Link>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30">
          <div className="p-6 space-y-6">
            {/* Your Team */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-brand-orange rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">
                  Your team
                </h4>
              </div>
              <div className="text-lg font-semibold mb-3 text-foreground">
                {yourTeamName}
              </div>
              <div className="space-y-2">
                {yourPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {player.name} {player.surname}
                    </span>
                  </div>
                ))}
                {yourPlayers.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Team roster pending
                  </p>
                )}
              </div>
            </div>

            {/* Opponent Team */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-brand-green rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">
                  Opponent team
                </h4>
              </div>
              <div className="text-lg font-semibold mb-3 text-foreground">
                {opponentTeamName}
              </div>
              <div className="space-y-3">
                {opponentPlayers.length > 0 ? (
                  opponentPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border shadow-sm"
                    >
                      <div className="p-2 bg-brand-green/15 rounded-lg">
                        <User className="h-4 w-4 text-brand-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {player.name} {player.surname}
                        </div>
                        {player.phone && (
                          <a 
                            href={`tel:${player.phone}`}
                            className="flex items-center gap-1.5 text-sm text-brand-green hover:opacity-90 mt-1 group/phone"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span className="font-mono">{player.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic p-3 bg-background rounded-lg border border-border">
                    No player information available
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling Tip */}
            <div className="bg-background rounded-lg p-4 border border-border">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Schedule your match
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Contact the opponent team using the phone numbers above to coordinate a time to play.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}