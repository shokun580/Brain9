# Contract: PatternSteps

Owner: content (Apinan). Consumers: engine, analytics.
Source of truth: `patternStepsSchema` in `src/modules/content/contracts.ts`.

## Shape

```json
{
  "v": 1,
  "steps": [{ "cells": [4] }, { "cells": [0, 8], "showMs": 1000 }, { "cells": [2], "gapMs": 500 }]
}
```

| Field            | Type                         | Meaning                                                                         |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `v`              | `1`                          | Format version                                                                  |
| `steps`          | array, 2–20 items            | The sequence, in the order it is shown and must be repeated                     |
| `steps[].cells`  | 1 or 2 distinct integers 0–8 | Cells lit in this step. Two cells = both pressed together with two fingers      |
| `steps[].showMs` | positive integer, optional   | How long this step stays lit. Falls back to pattern → exercise → course setting |
| `steps[].gapMs`  | integer ≥ 0, optional        | Pause after this step. Same fallback                                            |

## Cell numbering

Row by row from the top-left, as the user sees the grid:

```
0 1 2
3 4 5
6 7 8
```

## Where it is stored

- `patterns.steps` — the editable original.
- `item_results.expected_steps` — a copy taken when the item was played, with
  `pattern_version`, so later edits never change the meaning of past results.

## Rules

- Parse with `patternStepsSchema` whenever the JSON is read from the database or received
  from a client. Never trust its shape.
- `sequence_length` = number of steps; `has_simultaneous` = any step has two cells. Both
  are recomputed with `derivePatternStats()` on every save.
- Order inside `cells` has no meaning: `[0, 8]` equals `[8, 0]`.

## Changing this contract

Any change to the shape is a cross-module change: bump `PATTERN_FORMAT_VERSION`, keep
readers able to parse older versions already stored in `item_results`, and get approval
from the engine and analytics owners in the pull request.
