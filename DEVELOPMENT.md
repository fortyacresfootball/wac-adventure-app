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

Version 0.9 — Dashboard Latest News
Recovery commit: 4a57b53
Branch: feature/adventure-checklists
Status: working tree clean

## Next Planned Feature

### Version 1.0 — Events Page Rebuild

Replace the placeholder Events page with a live event system connected to the WAC `Events` sheet.

Planned capabilities:

- load active events directly from the database
- ignore inactive and cancelled events
- separate featured annual traditions from upcoming events
- sort upcoming events by start date
- display event date, location, category, organizer, and description
- open an event detail view when selected
- provide a useful empty state when no future events exist
- prepare the page for future RSVP and attendance features

Version 1.0 — Live Events Page
Recovery commit: 48198fb
Branch: feature/adventure-checklists
Status: working tree clean

## Version 1.0 — Live Events Page

Status: Complete

Completed work:

- replaced the placeholder Events page
- connected the page to the Events sheet
- displays the next active upcoming event
- lists all upcoming active events in chronological order
- ignores inactive, cancelled, completed, and deleted events
- automatically removes expired events from Upcoming Events
- added working event detail dialogs
- added annual tradition support based on event category
- added responsive desktop and mobile layouts
- retained the existing WAC visual design

Deferred:

- Past Events section
- RSVP tracking
- attendance tracking
- event reminders
- recurring-event automation
- event photos

Recovery commit: [paste commit hash]
Branch: [paste current branch]
Status: working tree clean

## Version 1.1 — Family & Friends Page

- rename Family to Family & Friends
- update the dashboard Quick Access label
- load active members from the Members sheet
- load compound totals from Adventures and Logs
- add member image support with fallback
- show member badge and point totals
- display latest completed adventure
- calculate current points leader
- show compound-wide adventure completion progress

3275cd6 (HEAD -> feature/adventure-checklists, origin/feature/adventure-checklists) Rebuild Family and Friends page with live member statistics

## Next Planned Feature

### Version 1.2 — Streamlined Member Profile

- reduce the Profile page to its most useful sections
- remove duplicate and unsupported placeholder sections
- use the selected member directly without searching again
- load Adventures and Logs only once
- show badges, points, rank and completion progress
- combine rank, milestone and challenge information
- display recent completed adventures
- display earned badge collection
- hide empty Category Progress and Achievements sections
- add Back to Family & Friends navigation
- improve profile loading speed

## Future Feature — WAC Achievement System

- populate and use the Achievement Catalog sheet
- define automatic achievement rules
- connect achievement definitions to earned member records
- prevent duplicate awards
- record earned dates
- display earned achievements on member profiles
- decide whether locked achievements should be visible
- replace the current hard-coded AchievementEngine rules

e030dbb (HEAD -> feature/adventure-checklists, origin/feature/adventure-checklists) Streamline member profile and improve profile loading

## Version 1.3 — WAC Resource Center

Status: Complete

Completed work:
- rebuilt the Resources page as a live database-driven library
- created the Resources sheet and starter catalog
- added live resource, category, and latest-update statistics
- added keyword search across titles, descriptions, categories, types, and tags
- added dynamic category filters
- added featured essential-resource cards
- added complete responsive resource library cards
- added resource type, version, access level, and update metadata
- added internal app navigation for the Adventure Handbook
- added Coming Soon states for resources without active links
- added loading, error, empty, and reset states
- added responsive desktop and mobile layouts

Recovery commit: 5df3c08
Branch: feature/adventure-checklists
Status: working tree clean

Electronic Participation Waiver + Submission Enforcement
Electronic Participation Waiver complete
Submission enforcement complete
Apps Script deployment updated
Latest Git commit hash recorded