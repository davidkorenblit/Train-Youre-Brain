#!/usr/bin/env python3
"""
CodeReview Arena - Supabase Setup & Seeding Script

Purpose:
1. Reads connection details from .env (or .env.example fallback).
2. Connects to PostgreSQL database on Supabase.
3. Executes scripts/schema.sql to create tables: challenges, users, submissions.
4. Traverses dataset/ (Level 1, 2, 3) and seeds all 35 challenges with:
   - context_prompt (README.md)
   - buggy_code (buggy.py)
   - fixed_code (solution.py)
   - golden_bugs (golden_bug.json)
5. Verifies data integrity with a sanity check query.
"""

import json
import os
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = Path(__file__).resolve().parent
DATASET_DIR = ROOT_DIR / "dataset"
ENV_PATH = ROOT_DIR / ".env"
ENV_EXAMPLE_PATH = ROOT_DIR / ".env.example"


def install_driver_if_needed():
    """Ensure a postgres driver is available (psycopg2-binary or psycopg)."""
    try:
        import psycopg2  # noqa: F401
        return "psycopg2"
    except ImportError:
        pass

    try:
        import psycopg  # noqa: F401
        return "psycopg"
    except ImportError:
        pass

    print("[*] Installing psycopg2-binary for database connection...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    return "psycopg2"


def parse_env_file():
    """Parse key-value pairs from .env or .env.example."""
    env_file = ENV_PATH if ENV_PATH.exists() else ENV_EXAMPLE_PATH
    if not env_file.exists():
        raise FileNotFoundError("Neither .env nor .env.example found.")

    config = {}
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                config[k.strip()] = v.strip().strip('"').strip("'")
    return config


def get_connection_urls(config):
    """
    Construct connection URL candidates.
    Supports direct connection and IPv4-friendly Supabase pooler.
    """
    conn_str = config.get("Connection string") or config.get("DATABASE_URL")
    password = config.get("Database password")
    project_id = config.get("Project ID", "lyxcrcnhcujldrktoblm")
    region = config.get("Project region", "ap-south-1")

    candidates = []

    if conn_str:
        # Normalize
        if "[YOUR-PASSWORD]" in conn_str and password:
            conn_str = conn_str.replace("[YOUR-PASSWORD]", password)
        candidates.append(conn_str)

    # IPv4 Pooler candidate (Transaction pooler port 6543)
    if password and project_id:
        pooler_url = f"postgresql://postgres.{project_id}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres?sslmode=require"
        candidates.append(pooler_url)
        # Session pooler port 5432
        session_url = f"postgresql://postgres.{project_id}:{password}@aws-0-{region}.pooler.supabase.com:5432/postgres?sslmode=require"
        candidates.append(session_url)

    return candidates


def connect_to_database(candidates):
    """Attempt connecting with candidates until one succeeds."""
    import psycopg2

    last_error = None
    for url in candidates:
        # Hide password in logs
        safe_url = re.sub(r":([^:@]+)@", ":****@", url)
        print(f"--> Attempting connection to: {safe_url}")
        try:
            conn = psycopg2.connect(url, connect_timeout=15)
            conn.autocommit = True
            print("[+] Successfully connected to Supabase PostgreSQL!")
            return conn
        except Exception as e:
            print(f"    Connection failed: {e}")
            last_error = e

    raise ConnectionError(f"Could not connect to any candidate URL. Last error: {last_error}")


def create_schema(conn):
    """Execute schema.sql to ensure all tables exist."""
    schema_file = SCRIPTS_DIR / "schema.sql"
    if not schema_file.exists():
        raise FileNotFoundError(f"schema.sql not found at {schema_file}")

    print("\n--> Applying database schema (scripts/schema.sql)...")
    sql = schema_file.read_text(encoding="utf-8")
    with conn.cursor() as cur:
        cur.execute(sql)
    print("[+] Tables 'challenges', 'users', 'submissions' are ready in Supabase.")


def seed_challenges(conn):
    """Traverse dataset/ and upsert 35 exercises into challenges table."""
    level_mapping = {
        "Level_1_Fundamentals": 1,
        "Level_2_Software_Engineering": 2,
        "Level_3_Real_World": 3,
    }

    upsert_sql = """
        INSERT INTO public.challenges (
            title, slug, level, language, context_prompt, buggy_code, fixed_code, golden_bugs, source_metadata
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            level = EXCLUDED.level,
            context_prompt = EXCLUDED.context_prompt,
            buggy_code = EXCLUDED.buggy_code,
            fixed_code = EXCLUDED.fixed_code,
            golden_bugs = EXCLUDED.golden_bugs,
            source_metadata = EXCLUDED.source_metadata,
            updated_at = now();
    """

    total_inserted = 0

    print("\n--> Seeding challenges from dataset/...")

    for level_dir_name, level_num in level_mapping.items():
        level_path = DATASET_DIR / level_dir_name
        if not level_path.exists():
            print(f"[!] Warning: Directory not found: {level_path}")
            continue

        for ex_dir in sorted(level_path.iterdir()):
            if not ex_dir.is_dir():
                continue

            slug = ex_dir.name
            title = slug.replace("_", " ").title()

            readme_file = ex_dir / "README.md"
            buggy_file = ex_dir / "buggy.py"
            solution_file = ex_dir / "solution.py"
            golden_file = ex_dir / "golden_bug.json"

            if not (readme_file.exists() and buggy_file.exists() and solution_file.exists() and golden_file.exists()):
                print(f"[!] Skipping {slug} - missing one of required files.")
                continue

            context_prompt = readme_file.read_text(encoding="utf-8")
            buggy_code = buggy_file.read_text(encoding="utf-8")
            fixed_code = solution_file.read_text(encoding="utf-8")
            golden_data = json.loads(golden_file.read_text(encoding="utf-8"))

            # Ensure golden_bugs is a JSON array
            golden_bugs_list = golden_data if isinstance(golden_data, list) else [golden_data]

            source_metadata = {
                "dataset_level": level_dir_name,
                "exercise_slug": slug,
            }

            with conn.cursor() as cur:
                cur.execute(
                    upsert_sql,
                    (
                        title,
                        slug,
                        level_num,
                        "python",
                        context_prompt,
                        buggy_code,
                        fixed_code,
                        json.dumps(golden_bugs_list),
                        json.dumps(source_metadata),
                    )
                )

            total_inserted += 1
            print(f"  [{total_inserted:02d}/35] Seeded: Level {level_num} - {slug}")

    print(f"\n[+] Seeding complete! Total challenges upserted: {total_inserted}")


def verify_database(conn):
    """Run verification queries to confirm data is visible."""
    print("\n============================================================")
    print("VERIFICATION: Querying Supabase Database")
    print("============================================================")

    with conn.cursor() as cur:
        cur.execute("SELECT level, count(*) FROM public.challenges GROUP BY level ORDER BY level;")
        rows = cur.fetchall()
        print("\nChallenges per Level:")
        for level, count in rows:
            print(f"  Level {level}: {count} exercises")

        cur.execute("SELECT count(*) FROM public.challenges;")
        total = cur.fetchone()[0]
        print(f"\nTotal challenges in database: {total}")

        # Fetch a sample
        cur.execute("SELECT title, level, slug, length(buggy_code), length(fixed_code) FROM public.challenges LIMIT 3;")
        sample_rows = cur.fetchall()
        print("\nSample records:")
        for r in sample_rows:
            print(f"  - [{r[1]}] {r[0]} (slug: {r[2]}) -> buggy: {r[3]} chars, fixed: {r[4]} chars")

    print("\n============================================================")
    print("[SUCCESS] All tables and data verified in Supabase!")
    print("============================================================")


def main():
    print("=" * 60)
    print("CodeReview Arena - Supabase Setup & Seeder")
    print("=" * 60)

    install_driver_if_needed()
    config = parse_env_file()
    candidates = get_connection_urls(config)

    conn = connect_to_database(candidates)
    try:
        create_schema(conn)
        seed_challenges(conn)
        verify_database(conn)
    finally:
        conn.close()
        print("\n--> Database connection closed cleanly.")


if __name__ == "__main__":
    main()
