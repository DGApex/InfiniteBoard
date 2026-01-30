---
name: moodboard-template-creator
description: Generate reusable InfiniteBoard JSON templates with various layout structures (grids, masonry, scattered) using placeholder elements. Use this when the user asks to "create a layout", "make a template", "setup a moodboard structure", or "prepare a grid" without specific content generation.
---

# Moodboard Template Creator Skill

Use this skill to generate structural templates for InfiniteBoard. Unlike `board-generator`, this skill focuses on **layout and structure** using placeholders, rather than generating content.

**IMPORTANT**: When performing reasoning, planning, or calculating layout logic for this skill, you MUST use the **Gemini 2.5 Flash** model (`gemini-2.5-flash`). Do not use older models.

## Template Types

1.  **Grid**: Strict row/column alignment. (e.g., 3x3, 4x2)
2.  **Masonry**: Staggered columns like Pinterest.
3.  **Scatter**: Random/organic placement with rotation.
4.  **Filmstrip**: Linear horizontal sequence.

## Process Overview

1.  **Clarify Needs**: Determine the desired layout type and approximate number of slots (e.g., "10 slots masonry").
2.  **Directory Setup**: Create `GeneratedBoards/Templates/{TemplateName}/`.
3.  **JSON Construction**: Generate the JSON with `rect` items as placeholders.
4.  **Output**: Save to `GeneratedBoards/Templates/{TemplateName}/{TemplateName}.json`.

## Detailed Instructions

### 1. Template Configuration

*   **TemplateName**: Something descriptive (e.g., `TemplateMasonry10`, `StoryBoardLinear`).
*   **Item Count**: Default to 9 if unspecified.
*   **Slot Size**: ALWAYS make panels SQUARE (1:1 aspect ratio). Standard size is **300x300** or **400x400**. Do not generate rectangular aspect ratios like 4:3 or 16:9 unless explicitly forced by the user to override this rule.

### 2. Layout Logic

#### A. Grid Layout
*   Calculated `x = col * (width + gap)`.
*   Calculated `y = row * (height + gap)`.
*   Center the grid around `(0,0)`.

#### B. Masonry Layout
*   Maintain `N` columns (e.g., 3).
*   Track current height of each column.
*   Place next item in the shortest column.
*   Vary heights randomly between 300 and 600 if "random masonry", or kept uniform if "clean masonry".

#### C. Filmstrip
*   Linear x-axis placement: `x = i * (width + gap)`.
*   `y = 0`.
*   Add arrow shapes between items if "flow" is requested.

### 3. JSON Structure

Use standard InfiniteBoard JSON schema.

**CRITICAL**: `gridConfig.visible` MUST be set to `false` by default to ensure a clean look. The `gridConfig.type` MUST ALWAYS be set to `"hatch"`. The "dots" type is deprecated.

**Placeholder Item Schema**:
```json
{
  "id": "slot-01",
  "type": "rect",
  "x": 0,
  "y": 0,
  "width": 300,
  "height": 300,
  "fill": "#2A2A2A",
  "stroke": "#555555",
  "strokeWidth": 2,
   // Label for the slot
  "content": "Image Slot" 
}
```
*Note: InfiniteBoard `rect` usually doesn't have `content` displayed as text, but we keep the structure simple. If valid `text` items are needed for labels, add a `text` item on top of the rect.*

### 4. Final Output

1.  **Generate JSON**: Construct the full JSON object.
2.  **Write File**: Save to `GeneratedBoards/Templates/{TemplateName}/{TemplateName}.json`.
3.  **Notify**: "Template created at [Path]".

## Example Usage

**User**: "Create a 3-column masonry template for 12 images."

**Agent**:
1.  Name: `MasonryTemplate12`.
2.  Alg: Loop 12 times.
    *   Col 0: y=0, h=300 -> next y=350.
    *   Col 1: y=0, h=400 -> next y=450.
    *   ...
    *   Create `rect` items.
3.  Save JSON.
