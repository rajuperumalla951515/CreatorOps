# Supabase migrations

SQL files in `migrations/` are applied in timestamp order. Each migration is
append-only: add a new migration for a schema change instead of editing an
already-applied file.

| Migration | Purpose |
| --- | --- |
| `20261013_tubepilot_schema.sql` | Core profiles, projects, jobs, media, and publishing tables |
| `20261014_secure_oauth_tokens.sql` | Secure OAuth token storage and access policies |
| `20261014_user_data_integrity.sql` | User ownership and row-level data integrity rules |

The Python integration lives in
[`CreatorAgent/Backend/supabase_db.py`](../CreatorAgent/Backend/supabase_db.py).
Keep service credentials in environment variables, never in migration files.
