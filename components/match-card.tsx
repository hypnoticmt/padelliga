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
    <div className="group relative border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500">
      {/* Colored accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 via-green-500 to-blue-500" />
      
      {/* Status badge */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 shadow-sm">
          ⏱️ Pending
        </span>
      </div>
      
      {/* Main Match Info */}
      <div className="p-5 pl-6">
        <div 
          className="flex-1 cursor-pointer mb-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {yourTeamName}
            </span>
            <span className="text-2xl text-gray-400 font-light">vs</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {opponentTeamName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
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
            <SubmitButton className="text-sm px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-md hover:shadow-lg transition-all">
              Submit Score
            </SubmitButton>
          </Link>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Your Team */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-500 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Your Team
                </h4>
              </div>
              <div className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-100">
                {yourTeamName}
              </div>
              <div className="space-y-2">
                {yourPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {player.name} {player.surname}
                    </span>
                  </div>
                ))}
                {yourPlayers.length === 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 italic">
                    Team roster pending
                  </p>
                )}
              </div>
            </div>

            {/* Opponent Team */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-500 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">
                  Opponent Team
                </h4>
              </div>
              <div className="text-lg font-bold mb-3 text-green-900 dark:text-green-100">
                {opponentTeamName}
              </div>
              <div className="space-y-3">
                {opponentPlayers.length > 0 ? (
                  opponentPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800/50 shadow-sm"
                    >
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {player.name} {player.surname}
                        </div>
                        {player.phone && (
                          <a 
                            href={`tel:${player.phone}`}
                            className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mt-1 group/phone"
                          >
                            <Phone className="h-3.5 w-3.5 group-hover/phone:animate-pulse" />
                            <span className="font-mono">{player.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-green-600 dark:text-green-400 italic p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800/50">
                    No player information available
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling Tip */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Schedule Your Match
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Contact the opponent team using the phone numbers above to coordinate a time to play this match.
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