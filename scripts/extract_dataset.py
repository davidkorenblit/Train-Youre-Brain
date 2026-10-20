#!/usr/bin/env python3
"""
Dataset Extraction Script for Code Review Training Platform (CodeReview Arena)

Extracts code examples into:
/dataset
  /Level_1_Fundamentals
     /<Exercise_Name>
        - README.md
        - solution.py
  /Level_2_Software_Engineering
     /<Pattern_Name>
        - README.md
        - solution.py
  /Level_3_Real_World
     /<Component_Name>
        - README.md
        - solution.py

Sources:
1. Level 1: https://github.com/exercism/python (15 practice exercises)
2. Level 2: https://github.com/faif/python-patterns (10 OOP / Design Patterns)
3. Level 3: https://github.com/nsidnev/fastapi-realworld-example-app (10 Backend logic files: Auth, Routing, DB)
"""

import ast
import os
import re
import shutil
import stat
import subprocess
import sys
from pathlib import Path


def remove_readonly(func, path, exc_info):
    """Handle read-only files when deleting git directories on Windows."""
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception:
        pass


def run_command(cmd, cwd=None):
    """Run a shell command and return stdout or raise error."""
    print(f"--> Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=True
    )
    return res.stdout


def clone_repo(url, dest_dir):
    """Shallow clone a git repository to save bandwidth and time."""
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir, onerror=remove_readonly)
    cmd = ["git", "clone", "--depth", "1", url, dest_dir]
    run_command(cmd)


def extract_level_1(temp_dir, output_dir):
    """
    Level 1: 15 basic algorithms/logic exercises from exercism/python
    Folder: exercises/practice
    """
    print("\n==========================================")
    print("Processing Level 1: Fundamentals (Exercism)")
    print("==========================================")
    
    repo_url = "https://github.com/exercism/python.git"
    clone_path = os.path.join(temp_dir, "exercism_python")
    clone_repo(repo_url, clone_path)

    practice_dir = Path(clone_path) / "exercises" / "practice"
    if not practice_dir.exists():
        raise FileNotFoundError(f"Practice exercises dir not found at: {practice_dir}")

    # Prioritize classic algorithmic and logic exercises
    preferred_exercises = [
        "two-fer",
        "leap",
        "reverse-string",
        "armstrong-numbers",
        "collatz-conjecture",
        "triangle",
        "grains",
        "bob",
        "pangram",
        "raindrops",
        "hamming",
        "isogram",
        "difference-of-squares",
        "darts",
        "resistor-color",
        "isbn-verifier",
        "rotational-cipher",
        "anagram",
        "acronym",
        "rna-transcription"
    ]

    all_exercises = [p.name for p in practice_dir.iterdir() if p.is_dir()]
    ordered_exercises = [e for e in preferred_exercises if e in all_exercises]
    # Add any remaining if needed
    for e in all_exercises:
        if e not in ordered_exercises:
            ordered_exercises.append(e)

    extracted_count = 0
    level_dir = Path(output_dir) / "Level_1_Fundamentals"
    level_dir.mkdir(parents=True, exist_ok=True)

    for ex_slug in ordered_exercises:
        if extracted_count >= 15:
            break

        ex_path = practice_dir / ex_slug

        # Look for exemplar / example solution
        solution_content = None
        solution_candidates = [
            ex_path / ".meta" / "exemplar.py",
            ex_path / ".meta" / "example.py",
        ]
        # Also check wildcard in .meta
        meta_dir = ex_path / ".meta"
        if meta_dir.exists():
            for f in meta_dir.glob("*.py"):
                if "exemplar" in f.name.lower() or "example" in f.name.lower():
                    solution_candidates.append(f)

        for sc in solution_candidates:
            if sc.exists() and sc.is_file():
                solution_content = sc.read_text(encoding="utf-8", errors="replace")
                break

        # Look for README / Instructions
        readme_content = None
        readme_candidates = [
            ex_path / "README.md",
            ex_path / ".docs" / "instructions.md",
        ]
        
        instructions_file = ex_path / ".docs" / "instructions.md"
        intro_file = ex_path / ".docs" / "introduction.md"
        if instructions_file.exists():
            parts = []
            if intro_file.exists():
                parts.append(intro_file.read_text(encoding="utf-8", errors="replace").strip())
            parts.append(instructions_file.read_text(encoding="utf-8", errors="replace").strip())
            readme_content = "\n\n".join(parts)
        elif (ex_path / "README.md").exists():
            readme_content = (ex_path / "README.md").read_text(encoding="utf-8", errors="replace")

        if not solution_content or not readme_content:
            continue

        # Format title
        title = ex_slug.replace("-", " ").title()
        formatted_name = ex_slug.replace("-", "_")
        dest_exercise_dir = level_dir / formatted_name
        dest_exercise_dir.mkdir(parents=True, exist_ok=True)

        full_readme = f"# {title}\n\n## Context & Problem Description\n\n{readme_content}\n"
        
        (dest_exercise_dir / "README.md").write_text(full_readme, encoding="utf-8")
        (dest_exercise_dir / "solution.py").write_text(solution_content, encoding="utf-8")
        
        extracted_count += 1
        print(f"  [{extracted_count}/15] Level 1: Extracted {formatted_name}")

    print(f"Level 1 complete: {extracted_count} exercises extracted.")


def extract_level_2(temp_dir, output_dir):
    """
    Level 2: 10 exercises demonstrating OOP, design patterns, or concurrency.
    Source: faif/python-patterns
    """
    print("\n=======================================================")
    print("Processing Level 2: Software Engineering (Design Patterns)")
    print("=======================================================")

    repo_url = "https://github.com/faif/python-patterns.git"
    clone_path = os.path.join(temp_dir, "python_patterns")
    clone_repo(repo_url, clone_path)

    patterns_base = Path(clone_path) / "patterns"
    if not patterns_base.exists():
        patterns_base = Path(clone_path)

    # Search for all python files in patterns/
    pattern_files = list(patterns_base.rglob("*.py"))
    
    # Filter out test files, __init__.py, etc.
    valid_files = [
        f for f in pattern_files 
        if not f.name.startswith("__") 
        and not f.name.startswith("test_")
        and f.stat().st_size > 400
    ]

    # Target 10 diverse patterns across Creational, Structural, Behavioral, Concurrency
    priority_patterns = [
        "factory",
        "abstract_factory",
        "builder",
        "singleton",
        "prototype",
        "adapter",
        "decorator",
        "facade",
        "proxy",
        "observer",
        "strategy",
        "command",
        "state",
        "template",
        "borg",
        "publish_subscribe"
    ]

    selected_files = []
    # Match priority patterns first
    for pat in priority_patterns:
        for f in valid_files:
            if pat in f.stem.lower() and f not in selected_files:
                selected_files.append(f)
                break
        if len(selected_files) >= 10:
            break

    # Fill up if less than 10
    if len(selected_files) < 10:
        for f in valid_files:
            if f not in selected_files:
                selected_files.append(f)
            if len(selected_files) >= 10:
                break

    level_dir = Path(output_dir) / "Level_2_Software_Engineering"
    level_dir.mkdir(parents=True, exist_ok=True)

    extracted_count = 0
    for p_file in selected_files:
        code = p_file.read_text(encoding="utf-8", errors="replace")
        
        # Extract docstring if present
        docstring = ""
        try:
            tree = ast.parse(code)
            docstring = ast.get_docstring(tree) or ""
        except Exception:
            match = re.match(r'^\s*([\'"]{3})(.*?)\1', code, re.DOTALL)
            if match:
                docstring = match.group(2).strip()

        pattern_name = p_file.stem
        readable_title = pattern_name.replace("_", " ").title()
        category = p_file.parent.name.capitalize() if p_file.parent.name != "patterns" else "Design Pattern"

        readme_text = f"# {readable_title} Pattern\n\n"
        readme_text += f"**Category:** {category}  \n"
        readme_text += f"**Source:** `faif/python-patterns/{p_file.relative_to(clone_path)}`\n\n"
        
        if docstring:
            readme_text += f"## Overview & Pattern Description\n\n{docstring.strip()}\n\n"
        else:
            readme_text += (
                f"## Overview\n\n"
                f"This exercise demonstrates the implementation of the **{readable_title}** pattern in Python.\n"
                f"It showcases key object-oriented principles, interface separation, and encapsulation.\n\n"
            )

        readme_text += (
            "## Code Review Exercise Focus\n"
            "- **Design & Encapsulation**: Are responsibilities clearly separated across classes/interfaces?\n"
            "- **Pythonic Idioms**: Does the pattern utilize Python features (dunder methods, properties, duck typing) cleanly?\n"
            "- **Extensibility & Edge Cases**: Is the implementation robust against unexpected inputs or multithreading/re-entrance if applicable?\n"
        )

        dest_dir = level_dir / pattern_name
        dest_dir.mkdir(parents=True, exist_ok=True)

        (dest_dir / "README.md").write_text(readme_text, encoding="utf-8")
        (dest_dir / "solution.py").write_text(code, encoding="utf-8")

        extracted_count += 1
        print(f"  [{extracted_count}/10] Level 2: Extracted {pattern_name} ({category})")

    print(f"Level 2 complete: {extracted_count} patterns extracted.")


def extract_level_3(temp_dir, output_dir):
    """
    Level 3: 10 backend logic examples (Routing, Auth, DB operations).
    Source: nsidnev/fastapi-realworld-example-app
    Folders: core, api, db
    """
    print("\n============================================================")
    print("Processing Level 3: Real-World Backend (FastAPI RealWorld App)")
    print("============================================================")

    repo_url = "https://github.com/nsidnev/fastapi-realworld-example-app.git"
    clone_path = os.path.join(temp_dir, "fastapi_realworld")
    clone_repo(repo_url, clone_path)

    app_dir = Path(clone_path) / "app"
    if not app_dir.exists():
        # Search for app folder
        found = list(Path(clone_path).rglob("app"))
        if found:
            app_dir = found[0]
        else:
            raise FileNotFoundError("Could not find app directory in fastapi-realworld-example-app")

    # Target 10 meaningful files across core, api, db
    targets = [
        # Auth & Security (core)
        ("core/jwt.py", "jwt_auth_service", "Authentication & JWT Token Management",
         "Handles creation, signing, and cryptographic decoding of JSON Web Tokens (JWT) for user sessions.",
         "Security"),
        ("core/settings/app.py", "app_configuration", "Application Settings & Configuration",
         "Centralized Pydantic application configuration with environment variable validation, secret keys, and database URLs.",
         "Core Configuration"),
        ("core/errors/http_error.py", "http_error_handlers", "HTTP Exception & Error Handlers",
         "Centralized FastAPI error handlers that convert internal exceptions into structured JSON responses.",
         "Core Logic"),
        # Routing & APIs (api)
        ("api/routes/authentication.py", "auth_routes", "User Registration & Authentication Endpoints",
         "API endpoints for user signup and login, verifying credentials and issuing JWT tokens.",
         "Routing / API"),
        ("api/routes/users.py", "user_profile_routes", "Current User & Profile Management API",
         "API endpoints to retrieve, inspect, and update authenticated user profile details.",
         "Routing / API"),
        ("api/routes/articles/articles_resource.py", "articles_crud_routes", "Articles CRUD & Feed Endpoints",
         "High-traffic API endpoints supporting article publishing, feed filtering, tags, and pagination.",
         "Routing / API"),
        ("api/dependencies/authentication.py", "auth_dependency", "FastAPI Current User Dependency",
         "Dependency injection component that parses the Authorization header, validates the JWT, and loads the active user.",
         "Auth & Dependencies"),
        ("api/dependencies/database.py", "database_dependency", "Database Session & Repository Dependency",
         "FastAPI dependency supplying async database connections and repository instances to route handlers.",
         "DB / Dependencies"),
        # DB Operations (db)
        ("db/repositories/users.py", "users_repository", "Users Database Repository",
         "Database queries and transactions for creating users, updating passwords, and finding users by email or username.",
         "DB Operations"),
        ("db/repositories/articles.py", "articles_repository", "Articles Database Repository",
         "Complex relational queries for articles, author joins, tag associations, and favorite counts.",
         "DB Operations")
    ]

    level_dir = Path(output_dir) / "Level_3_Real_World"
    level_dir.mkdir(parents=True, exist_ok=True)

    extracted_count = 0
    for rel_path, folder_name, title, desc, category in targets:
        source_file = app_dir / rel_path
        
        # Fallback if path slightly differs (e.g. articles.py vs articles_resource.py)
        if not source_file.exists():
            matched = list(app_dir.rglob(Path(rel_path).name))
            if matched:
                source_file = matched[0]
            else:
                print(f"  [!] Warning: {rel_path} not found directly, skipping.")
                continue

        code = source_file.read_text(encoding="utf-8", errors="replace")

        # Extract symbols for context
        classes = []
        functions = []
        try:
            tree = ast.parse(code)
            for node in ast.iter_child_nodes(tree):
                if isinstance(node, ast.ClassDef):
                    classes.append(node.name)
                elif isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                    functions.append(node.name)
        except Exception:
            pass

        readme_text = f"# {title}\n\n"
        readme_text += f"**Category:** {category}  \n"
        readme_text += f"**Component Path:** `app/{rel_path}`  \n"
        readme_text += f"**Architecture:** FastAPI RealWorld Production Backend (Clean Architecture / Async)\n\n"
        
        readme_text += f"## Context & Purpose\n\n{desc}\n\n"

        if classes or functions:
            readme_text += "## Key Symbols Defined\n"
            if classes:
                readme_text += f"- **Classes:** {', '.join(f'`{c}`' for c in classes)}\n"
            if functions:
                readme_text += f"- **Functions / Endpoints:** {', '.join(f'`{f}`' for f in functions[:8])}\n"
            readme_text += "\n"

        readme_text += (
            "## Code Review Checklist\n"
            "When reviewing this backend module, pay attention to:\n"
            "1. **Async & Concurrency**: Are database calls and I/O-bound operations properly awaited without blocking the event loop?\n"
            "2. **Security & Authentication**: Are credentials, tokens, and authorization checks enforced correctly? Are errors sanitized so internal states aren't leaked?\n"
            "3. **Validation & Errors**: Does the code validate request payloads, handle edge cases (e.g. non-existent records, duplicate keys), and raise appropriate HTTP exceptions?\n"
            "4. **Database Transactions & Leaks**: Are connections properly acquired, cleaned up, and protected against SQL injection and connection exhaustion?\n"
        )

        dest_dir = level_dir / folder_name
        dest_dir.mkdir(parents=True, exist_ok=True)

        (dest_dir / "README.md").write_text(readme_text, encoding="utf-8")
        (dest_dir / "solution.py").write_text(code, encoding="utf-8")

        extracted_count += 1
        print(f"  [{extracted_count}/10] Level 3: Extracted {folder_name} ({category})")

    # If any target was missing and we have < 10, fill from app
    if extracted_count < 10:
        candidates = list(app_dir.rglob("*.py"))
        for c in candidates:
            if extracted_count >= 10:
                break
            if c.name.startswith("__") or "test" in c.name:
                continue
            folder_name = c.stem
            dest_dir = level_dir / folder_name
            if dest_dir.exists():
                continue
            code = c.read_text(encoding="utf-8", errors="replace")
            dest_dir.mkdir(parents=True, exist_ok=True)
            readme = f"# {folder_name.replace('_', ' ').title()}\n\nBackend component from `app/{c.relative_to(app_dir)}`.\n"
            (dest_dir / "README.md").write_text(readme, encoding="utf-8")
            (dest_dir / "solution.py").write_text(code, encoding="utf-8")
            extracted_count += 1
            print(f"  [{extracted_count}/10] Level 3 (Fallback): Extracted {folder_name}")

    print(f"Level 3 complete: {extracted_count} backend files extracted.")


def main():
    base_dir = Path(__file__).resolve().parent.parent
    dataset_dir = base_dir / "dataset"
    temp_dir = base_dir / "_temp_repos"

    print("=" * 60)
    print(f"Starting Dataset Generation for CodeReview Arena")
    print(f"Target Output Directory: {dataset_dir}")
    print(f"Temp Directory: {temp_dir}")
    print("=" * 60)

    try:
        temp_dir.mkdir(parents=True, exist_ok=True)
        dataset_dir.mkdir(parents=True, exist_ok=True)

        # 1. Level 1: Fundamentals (15 exercises)
        extract_level_1(temp_dir, dataset_dir)

        # 2. Level 2: Software Engineering (10 patterns)
        extract_level_2(temp_dir, dataset_dir)

        # 3. Level 3: Real World (10 backend files)
        extract_level_3(temp_dir, dataset_dir)

        print("\n" + "=" * 60)
        print("Dataset extraction completed successfully!")
        print("=" * 60)

    finally:
        # Clean up cloned repos
        print("\n--> Cleaning up temporary repository clones...")
        if temp_dir.exists():
            shutil.rmtree(temp_dir, onerror=remove_readonly)
        print("Cleanup completed.")


if __name__ == "__main__":
    main()
