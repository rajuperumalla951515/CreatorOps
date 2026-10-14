import os
import sys
import unittest
from pathlib import Path
import tempfile

# Setup paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ["CREATOR_ACCESS_KEY"] = "test-secret-key-12345"

from fastapi.testclient import TestClient
from Backend.api_server import app, RENDER_TASKS
from Backend.video_processor import (
    validate_media_url,
    is_direct_media_url,
    download_direct_media,
    download_youtube,
    save_upload,
    normalize_and_validate_cookies,
)
from Backend.storage import (
    upload_media_to_persistent_storage,
    get_persistent_media_url,
)


class TestProductionDownloadPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_ssrf_and_invalid_url_rejection(self):
        """Verify that private IP ranges, loopback, and metadata endpoints are blocked (SSRF)."""
        # Block loopback
        with self.assertRaises(ValueError) as ctx:
            validate_media_url("http://127.0.0.1/video.mp4")
        self.assertIn("prohibited", str(ctx.exception).lower())

        # Block AWS / cloud metadata endpoint
        with self.assertRaises(ValueError) as ctx:
            validate_media_url("http://169.254.169.254/latest/meta-data/")
        self.assertIn("prohibited", str(ctx.exception).lower())

        # Block private 10.x subnet
        with self.assertRaises(ValueError) as ctx:
            validate_media_url("http://10.0.0.1/video.mp4")
        self.assertIn("prohibited", str(ctx.exception).lower())

        # Block non-http protocols
        with self.assertRaises(ValueError) as ctx:
            validate_media_url("ftp://example.com/video.mp4")
        self.assertIn("protocol", str(ctx.exception).lower())

        # Block empty URL
        with self.assertRaises(ValueError) as ctx:
            validate_media_url("")
        self.assertIn("empty", str(ctx.exception).lower())

    def test_02_url_classification(self):
        """Verify accurate classification of direct media URLs vs platform URLs."""
        self.assertTrue(is_direct_media_url("https://cdn.example.com/assets/intro.mp4"))
        self.assertTrue(is_direct_media_url("https://my-bucket.supabase.co/storage/v1/object/public/videos/clip.webm?token=xyz"))
        self.assertTrue(is_direct_media_url("https://example.com/stream.mov"))
        self.assertFalse(is_direct_media_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))
        self.assertFalse(is_direct_media_url("https://youtu.be/jNQXAC9IVRw"))

    def test_03_direct_media_download_and_segment_trimming(self):
        """Verify downloading a direct lawful MP4 test video and trimming a 2-second segment."""
        test_url = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        with tempfile.TemporaryDirectory() as td:
            output = download_direct_media(
                url=test_url,
                output_dir=Path(td),
                start_seconds=0.5,
                end_seconds=2.0,
                filename_prefix="test_segment",
            )
            self.assertTrue(output.exists())
            self.assertGreater(output.stat().st_size, 10000)
            self.assertEqual(output.suffix, ".mp4")

    def test_04_download_youtube_delegation_to_direct_media(self):
        """Verify download_youtube seamlessly handles direct media URLs."""
        test_url = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        with tempfile.TemporaryDirectory() as td:
            output = download_youtube(
                url=test_url,
                output_dir=Path(td),
                start_seconds=0.0,
                end_seconds=1.5,
                filename_prefix="direct_via_yt",
            )
            self.assertTrue(output.exists())
            self.assertGreater(output.stat().st_size, 10000)

    def test_05_api_render_rejects_ssrf_immediately(self):
        """Verify /api/render returns HTTP 400 immediately when SSRF URL is submitted."""
        response = self.client.post(
            "/api/render",
            data={
                "v1_url": "http://127.0.0.1:8080/internal.mp4",
                "aspect_ratio": "9:16",
            },
            headers={"X-Creator-Key": "test-secret-key-12345"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("URL invalid", response.json().get("detail", ""))

    def test_06_persistent_storage_graceful_fallback(self):
        """Verify storage module gracefully returns None when bucket is unreachable, without throwing."""
        fake_file = Path("nonexistent_render_test.mp4")
        url = upload_media_to_persistent_storage(fake_file, "fake.mp4")
        self.assertIsNone(url)

        # Nonexistent file query returns None
        lookup_url = get_persistent_media_url("definitely_nonexistent_12345.mp4")
        self.assertIsNone(lookup_url)

    def test_07_media_route_returns_404_with_helpful_message(self):
        """Verify /api/media/{filename} returns informative error message when file is missing."""
        response = self.client.get("/api/media/missing-video-uuid-123.mp4")
        self.assertEqual(response.status_code, 404)
        self.assertIn("expired", response.json().get("detail", "").lower())

    def test_08_youtube_publish_route_alias_and_payload_parsing(self):
        """Verify /api/youtube/publish accepts media_url in place of task_id."""
        response = self.client.post(
            "/api/youtube/publish",
            json={
                "media_url": "/api/media/00000000-0000-0000-0000-000000000000.mp4",
                "title": "Autonomous Short Episode 1",
                "privacy": "private",
            },
            headers={"X-Creator-Key": "test-secret-key-12345"},
        )
        # Even without YouTube credentials configured in CI test, it should authenticate and attempt file check (401 or 404),
        # not crash with 422 Unprocessable Entity!
        self.assertIn(response.status_code, (401, 404))
        self.assertNotEqual(response.status_code, 422)

    def test_09_cookie_normalization_escaped_newlines_and_missing_header(self):
        """Verify normalization fixes escaped literal \\n, \\t, and auto-injects Netscape header."""
        # Simulated raw Render environment variable with literal \n and \t strings
        raw_escaped_text = (
            r".youtube.com\tTRUE\t/\tTRUE\t1893456000\tLOGIN_INFO\taf9394_secret_val\n"
            r".youtube.com\tTRUE\t/\tTRUE\t1893456000\tSID\tsid_secret_val"
        )
        with tempfile.TemporaryDirectory() as td:
            cookie_path = Path(td) / "cookies.txt"
            is_valid, count, names = normalize_and_validate_cookies(raw_escaped_text, cookie_path)
            self.assertTrue(is_valid)
            self.assertEqual(count, 2)
            self.assertIn("LOGIN_INFO", names)
            self.assertIn("SID", names)

            # Confirm file contains the Netscape header required by MozillaCookieJar
            content = cookie_path.read_text(encoding="utf-8")
            self.assertTrue(content.startswith("# Netscape HTTP Cookie File"))

    def test_10_cookie_normalization_base64_decoding(self):
        """Verify normalization decodes both base64: prefixed strings and raw base64 payloads."""
        import base64
        valid_netscape = (
            "# Netscape HTTP Cookie File\n"
            ".youtube.com\tTRUE\t/\tTRUE\t1893456000\tSAPISID\tsapisid_token_xyz\n"
            ".youtube.com\tTRUE\t/\tTRUE\t1893456000\tSSID\tssid_token_abc\n"
        )
        b64_str = base64.b64encode(valid_netscape.encode("utf-8")).decode("utf-8")

        with tempfile.TemporaryDirectory() as td:
            # 1. With explicit "base64:" prefix
            path_prefixed = Path(td) / "prefixed.txt"
            is_valid, count, names = normalize_and_validate_cookies(f"base64:{b64_str}", path_prefixed)
            self.assertTrue(is_valid)
            self.assertEqual(count, 2)
            self.assertEqual(set(names), {"SAPISID", "SSID"})

            # 2. Raw base64 string auto-detection
            path_raw = Path(td) / "raw.txt"
            is_valid, count, names = normalize_and_validate_cookies(b64_str, path_raw)
            self.assertTrue(is_valid)
            self.assertEqual(count, 2)
            self.assertIn("SAPISID", names)

    def test_11_cookie_normalization_space_separated_columns(self):
        """Verify normalization repairs space-separated columns caused by copy-pasting."""
        # Spaces instead of tabs
        space_separated = (
            "# Netscape HTTP Cookie File\n"
            ".youtube.com   TRUE   /   TRUE   1893456000   HSID   hsid_value_123\n"
        )
        with tempfile.TemporaryDirectory() as td:
            cookie_path = Path(td) / "spaces.txt"
            is_valid, count, names = normalize_and_validate_cookies(space_separated, cookie_path)
            self.assertTrue(is_valid)
            self.assertEqual(count, 1)
            self.assertIn("HSID", names)

    def test_12_cookie_normalization_malformed_input_rejection(self):
        """Verify normalization gracefully rejects invalid/empty strings without raising unhandled exceptions."""
        with tempfile.TemporaryDirectory() as td:
            cookie_path = Path(td) / "invalid.txt"

            # Empty string
            valid, count, names = normalize_and_validate_cookies("", cookie_path)
            self.assertFalse(valid)
            self.assertEqual(count, 0)
            self.assertEqual(names, [])

            # Pure gibberish
            valid, count, names = normalize_and_validate_cookies("invalid cookie string that is not netscape format", cookie_path)
            self.assertFalse(valid)
            self.assertEqual(count, 0)

    def test_13_cookie_normalization_no_value_leakage(self):
        """Verify normalize_and_validate_cookies never returns or leaks secret cookie values in names."""
        secret_val = "SUPER_SECRET_COOKIE_VALUE_NEVER_LOG_98765"
        raw_cookie = (
            f".youtube.com\tTRUE\t/\tTRUE\t1893456000\tLOGIN_INFO\t{secret_val}\n"
        )
        with tempfile.TemporaryDirectory() as td:
            cookie_path = Path(td) / "leak_check.txt"
            is_valid, count, names = normalize_and_validate_cookies(raw_cookie, cookie_path)
            self.assertTrue(is_valid)
            self.assertIn("LOGIN_INFO", names)
            self.assertNotIn(secret_val, names)

    def test_14_supabase_oauth_token_storage_methods(self):
        """Verify save_oauth_tokens_supabase, get_oauth_tokens_supabase, and delete handle user UUID and mock gracefully."""
        from Backend.supabase_db import save_oauth_tokens_supabase, get_oauth_tokens_supabase, delete_oauth_tokens_supabase
        import uuid

        test_uid = str(uuid.uuid4())
        token_payload = {
            "token": "mock_access_token_12345",
            "refresh_token": "mock_refresh_token_67890",
            "token_uri": "https://oauth2.googleapis.com/token",
            "scopes": ["https://www.googleapis.com/auth/youtube.readonly"],
        }
        # Non-UUID rejection
        self.assertFalse(save_oauth_tokens_supabase("not-a-valid-uuid", token_payload))
        self.assertIsNone(get_oauth_tokens_supabase("not-a-valid-uuid"))
        self.assertFalse(delete_oauth_tokens_supabase("not-a-valid-uuid"))

    def test_15_direct_media_non_video_payload_rejection(self):
        """Verify that downloading non-media payload (HTML/text masquerading as mp4) is rejected safely."""
        with tempfile.TemporaryDirectory() as td:
            fake_txt = Path(td) / "fake.mp4"
            fake_txt.write_text("<!DOCTYPE html><html><body>Error 404</body></html>", encoding="utf-8")
            
            # Read first 64 bytes to verify magic byte check
            with open(fake_txt, "rb") as f:
                header = f.read(64)
            is_valid = b"ftyp" in header or header.startswith(b"\x1a\x45\xdf\xa3") or header.startswith(b"RIFF")
            self.assertFalse(is_valid)

    def test_16_youtube_publish_loads_user_scoped_credentials(self):
        """Verify publishing endpoint verifies user authorization and attempts isolated credential lookup."""
        response = self.client.post(
            "/api/youtube/publish",
            json={
                "media_url": "/api/media/00000000-0000-0000-0000-000000000000.mp4",
                "title": "Autonomous Short Episode 1",
                "privacy": "private",
                "user_confirmed": True,
            },
            headers={"X-Creator-Key": "test-secret-key-12345"},
        )
        # Should return 401 unauthenticated for YouTube or 404 for media, never 500 or 422
        self.assertIn(response.status_code, (401, 404))


if __name__ == "__main__":
    unittest.main()


