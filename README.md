# TERRPG

An original browser sandbox combining Terraria-style 2D mining/building gameplay with RPG systems and story structure from the companion RPG project.

## Launch

Open **`index.html`** in a modern browser. There is only **one HTML file**. It is intentionally a thin game shell and loads the JavaScript files that run the game:

```text
index.html
styles.css
js/
  data.js
  game.js
```

The game logic is **not embedded in `index.html`**. `data.js` contains game data such as items, recipes, enemies, chapters and achievements. `game.js` contains the world simulation, rendering, movement, mining, building, combat, menus, crafting, progression and saving.

## Gameplay

- Smooth A/D + arrow-key movement
- Jumping, gravity and collision
- Mouse mining and block placement
- Procedural terrain, caves, trees and ores
- Hotbar and inventory
- Day/night cycle
- Enemy encounters, XP, levels and coins
- Equipment and RPG progression
- Campaign chapters and named bosses
- Crafting recipes
- Bestiary, quest log and achievements
- World map information
- Browser localStorage save/load
- Mobile touch movement

## Menu system

The menu provides original sandbox categories:

**Resume, Inventory, Crafting, Character, World Map, Bestiary, Quests, Achievements, Settings, Save/Load, Controls, Main Menu.**

It is designed around familiar sandbox/RPG menu flow without copying Terraria's exact interface, artwork, text, or proprietary assets.

## Controls

- **A / D** or **Arrow Keys** — move
- **Space / W** — jump
- **Left Click** — mine
- **Right Click** — place selected block
- **F** — attack nearby enemy
- **1–7** — choose hotbar slot
- **Esc** — open/close menu

## Relationship to the RPG project

The JavaScript data layer incorporates original RPG-inspired gear families, enemies, chapter progression, story-region names, crafting progression and achievement concepts from the companion project, while the browser game uses its own engine and UI.

## Implementation note

This is an original browser implementation inspired by 2D sandbox and RPG design. It does **not** contain Terraria source code, sprites, audio, maps, or other proprietary Terraria assets, and it does not attempt to reproduce Terraria pixel-for-pixel.
