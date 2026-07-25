# WAC Adventure App
## Development Guide

---

# Project Vision

The WAC Adventure App is the official digital companion for the Workman Adventure Compound (WAC).

The goal is to create a polished, family-friendly application that motivates members to complete adventures, earn badges, preserve memories, and continue building the legacy of the WAC for future generations.

This is intended to feel like a professional commercial application rather than a spreadsheet or database.

---

# Current Development Philosophy

Development follows these principles:

- Finish one feature before starting another.
- Avoid redesigning completed work.
- Every completed feature receives a Git commit.
- Always preserve backwards compatibility whenever possible.
- The application should remain functional after every work session.

---

# Current Technology

Frontend

- HTML
- CSS
- Vanilla JavaScript

Development

- Visual Studio Code
- Live Server Extension

Source Control

- Git
- GitHub

Data

- Google Sheets
- Google Apps Script API

---

# Startup Procedure

1. Open VS Code.

2. Open folder

```
wac-adventure-app
```

3. Right-click

```
index.html
```

4. Select

```
Open with Live Server
```

DO NOT use

```
npm start
```

The current project is a static web application.

---

# End of Session

Always perform:

```bash
git status
git add .
git commit -m "Description of today's work"
git push
```

Never leave uncommitted work.

---

# Folder Structure

```
assets/
    badges/
    badges_raw/
    icons/
    images/

components/
    dashboard.html
    drawer.html
    successModal.html

css/
    styles.css

data/

js/

pages/

scripts/
```

---

# Badge Images

Badge naming convention

```
B-01.webp
B-02.webp
B-03.webp
```

Fallback

```
png
```

Badges are loaded automatically inside drawer.js.

---

# Adventure Workbook

Current adventure fields

- ID
- Category
- Title
- Vibe
- Why It Matters
- Mission
- Presidents Note
- Badge Images
- Points
- Difficulty
- Estimated Time
- Location
- Season
- Minimum Age
- Equipment
- Featured
- Prerequisite
- Repeatable
- GPS Coordinates
- Adventure Icon
- Sort Order

---

# Current UI Status

Completed

- Navigation
- Dashboard
- Adventure Cards
- Adventure Drawer
- Badge Loading
- Progress Tracking
- Success Modal

Current drawer includes

- Header
- Badge
- Category
- Title
- Points
- Status
- Summary Banner
- Adventure Overview
- Mission
- Why It Matters
- President's Note
- Equipment
- Prerequisites
- Complete Adventure button

---

# Design Language

Theme

- Forest Green
- Gold
- White
- Natural Earth Tones

The app should feel

- Premium
- Outdoor
- Family
- Adventure
- Legacy

Avoid

- Corporate
- Generic dashboards
- Spreadsheet appearance
- Flat admin interfaces

---

# Coding Style

Preferred

- Clear section dividers
- Consistent indentation
- Readable spacing
- Descriptive variable names

Avoid

- Giant functions
- Duplicate logic
- Duplicate CSS
- Magic numbers

---

# Git Milestones

Version 0.4

Drawer redesign complete.

Git Commit

```
9208c85
Drawer redesign and adventure detail improvements
```

---

# Development Roadmap

Version 0.5

Adventure Photos

Version 0.6

Interactive Adventure Checklists

Version 0.7

Maps

Version 0.8

Achievements

Version 0.9

Admin Portal

Version 1.0

Family Release

---

# Session Workflow

At the beginning of every development session

1. Open project.
2. Launch Live Server.
3. Verify app loads.
4. Review DEVELOPMENT.md.
5. Continue current milestone.

---

# Current Priority

Next feature

Adventure Photos

Goal

Every adventure should eventually include

- Badge
- Hero Image
- Gallery
- Optional Map

This is the next major visual improvement.

---

# Long-Term Vision

The completed application should feel like a premium outdoor adventure platform.

Members should be excited to open the app before arriving at the WAC.

The application should preserve memories for decades while encouraging new adventures for future generations.