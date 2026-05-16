#!/usr/bin/env python3
"""
Liest git-Log und erzeugt docs/RELEASE_NOTES.md aus Commit-Trailern.

Commit-Format (Conventional Commits + Trailer):
    feat: add bug report widget

    Release-Note: Bug-Report-Widget auf jeder Seite. Geht direkt an Slack.
    Aufwand: 1h 20min
    Kategorie: Neu

Kategorien: Neu | Verbesserung | Infra | Fix | Docs
"""

import re
import subprocess
from collections import defaultdict
from datetime import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
OUTPUT = REPO_ROOT / "docs" / "RELEASE_NOTES.md"

KATEGORIE_EMOJI = {
    "Neu": "🆕",
    "Verbesserung": "✨",
    "Infra": "⚙️",
    "Fix": "🐛",
    "Docs": "📝",
}

KATEGORIE_ORDER = ["Neu", "Verbesserung", "Fix", "Infra", "Docs"]


def parse_duration_to_minutes(s: str) -> float:
    """'1h 20min' → 80.0"""
    total = 0.0
    if m := re.search(r"(\d+(?:[.,]\d+)?)\s*h", s):
        total += float(m.group(1).replace(",", ".")) * 60
    if m := re.search(r"(\d+(?:[.,]\d+)?)\s*min", s):
        total += float(m.group(1).replace(",", "."))
    return total


def minutes_to_str(mins: float) -> str:
    h, m = divmod(int(mins), 60)
    return f"{h} h {m:02d} min" if h else f"{m} min"


def get_commits() -> list[dict]:
    result = subprocess.run(
        ["git", "log", "--format=%H%n%ai%n%s%n%b%n---END---"],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    commits = []
    for block in result.stdout.split("---END---"):
        lines = [l for l in block.strip().splitlines() if l.strip()]
        if len(lines) < 2:
            continue

        sha = lines[0].strip()
        date_str = lines[1].strip()
        subject = lines[2].strip() if len(lines) > 2 else ""
        body = "\n".join(lines[3:])

        release_note = ""
        aufwand_str = ""
        kategorie = "Verbesserung"

        for line in body.splitlines():
            if line.startswith("Release-Note:"):
                release_note = line.removeprefix("Release-Note:").strip()
            elif line.startswith("Aufwand:"):
                aufwand_str = line.removeprefix("Aufwand:").strip()
            elif line.startswith("Kategorie:"):
                kategorie = line.removeprefix("Kategorie:").strip()

        if not release_note:
            continue

        try:
            date = datetime.fromisoformat(date_str).date()
        except ValueError:
            continue

        commits.append({
            "sha": sha[:7],
            "date": date,
            "subject": subject,
            "release_note": release_note,
            "aufwand_str": aufwand_str,
            "aufwand_min": parse_duration_to_minutes(aufwand_str) if aufwand_str else 0,
            "kategorie": kategorie,
        })

    return commits


def render(commits: list[dict]) -> str:
    by_date: dict = defaultdict(list)
    for c in commits:
        by_date[c["date"]].append(c)

    total_min = sum(c["aufwand_min"] for c in commits)
    total_entries = len(commits)
    total_days = len(by_date)

    lines = [
        "# KAIA Release Notes",
        "",
        "> Jede Änderung am KAIA-Prototyp wird hier nachvollziehbar protokolliert —",
        "> vom ersten Commit bis heute. Pro Eintrag siehst du, was sich für Nutzer:innen",
        "> konkret geändert hat, plus die realistische Gesamt-Aufwands-Zeit.",
        ">",
        f"> **Zeit-Formel** — Commit-Tage: reine Chat-/Coding-Zeit + ⅓ Konzeptionierungs-Zeit",
        f"> + ⅓ Smoke-Test-Zeit = Chat × ⁵⁄₃.",
        "",
        "---",
        "",
        f"**Stand heute:** {datetime.now().strftime('%A, %d. %B %Y')}  ",
        f"**{total_entries} Einträge insgesamt · {total_days} Release-Tage · "
        f"{minutes_to_str(total_min)} Gesamt-Aufwand**",
        "",
        "---",
        "",
    ]

    for date in sorted(by_date.keys(), reverse=True):
        day_commits = by_date[date]
        day_min = sum(c["aufwand_min"] for c in day_commits)
        lines.append(f"## {date.strftime('%A, %d. %B %Y')}")
        lines.append(f"*{len(day_commits)} Einträge · Tag-Summe {minutes_to_str(day_min)}*")
        lines.append("")

        by_kat: dict = defaultdict(list)
        for c in day_commits:
            by_kat[c["kategorie"]].append(c)

        for kat in KATEGORIE_ORDER:
            if kat not in by_kat:
                continue
            emoji = KATEGORIE_EMOJI.get(kat, "•")
            lines.append(f"### {emoji} {kat}")
            lines.append("")
            for c in by_kat[kat]:
                aufwand = f" · `{c['aufwand_str']}`" if c["aufwand_str"] else ""
                lines.append(f"**`{c['sha']}`** — {c['release_note']}{aufwand}  ")
                lines.append(f"*{c['subject']}*")
                lines.append("")

    return "\n".join(lines)


if __name__ == "__main__":
    commits = get_commits()
    content = render(commits)
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"✓ {OUTPUT} — {len(commits)} Einträge")
