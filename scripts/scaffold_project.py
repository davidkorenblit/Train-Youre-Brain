#!/usr/bin/env python3
"""
Scaffold Project Structure for CodeReview Arena

Creates initial empty directory structure for:
- backend/ (Cloudflare Workers + Hono)
- frontend/ (React + Vite + Monaco)
- shared/ (TypeScript interfaces)
"""

from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

DIRECTORIES = [
    # Backend structure
    ROOT_DIR / "backend" / "src" / "routes",
    ROOT_DIR / "backend" / "src" / "services",
    ROOT_DIR / "backend" / "src" / "db",
    ROOT_DIR / "backend" / "tests",
    
    # Frontend structure
    ROOT_DIR / "frontend" / "src" / "components",
    ROOT_DIR / "frontend" / "src" / "pages",
    ROOT_DIR / "frontend" / "src" / "hooks",
    ROOT_DIR / "frontend" / "src" / "services",
    ROOT_DIR / "frontend" / "public",
    
    # Shared contracts / types
    ROOT_DIR / "shared" / "types",
]

README_FILES = {
    ROOT_DIR / "backend" / "README.md": "# Backend (Hono + Cloudflare Workers)\nAPI server, AI Judge service, and Supabase database interactions.\n",
    ROOT_DIR / "frontend" / "README.md": "# Frontend (React + Vite + Monaco Editor)\nUser interface for reading code, inline commenting, and review feedback.\n",
    ROOT_DIR / "shared" / "README.md": "# Shared Types\nShared TypeScript interfaces and data models between backend and frontend.\n"
}


def main():
    print("--> Creating project scaffolding...")
    
    for d in DIRECTORIES:
        d.mkdir(parents=True, exist_ok=True)
        gitkeep = d / ".gitkeep"
        if not gitkeep.exists():
            gitkeep.write_text("# Placeholder\n", encoding="utf-8")
        print(f"  [+] Directory: {d.relative_to(ROOT_DIR)}")

    for p, content in README_FILES.items():
        if not p.exists():
            p.write_text(content, encoding="utf-8")
        print(f"  [+] README: {p.relative_to(ROOT_DIR)}")

    print("\n[SUCCESS] Project scaffolding created cleanly without code.")


if __name__ == "__main__":
    main()
