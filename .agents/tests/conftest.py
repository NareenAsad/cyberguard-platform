import sys
from pathlib import Path

# Allow `import crew`, `import risk_engine_py`, etc. from the .agents/ package root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
