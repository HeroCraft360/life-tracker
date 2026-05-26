# Life Tracker

Life Tracker is a small static browser app that turns a birthdate into a playful personal dashboard. It includes a birthday countdown, life stats, milestones, progress grids, avatar customization, daily mood check-ins, seasonal themes, motion and sound settings, and local data import/export.

## Features

- Birthday countdown with a special birthday mode.
- Age, days lived, weeks lived, months lived, year progress, and life-map stats.
- Milestone countdowns for major ages.
- Year progress and lifetime week grids.
- Daily mood check-ins with short notes.
- Avatar color, cheek color, size, accessory, and sky theme customization.
- Automatic seasonal/time-of-day themes.
- No-clouds and mute settings.
- Local JSON export and import.
- Platformer controls for exploring dashboard panels.
- Collapsible panel portals, panel discovery, quests, collectibles, achievements, and coins.

## Run

Open `index.html` in a browser, or serve the folder with a simple static server.

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8765`.

## Data

The app stores data in the browser's `localStorage` under `lifeTrackerDataV2`. Use the Export data button before clearing browser storage or moving to a different browser.

## Controls

```text
A / D       Move the avatar
W / Space   Jump
S           Drop through a platform
```

## Project Structure

```text
index.html
css/style.css
js/script.js
README.md
```
