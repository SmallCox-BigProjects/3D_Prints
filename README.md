# 3D_Prints

Landing page and project index for personal 3D printing projects.

## Folder structure

```
print_files/
├── Accessories/       # Printer or appliance add-ons
├── Decorative/        # Figurines, desk items, display pieces
├── Dragons/           # Dragon models
├── FlexiAnimals/      # Articulated / flexi animal prints
├── Functional/        # Practical parts and hardware
└── <NewCategory>/     # Add new categories as needed
```

Each project lives in its own subfolder under a category:

```
print_files/FlexiAnimals/FlexiSnake/
├── meta.json          ← tracked by git
├── preview.jpg        ← optional, tracked by git
└── FlexiSnakeBody.stl ← NOT tracked (binary, too large)
```

## Adding a new project

1. Create a folder: `print_files/<Category>/<ProjectName>/`
2. Drop your `.stl` / `.3mf` files in (not tracked by git — local only)
3. Add a `meta.json`:

```json
{
  "name": "Human-readable name",
  "quality": "Good",
  "time": "1.5 hours",
  "notes": "Any useful notes about settings, variants, etc."
}
```

   Valid `quality` values: `Good` · `Medium` · `Low` · `Not Printed`

4. Optionally add a `preview.jpg` (or `.png`) for the thumbnail column
5. Run the generator to rebuild `index.html`:

```bash
node scripts/generate-print-table.js
```

6. Commit `meta.json`, `preview.jpg`, and the updated `index.html`

## Large file handling

Binary 3D model files (`.stl`, `.3mf`, `.gcode`, etc.) are gitignored. Only
`meta.json` and preview images are committed. To find files over 1 GB to add
to the ignore list:

```bash
find . -size +1G | cat >> .gitignore
```
