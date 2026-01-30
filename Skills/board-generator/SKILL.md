---
name: board-generator
description: Generate comprehensive InfiniteBoard JSON files from a high-level concept, description, or reference moodboard. This skill orchestrates the creation of visual moodboards, mind maps, or narrative storyboards by generating consistently styled images, structuring layout based on references, and formatting the final JSON output.
---

# Board Generator Skill

Use this skill when the user asks to "generate a board", "create a moodboard", "brainstorm visual ideas", "make a diagram", or "continuing a story" about a specific topic.

## Process Overview

1.  **Analysis (Conceptual or Reference)**: 
    *   If text only: Break down the user's topic into key visual and textual elements.
    *   **If Reference Image provided**: Analyze the moodboard photo to determine grid density, organization style, color palette, and visual vibe.
    *   **If JSON Template provided**: strict usage of the provided template. You must fill 100% of the available slots.
2.  **Project Structure Setup**: create a dedicated directory `GeneratedBoards/{ProjectName}/` and an `assets/` subdirectory inside it.
3.  **Template Analysis (If Template Mode)**: Parse the input JSON to count exact number of image slots (`rect`) and text slots (`text`).
4.  **Asset Generation (Linear & Consistent)**: Create necessary image assets one by one. If using a template, generate exactly N images for the N slots.
5.  **Layout/Injection**: 
    *   *Scratch Mode*: Organize elements spatially.
    *   *Template Mode*: **Inject** generated assets into the corresponding template slots, preserving original `x`, `y`, `width`, `height`.
6.  **JSON Construction**: Build the InfiniteBoard-compatible JSON object with **valid file URIs** for images.
6.  **Output**: Write the JSON file to `GeneratedBoards/{ProjectName}/{ProjectName}.json`.

## detailed Instructions

### 1. Analysis & Conceptualization

**Scenario A: Text Request**
*   **Core Theme**: The central topic or story (This becomes `ProjectName`).
*   **Visual Style**: Define specific keywords (e.g., "Pixar style", "Cyberpunk", "Line art").
*   **Key Sections**: Logical groupings or storyboard scenes.

**Scenario B: Reference Moodboard Uploaded**
*   **Layout Mimicry**: Count the number of images and their arrangement (scattered, grid, linear). Use this to structure the generated board.
*   **Style Extraction**: Identify the dominant colors and artistic style of the reference and apply them to the generation prompts.
*   **Content Inference**: If the user wants "something like this", replicate the mix of text/images found in the reference.

**Scenario C: JSON Template Mode (Strict Injection)**
*   **Input**: A path to an existing JSON template (e.g., `Timeline4Acts.json`).
*   **Goal**: Fill **every single slot** in the template with new content.
*   **Process**:
    1.  Read the JSON.
    2.  Identify "Visual Slots": These are usually `rect` items (placeholders).
    3.  Identify "Text Slots": These are `text` items.
    4.  Plan the generation queue to match these counts exactly.

### 2. Project Directory Initialization
Before generating content:
1.  Define a `ProjectName` (CamelCase or PascalCase).
2.  Create directory: `GeneratedBoards/{ProjectName}/`.
3.  Create directory: `GeneratedBoards/{ProjectName}/assets/`.

### 3. Asset Generation (The Consistency Loop)

**CRITICAL**: When creating a story or cohesive set, **DO NOT** generate all images in parallel. Generate them **sequentially**.

1.  **Image 1 (Anchor)**: Generate the first image based on the character/setting description.
    *   *Action*:
        ```bash
        // turbo
        node "Skills/board-generator/scripts/gen_google_images.js" "PROMPT..." "GeneratedBoards/{ProjectName}/assets/{ProjectName}_1.png" --ar=16:9 --enhance
        ```
    *   **Arguments**:
        *   `--ar=16:9` (or 1:1, 9:16, 4:3): Set aspect ratio.
        *   `--enhance`: Use Gemini 2.5 Flash to automatically improve the prompt.
        ```
    *   *Wait*: Ensure the command finishes before proceeding.
2.  **Image 2+ (Follow-up)**:
    *   **Context**: Include visual descriptions from previous prompts to manually maintain consistency.
    *   **Prompt**: Explicitly describe repeated features (e.g., "The same cute boy astronaut with red suit") and the new action.
    *   *Action*:
        ```bash
        // turbo
        node "Skills/board-generator/scripts/gen_google_images.js" "PROMPT..." "GeneratedBoards/{ProjectName}/assets/{ProjectName}_2.png" "GeneratedBoards/{ProjectName}/assets/{ProjectName}_1.png" --ar=16:9
        ```
        ```

*Repeat this chain for all subsequent images to ensure character and style consistency.*

### 4. Layout Strategy & Content Injection

**A. New Layout (Scratch)**
*   **Coordinates**: `(0,0)` is center.
*   **Linear Story**: Arrange horizontally with arrows or spacing (e.g., x=0, x=500, x=1000).
*   **Moodboard**: Use a masonry or collage layout if the reference suggests it.
*   **Spacing**: Minimum 50px buffer.

**B. Template Injection (Transformation)**
*   **Iterate** through the original template's `items` array.
*   **Match & Replace**:
    *   If item is a `rect` (Placeholder):
        *   Keep: `x`, `y`, `width`, `height`, `rotation`.
        *   Change: `type` becomes `"image"`.
        *   Add: `content` = "file:///absolute/path/to/generated_asset.png".
        *   Remove: `fill` (unless it's a frame), `stroke`.
    *   If item is `text` (Placeholder):
        *   Keep: `x`, `y`, `fontSize`, `align`, `width`.
        *   Update: `content` = "Generated textual content matching the story step".
*   **Outcome**: The resulting JSON structure MUST be identical to the template layout, just with new content "filled in".

### 5. JSON Structure & Path Fixes

**CRITICAL IMAGE PATH RULE**: 
Generated images saved to disk MUST be referenced in the JSON using **absolute file URIs** with **forward slashes**. 
The path should point to the file inside the project's assets folder.

*   **Format**: `file:///C:/Users/.../GeneratedBoards/{ProjectName}/assets/image.png`

**JSON Schema**:
```json
{
  "scale": 1,
  "position": { "x": 0, "y": 0 },
  "gridConfig": { "enabled": true, "visible": false, "type": "lines", "spacing": 50, "color": "#444444", "opacity": 0.3 },
  "backgroundConfig": { "type": "color", "color": "#1a1a1a" },
  "items": [
    {
      "id": "uuid-v4",
      "type": "image",
      "x": 0,
      "y": 0,
      "content": "file:///C:/Path/To/GeneratedBoards/MyProject/assets/img_1.png", 
      "width": 300,
      "height": 300
    }
    // ... texts, rects
  ]
}
```

### 6. Final Output Steps
1.  **Verify Assets**: Ensure all images are in `GeneratedBoards/{ProjectName}/assets/`.
2.  **Verify Paths**: Check that JSON content paths are absolute URIs (`file:///...`).
3.  **Write JSON**: Save to `GeneratedBoards/{ProjectName}/{ProjectName}.json`.
4.  **Notify**: Tell the user the board is ready in its dedicated folder.

## Example Workflow (Story)

User: "Story about a cat chef, linear."

**Agent Action**:
1.  **Setup**: Create `GeneratedBoards/CatChef/assets/`.
2.  **Gen Image 1**: `cat_cooking_1` -> Save to `.../CatChef/assets/`.
3.  **Gen Image 2**: `cat_cooking_2` (Input: `cat_cooking_1`) -> Save to `.../CatChef/assets/`.
4.  **Build JSON**: 
    - Map items.
    - Path: `file:///.../GeneratedBoards/CatChef/assets/cat_cooking_1.png`
5.  **Save**: `GeneratedBoards/CatChef/CatChef.json`.
