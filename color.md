# Emper — Brand Color System

Reference palette for the platform's UI. The **Super Admin** dashboard uses these tokens
(green `#14BA80` primary, blue `#15A9E8` secondary, light semantic surfaces). The app's
light theme in `frontend/src/index.css` (`.light`) already supplies the matching semantic
surfaces (`--bg-auth-main: #F8FAFC`, cards `#FFFFFF`, borders `#E2E8F0`, slate text).

## Brand Colors
| Token | Hex | Usage |
|---|---|---|
| Primary | `#14BA80` | Main CTAs, primary buttons, success states, green accents |
| Primary Foreground | `#FFFFFF` | Text on primary buttons |
| Secondary | `#15A9E8` | Links, secondary accents, info states, blue highlights |
| Secondary Foreground | `#FFFFFF` | Text on secondary backgrounds |

## Semantic Colors (Light Mode)
| Token | Hex | Usage |
|---|---|---|
| Background | `#F8FAFC` | Page background |
| Foreground | `#0F172A` | Primary text |
| Card | `#FFFFFF` | Card surfaces |
| Card Foreground | `#0F172A` | Text on cards |
| Popover | `#FFFFFF` | Dropdown/popover background |
| Muted | `#F1F5F9` | Subtle backgrounds, tags |
| Muted Foreground | `#64748B` | Secondary text, placeholders |
| Border / Input | `#E2E8F0` | Borders, input fields |
| Destructive | `#EF4444` | Error states |
| Destructive Foreground | `#FFFFFF` | Text on destructive buttons |
| Ring | `#14BA80` | Focus rings |

## Semantic Colors (Dark Mode)
| Token | Hex | Usage |
|---|---|---|
| Background | `#0B0F19` | Dark page background |
| Foreground | `#F0F5FA` | Dark mode primary text |
| Card | `#0F141F` | Dark card surfaces |
| Muted | `#181F2B` | Dark subtle backgrounds |
| Muted Foreground | `#94A3B8` | Dark secondary text |
| Border / Input | `#202938` | Dark borders |
| Destructive | `#B91C1C` | Dark error states |

## Extended Brand Tokens
| Token | Hex | Light / Dark Variant |
|---|---|---|
| Coral (green) | `#14BA80` | Primary green |
| Coral Light | `#E6F9F1` / `#063826` | Light: soft green bg / Dark: dark green bg |
| Coral Light Foreground | `#0E8F63` / `#6EE7B7` | Text on coral-light |
| Coral Glow | `#1AD895` | Glow/shadow green |
| Teal (blue) | `#15A9E8` | Secondary blue |
| Teal Light | `#E3F5FD` / `#08293A` | Light: soft blue bg / Dark: dark blue bg |
| Teal Light Foreground | `#0E7FB0` / `#7DD3FC` | Text on teal-light |
| Teal Dark | `#0E8FC7` | Darker blue accent |
| Amber (as currently defined) | `#2BB5ED` | ⚠️ Currently mapped to blue in CSS, not true amber |
| Amber Light | `#D6F0FC` / `#08293A` | Soft blue bg |
| Cream | `#F8FAFC` / `#0F141F` | Page/cream surfaces |
| Charcoal | `#0F172A` | Headings, dark text |
| Charcoal Light | `#64748B` | Muted body text |

## Super Admin mapping (implemented)
| UI element | Color |
|---|---|
| Sidebar active item, primary buttons (Add Organization, Apply, Save) | `#14BA80` (hover `#0E8F63`), white text |
| Focus rings | `#14BA80` |
| Status/count pills, "employees" icon, Download CSV | `#14BA80` (tinted `#14BA80/15`) |
| "Add Key Member" (secondary action) | `#15A9E8` (tinted `#15A9E8/15`) |
| Destructive (remove member) | `#EF4444` |
| Surfaces (page/card/input/border/text/muted) | from the `.light` theme vars (F8FAFC / FFFFFF / E2E8F0 / 0F172A / 64748B) |
