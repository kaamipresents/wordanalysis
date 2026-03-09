---
name: SEO Text Analytics Platform Architect
description: Master technical specification for an AI coding agent to execute the development of a production-ready SEO & Text Analytics Platform.
---

# 1. Project Mission & Context

**Goal:** A premium, high-performance word counting and SEO analysis tool.

**Target Audience:** Content creators, SEO specialists, and students.

# 2. Technical Stack & Environment

*   **Frontend:** React 18+, Tailwind CSS, Framer Motion (for micro-animations).
*   **Backend:** Python 3.10+, Flask, SQLAlchemy (for ORM), Gunicorn.
*   **Database:** PostgreSQL with Connection Pooling.
*   **Infrastructure:** Environment-based configuration (`.env`).

# 3. Core Logic & Formulas

*   **Word Count:** Filter out punctuation and empty strings. Regex pattern: `\b\w+\b`.
*   **Character Count (with spaces):** Direct string length `len(text)`.
*   **Character Count (without spaces):** Strip all whitespace. Regex or replacement: `len(re.sub(r'\s+', '', text))`.
*   **Sentence Count:** Split by punctuation marks followed by space or EOF. Pattern: `re.split(r'[.!?]+(?=\s|$)', text)`.
*   **Paragraph Count:** Split by multiple newlines. Pattern: `re.split(r'\n\s*\n', text.strip())`.
*   **Estimated Reading Time:** `Total Words / 225` (Calculation resulting in minutes).
*   **Speaking Time:** `Total Words / 150` (Calculation resulting in minutes).
*   **Keyword Density Algorithm:**
    1.  Tokenize text into lowercase words, stripping punctuation.
    2.  Filter out common 'stop words' (e.g., "a", "an", "the", "and", "is").
    3.  Calculate the frequency count of each remaining word.
    4.  Formula: `(Word Frequency / Total Words Excluding Stop Words) * 100`.

# 4. The "Premium" Design System

*   **Glassmorphism Engine:** Heavy usage of backdrop-blur (e.g., `backdrop-blur-md`), semi-transparent background colors (e.g., `bg-white/10`), and subtle borders (`border border-white/20`).
*   **Color Palette:**
    *   **Primary:** Deep Indigo (e.g., Tailwind `indigo-900` or `#312E81`).
    *   **Backgrounds/Text:** Slate (e.g., `slate-900` for dark backgrounds, `slate-50` for text).
    *   **Accent/CTAs:** Accent Teal (e.g., Tailwind `teal-500` or `#14B8A6`).
*   **Responsive Layout:** Absolute mandate for mobile-first design leveraging fluid grid systems.

# 5. Database Schema & Multi-Tenancy

**Core Tables:**
*   `users`: `id` (PK, UUID), `email` (Unique), `password_hash`, `created_at`
*   `analysis_history`: `id` (PK, UUID), `user_id` (FK), `text_snippet`, `word_count`, `reading_time`, `created_at`
*   `user_settings`: `id` (PK, UUID), `user_id` (FK), `theme_preference`, `default_language`

**Constraints & Indexing:**
*   Mandatory Foreign Key constraints on `user_id` referencing the `users` table.
*   B-Tree indexing on `user_id` and `created_at` for high-performance tenant lookups.

**Strict Security Rule (Multi-Tenancy):**
*   Zero cross-tenant data leakage. All db operations must scope to the authenticated user (`WHERE user_id = :current_user_id`).

# 6. Development Standards (The "Hard Rules")

*   **Separation of Concerns:** 
    *   API routes (`routes/` or `controllers/`)
    *   Business logic (`services/` or `utils/`)
    *   DB models (`models/`)
    Must remain in completely separate files/directories. No business logic inside API routes.
*   **Security Posture:** 
    *   Password hashing utilizing **Argon2** (preferred) or **Bcrypt**.
    *   Stateless **JWT** for robust API session management.
    *   Rigorous input sanitization to block XSS and prevent SQL Injection (enforced entirely via SQLAlchemy ORM parameters, abolishing raw SQL strings).
*   **Performance Optimization:** 
    *   **No** processing of gigantic strings in global memory at once. Implement chunking, generators, or streaming buffers for high-volume text inputs.

# 7. Implementation Roadmap

*   **Phase 1: Environment Setup:** Provision `.env`, scaffold React/Vite frontend + Tailwind config, and baseline Python/Flask ecosystem.
*   **Phase 2: Backend Core:** Implement robust text analytics classes, regex logic, word density algorithms, and thorough unit testing.
*   **Phase 3: Database/Auth:** Provision PostgreSQL, refine SQLAlchemy models, engineer JWT authentication endpoints, and enforce user-id scoping.
*   **Phase 4: Frontend UI/UX:** Paint the Glassmorphic interface utilizing Deep Indigo/Teal palettes. Scaffold Framer Motion page transitions and stat cards.
*   **Phase 5: Final SEO Logic Integration:** Bind React views to Flask API. Ensure real-time (or debounced) word computing, smooth state updates, and deployment readiness.
