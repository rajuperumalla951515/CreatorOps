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


if __name__ == "__main__":
    unittest.main()
