#!/usr/bin/env python3
"""
autopush.py — Continuously auto-commit and push changes to GitHub.
Runs in a loop, checking for changes every 30 seconds.

Usage:
  python autopush.py            (runs forever, checks every 30s)
  python autopush.py --once     (runs once and exits)
  Ctrl+C to stop
"""

import subprocess
import sys
import os
import time
from datetime import datetime

REMOTE_URL = "https://github.com/Sadiq-Kolakar/GreenCorridor.git"
BRANCH = "main"
CHECK_INTERVAL = 30  # seconds between checks


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command and print it."""
    print(f"  >> {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.stderr.strip():
        print(result.stderr.strip())
    if check and result.returncode != 0:
        print(f"\n[ERROR] Command failed with exit code {result.returncode}")
    return result


def setup_repo(project_root: str) -> None:
    """One-time git repo setup."""
    # Initialize git repo if not already done
    if not os.path.exists(os.path.join(project_root, ".git")):
        print("🔧 Initializing git repository...")
        run(["git", "init"])
        run(["git", "branch", "-M", BRANCH])
    else:
        print("✅ Git repository already initialized.")

    # Ensure remote is set
    remotes = run(["git", "remote"], check=False).stdout.strip()
    if "origin" not in remotes:
        print(f"\n🔗 Adding remote origin: {REMOTE_URL}")
        run(["git", "remote", "add", "origin", REMOTE_URL])
    else:
        print("✅ Remote 'origin' already set.")

    # Create .gitignore if it doesn't exist
    gitignore_path = os.path.join(project_root, ".gitignore")
    if not os.path.exists(gitignore_path):
        print("\n📝 Creating .gitignore...")
        with open(gitignore_path, "w") as f:
            f.write(
                "node_modules/\n"
                "dist/\n"
                ".env\n"
                ".env.local\n"
                "*.env\n"
                ".DS_Store\n"
                "Thumbs.db\n"
                "backend/dist/\n"
            )
        print("  .gitignore created.")


def push_changes() -> bool:
    """Stage, commit, and push any detected changes. Returns True if pushed."""
    # Stage all changes
    run(["git", "add", "."])

    # Check if there's anything to commit
    status = run(["git", "status", "--porcelain"], check=False).stdout.strip()
    if not status:
        return False

    # Build commit message with timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"chore: auto-update [{timestamp}]"

    print(f"\n💬 Committing: \"{commit_msg}\"")
    run(["git", "commit", "-m", commit_msg])

    # Push to GitHub
    print(f"\n🚀 Pushing to origin/{BRANCH}...")
    push_result = run(["git", "push", "-u", "origin", BRANCH], check=False)

    if push_result.returncode != 0:
        print("\n⚠️  Regular push failed. Trying with --force-with-lease...")
        run(["git", "push", "--force-with-lease", "-u", "origin", BRANCH])

    return True


def main() -> None:
    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)
    print(f"\n📁 Working directory: {project_root}\n")

    # One-time setup
    setup_repo(project_root)

    run_once = "--once" in sys.argv
    push_count = 0

    print(f"\n{'='*50}")
    if run_once:
        print("🔁 Running single push...")
    else:
        print(f"🔁 Auto-push started! Checking every {CHECK_INTERVAL}s...")
        print(f"   Press Ctrl+C to stop.")
    print(f"{'='*50}\n")

    try:
        while True:
            now = datetime.now().strftime("%H:%M:%S")

            if push_changes():
                push_count += 1
                print(f"\n✅ [{now}] Push #{push_count} complete!\n")
            else:
                print(f"   [{now}] No changes detected.")

            if run_once:
                break

            # Wait before next check
            time.sleep(CHECK_INTERVAL)

    except KeyboardInterrupt:
        print(f"\n\n🛑 Stopped. Total pushes this session: {push_count}")
        print(f"   Repo: {REMOTE_URL}\n")


if __name__ == "__main__":
    main()
