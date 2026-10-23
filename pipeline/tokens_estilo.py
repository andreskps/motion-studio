"""Valores de estilo/tokens.json que usa el pipeline de Python."""

import json
from pathlib import Path

TOKENS = json.loads((Path(__file__).resolve().parent.parent / "estilo" / "tokens.json").read_text(encoding="utf-8"))
LUFS_MASTER = float(TOKENS["audio"]["lufsMaster"])
