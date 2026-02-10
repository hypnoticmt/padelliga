"use client";

import { useState } from "react";
import { IconBadge } from "./IconBadge";

export function PlayerCodeCard({ code }: { code: string | null | undefined }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-4">
        <IconBadge src="/icons/flaticon/player-code-paddle.png" alt="Player code" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Player code</p>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-semibold text-foreground tracking-wider">
              {code ?? "—"}
            </span>
            <button
              type="button"
              onClick={onCopy}
              disabled={!code}
              className="px-3 py-2 text-sm font-semibold rounded-lg border border-border bg-background hover:border-brand-orange transition-colors disabled:opacity-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Share this with a teammate so they can join your team.
          </p>
        </div>
      </div>
    </div>
  );
}
