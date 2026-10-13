import os
import sys
import unittest
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

# Setup paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Force test configuration
os.environ["CREATOR_ACCESS_KEY"] = "test-secret-key-12345"
os.environ["SUPABASE_URL"] = "https://xepcqtvzehjnijdvjcfe.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "sb_publishable_e77cpinfc4g9cV8s2vTQBw_BXDdlq38"

from fastapi.testclient import TestClient
from Backend.api_server import app
from Backend.db import (
    create_project,
    get_project,
    list_projects,
    delete_project,
    create_job,
    get_job,
    update_job_progress,
    save_channel_record,
    get_channel_record,
    delete_channel_record,
    save_publishing_record,
    list_publishing_records,
)
from Backend.agents import (
    ProjectPlannerAgent,
    ThumbnailMetadataAgent,
    QualityAssuranceAgent,
    PublishingAgent,
)


class TestTubePilotEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        """Verify health check endpoint returns 200 with engine metadata."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertIn("version", data)

    def test_02_access_control_security(self):
        """Verify that requests without credentials are blocked with 401 when key is enforced."""
        # Unauthenticated request
        response = self.client.get("/api/v1/projects")
        self.assertEqual(response.status_code, 401)

        # Authenticated with valid Creator Key
        response = self.client.get(
            "/api/v1/projects",
            headers={"X-Creator-Key": "test-secret-key-12345"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("projects", response.json())

    def test_03_multi_user_data_isolation(self):
        """Verify strict Row Level / user-level isolation between users."""
        user_alpha = "user_alpha_uuid_101"
        user_beta = "user_beta_uuid_202"

        # User Alpha creates a project
        proj_alpha = create_project(
            project_id="proj_alpha_999",
            name="Alpha High-Retention Short",
            format_type="short",
            ratio="9:16",
            layout="top_landscape",
            target_duration=30.0,
            instructions="Focus on hook in first 3 seconds",
            user_id=user_alpha,
        )
        self.assertIsNotNone(proj_alpha)

        # User Beta creates a project
        proj_beta = create_project(
            project_id="proj_beta_888",
            name="Beta Podcast Highlights",
            format_type="long",
            ratio="16:9",
            layout="side_by_side",
            target_duration=120.0,
            instructions="Include chapter marks",
            user_id=user_beta,
        )
        self.assertIsNotNone(proj_beta)

        # User Alpha can only see Alpha's projects
        alpha_projects = list_projects(user_id=user_alpha)
        alpha_ids = [p["id"] for p in alpha_projects]
        self.assertIn("proj_alpha_999", alpha_ids)
        self.assertNotIn("proj_beta_888", alpha_ids)

        # User Beta cannot retrieve Alpha's project directly
        unauthorized_fetch = get_project("proj_alpha_999", user_id=user_beta)
        self.assertIsNone(unauthorized_fetch)

        # User Beta cannot delete Alpha's project
        unauthorized_delete = delete_project("proj_alpha_999", user_id=user_beta)
        self.assertFalse(unauthorized_delete)

        # Cleanup
        delete_project("proj_alpha_999", user_id=user_alpha)
        delete_project("proj_beta_888", user_id=user_beta)

    def test_04_youtube_channel_persistence(self):
        """Verify YouTube channel record persistence and retrieval."""
        test_user = "creator_user_777"
        record = save_channel_record(
            user_id=test_user,
            channel_id="UC_test_channel_123",
            channel_title="TubePilot Official Studio",
            channel_handle="@tubepilot_official",
            avatar_url="https://example.com/avatar.jpg",
            subscriber_count="125000",
            video_count="48",
        )
        self.assertEqual(record["channel_id"], "UC_test_channel_123")

        # Retrieve saved channel
        fetched = get_channel_record(user_id=test_user)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched["channel_title"], "TubePilot Official Studio")
        self.assertEqual(fetched["subscriber_count"], "125000")

        # Clean up
        deleted = delete_channel_record(user_id=test_user)
        self.assertTrue(deleted)
        self.assertIsNone(get_channel_record(user_id=test_user))

    def test_05_job_lifecycle_and_telemetry(self):
        """Verify background job creation, transition states, and persistence."""
        job_id = f"job_test_render_{uuid.uuid4().hex[:8]}"
        test_user = "user_job_tester"

        # 1. Create Queued Job
        job = create_job(
            job_id=job_id,
            job_type="video_render",
            project_id="proj_dummy_1",
            total_steps=5,
            user_id=test_user,
        )
        self.assertEqual(job["status"], "queued")
        self.assertEqual(job["step"], 1)

        # 2. Transition to processing
        updated = update_job_progress(
            job_id=job_id,
            status="processing",
            step=3,
            step_title="Rendering Video Stream",
            step_subtitle="FFmpeg encoding H.264...",
            progress_pct=60.0,
            log_line="[FFmpeg] Encoded 720 frames",
        )
        self.assertEqual(updated["status"], "processing")
        self.assertEqual(updated["step"], 3)
        self.assertEqual(updated["progress_pct"], 60.0)

        # 3. Transition to completed
        completed = update_job_progress(
            job_id=job_id,
            status="completed",
            step=5,
            step_title="Master Video Ready",
            progress_pct=100.0,
            media_url="/api/media/output_test.mp4",
        )
        self.assertEqual(completed["status"], "completed")
        self.assertEqual(completed["media_url"], "/api/media/output_test.mp4")

    def test_06_project_planner_agent(self):
        """Verify Project Planner Agent parses natural language and validates output manifest."""
        planner = ProjectPlannerAgent()
        manifest = planner.create_plan(
            brief="Create a 30 second viral YouTube Short comparing Claude 3.5 Sonnet and GPT-4o with high tempo and captions",
            format_type="short",
            aspect_ratio="9:16",
        )
        self.assertIn("target_duration", manifest)
        self.assertIn("aspect_ratio", manifest)
        self.assertEqual(manifest["aspect_ratio"], "9:16")
        self.assertIn("scenes", manifest)
        self.assertIn("audio_strategy", manifest)

    def test_07_thumbnail_metadata_agent(self):
        """Verify Thumbnail and Metadata Agent generates YouTube SEO tags and concepts."""
        agent = ThumbnailMetadataAgent()
        assets = agent.generate_publishing_assets(
            topic_title="How to Build Autonomous AI Agents in 2026",
            duration_seconds=45.0,
            format_type="short",
        )
        self.assertIn("title_suggestions", assets)
        self.assertGreater(len(assets["title_suggestions"]), 0)
        self.assertIn("description", assets)
        self.assertIn("tags", assets)
        self.assertIn("thumbnail_concepts", assets)
        self.assertTrue(assets["is_short"])

    def test_08_publishing_agent_confirmation_guard(self):
        """Verify publishing API rejects uploads without explicit user confirmation."""
        response = self.client.post(
            "/api/youtube/upload",
            headers={"X-Creator-Key": "test-secret-key-12345"},
            json={
                "task_id": "nonexistent_task",
                "title": "Unconfirmed Upload",
                "user_confirmed": False,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Explicit user confirmation required", response.json()["detail"])

    def test_09_seo_sitemap_and_robots(self):
        """Verify sitemap.xml and robots.txt adhere to production SEO constraints."""
        frontend_dir = Path(__file__).resolve().parents[2] / "frontend-react"
        sitemap_path = frontend_dir / "public" / "sitemap.xml"
        robots_path = frontend_dir / "public" / "robots.txt"

        self.assertTrue(sitemap_path.exists(), "sitemap.xml must exist in public folder")
        self.assertTrue(robots_path.exists(), "robots.txt must exist in public folder")

        # Parse XML
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        urls = [elem.text for elem in root.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        self.assertGreater(len(urls), 5, "Sitemap should contain all public marketing pages")

        # Ensure NO private /app/ or API routes are indexed
        for url in urls:
            self.assertNotIn("/app", url, f"Private app route leaked into sitemap: {url}")
            self.assertNotIn("/api", url, f"API route leaked into sitemap: {url}")

        # Check robots.txt disallows /app/
        robots_content = robots_path.read_text(encoding="utf-8")
        self.assertIn("Disallow: /app/", robots_content)
        self.assertIn("Disallow: /api/", robots_content)
        self.assertIn("sitemap.xml", robots_content)

    def test_10_git_security_and_secrets(self):
        """Verify .gitignore excludes credentials, local databases, and temporary videos."""
        root_gitignore = Path(__file__).resolve().parents[3] / ".gitignore"
        self.assertTrue(root_gitignore.exists())
        content = root_gitignore.read_text(encoding="utf-8")
        self.assertIn(".env", content)
        self.assertIn(".credentials", content)
        self.assertIn("*.db", content)
        self.assertIn("media_output", content)

    def test_11_youtube_oauth_endpoints(self):
        """Verify YouTube OAuth consent URL generation, PKCE verifier, redirect, and session clear."""
        # 1. Auth URL Generation
        res = self.client.get("/api/youtube/auth-url?state=/app/youtube")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("auth_url", data)
        self.assertTrue(data["auth_url"].startswith("https://accounts.google.com/o/oauth2/auth"))
        self.assertIn("client_id=201704939597", data["auth_url"])
        self.assertIn("scope=", data["auth_url"])
        self.assertIn("code_verifier", data)

        # 2. Direct Login Redirect (307)
        res_login = self.client.get("/api/youtube/login?state=/app/youtube", follow_redirects=False)
        self.assertEqual(res_login.status_code, 307)
        self.assertTrue(res_login.headers["location"].startswith("https://accounts.google.com/o/oauth2/auth"))

        # 3. Clear / Disconnect YouTube Session
        res_clear = self.client.post("/api/youtube/clear")
        self.assertEqual(res_clear.status_code, 200)
        self.assertEqual(res_clear.json()["status"], "signed_out")

        res_disconnect = self.client.post("/api/youtube/disconnect")
        self.assertEqual(res_disconnect.status_code, 200)
        self.assertEqual(res_disconnect.json()["status"], "signed_out")

        # 4. Profile check when unauthenticated
        res_profile = self.client.get("/api/youtube/profile")
        self.assertEqual(res_profile.status_code, 200)
        self.assertIn("authenticated", res_profile.json())


if __name__ == "__main__":
    unittest.main()
