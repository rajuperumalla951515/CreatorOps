# Workflow agents

Each agent has one focused responsibility. `api_server.py` is the integration
boundary; agents should contain workflow logic and should not become a second
HTTP or persistence layer.

| File | Agent |
| --- | --- |
| `planner.py` | Creates an editing plan from project goals |
| `analyzer.py` | Inspects source media and derives useful metadata |
| `transcriber.py` | Produces transcripts and caption data |
| `editor.py` | Builds editing operations for the processor |
| `qa.py` | Validates quality and delivery requirements |
| `metadata.py` | Generates titles, descriptions, tags, and thumbnail metadata |
| `publisher.py` | Coordinates publishing-related actions |
| `supervisor.py` | Coordinates the end-to-end agent workflow |

All public agent classes are re-exported from `agents/__init__.py`, so callers
can use `from Backend.agents import ProjectPlannerAgent` without depending on
individual module paths.
