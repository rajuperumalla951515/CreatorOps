"""
TubePilot AI - Backend Supabase Integration
Handles secure token validation, user authentication from Supabase JWTs,
and dual-mode database persistence (Supabase Postgres with SQLite fallback).
"""

from __future__ import annotations

import os
import logging
from typing import Any, Dict, List, Optional
import jwt

logger = logging.getLogger("tubepilot.supabase")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xepcqtvzehjnijdvjcfe.supabase.co").strip()
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
    or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_e77cpinfc4g9cV8s2vTQBw_BXDdlq38")
).strip()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "").strip()

# Lazy-loaded supabase-py client
_supabase_client = None


def get_supabase_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Connected to Supabase PostgreSQL at %s", SUPABASE_URL)
        except Exception as e:
            logger.warning("Could not initialize Supabase client: %s. Using SQLite fallback.", e)
            _supabase_client = None

    return _supabase_client


def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and verifies a Supabase JWT access token.
    Extracts the user sub (UUID), email, and metadata.
    """
    if not token:
        return None

    # Strip 'Bearer ' if present
    token_str = token.replace("Bearer ", "").strip()

    try:
        if SUPABASE_JWT_SECRET:
            decoded = jwt.decode(
                token_str,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return decoded
        else:
            # Unverified decode when secret is not configured in development
            decoded = jwt.decode(token_str, options={"verify_signature": False})
            return decoded
    except Exception as e:
        logger.warning("Token verification failed: %s", e)
        return None


def extract_user_id_from_header(auth_header: Optional[str]) -> Optional[str]:
    """Helper to extract user UUID from Authorization header."""
    if not auth_header:
        return None
    claims = verify_supabase_token(auth_header)
    if claims and "sub" in claims:
        return str(claims["sub"])
    return None
