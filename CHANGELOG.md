<!-- doc-changelog: generated 2026-09-17. Delete this line once you hand-edit this file. -->
# Changelog

Notable changes to Reach, newest first. The layout follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-09-17

### Added

- A "Sources & method" button beside the theme switcher opens a modal setting out where the coastlines come from and how every journey is costed, with tables of paces, load effects and comfort weights. It replaces the dense footnote at the foot of the page, and the tables read the same figures the router uses.
- Each group of conditions (time of year, who is travelling, carrying, puts up with) has an "i" button that opens an explanation of every option in the group, marking the one chosen. The traveller explanation also shows each traveller's preset load and tolerance.
- On screens 1280px wide and up the page uses the width: the question sits beside the title, the chart's captions and legend move into a third column, and the spheres and notes sit side by side.

### Changed

- Each sphere is folded shut by default, showing its name, its bracket of travel time and a count of places. Open one to see its places. When a place changes sphere, the count on its new sphere flashes.
- The conditions bar is four tidy groups, each a two-column grid of buttons, running four, two or one to a line by screen width. The running explanation paragraph has moved into the "i" modals.
- The notes list starts open on wide desktops, where it sits beside the spheres. It still starts shut on smaller screens.

## [0.1.0] - 2026-09-17

### Added

- The Notes section folds away: the whole section is shut by default and each note opens on its own.

### Fixed

- Lettering and marks on the chart, the red conditions bar, selected chips and the closed-route flag stayed unreadable in light mode (map labels as low as 1.06:1). They now hold a fixed light colour on those dark surfaces, and every case clears AA contrast.
- The focus ring on the conditions bar buttons was ochre on red (1.12:1). It is now bone.

## [0.0.1] - 2026-09-17

### Added

- Reach: an interactive chart of how far places were from Roman Surrentum, measured by distance or by travel time, for a chosen season, traveller, load and tolerance. Pin a place to read its route; pin a second to compare.
- Light, system and dark colour themes, with a switcher in the masthead.
- A shareable link that carries the current view.

### Fixed

- Unpinning one of two pinned places could briefly draw one route's line along the other's path.
- A malformed zoom value in a shared link fell through to a broken chart; it now falls back to the default zoom.

[Unreleased]: https://github.com/JasonWarrenUK/reach/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/JasonWarrenUK/reach/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/JasonWarrenUK/reach/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/JasonWarrenUK/reach/releases/tag/v0.0.1
