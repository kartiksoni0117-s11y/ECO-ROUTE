---
name: EcoRoute Municipal Intelligence
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#00685f'
  on-tertiary: '#ffffff'
  tertiary-container: '#008378'
  on-tertiary-container: '#f4fffc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.03em
  metric-telemetry:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-2xs: 0.25rem
  space-xs: 0.375rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system embodies the standard of precision, civic responsibility, and infrastructural intelligence required for modern municipal operations. Tailored specifically for municipal fleet dispatchers, city environmental directors, and field operation supervisors, the interface balances high-density industrial telemetry with refined software aesthetics.

The visual style merges Modern Data-Dense SaaS with Precision Glass & Tonal Layering. It deliberately eliminates superficial ornamentation in favor of scannability, operational speed, and low visual fatigue during multi-hour dispatch shifts. The UI evokes confidence, real-time command, environmental efficiency, and infrastructural reliability. Crisp white structural modules emerge from layered cool slate backgrounds, punctuated by purposeful emerald routing paths, smart telemetry teals, and decisive multi-tiered civic alert statuses.

## Colors

The palette establishes an operational hierarchy calibrated for rapid decision-making across complex geospatial routes and high-volume waste container telemetrics:

- **Primary Emerald (`#059669` / `#10B981` / `#047857`)**: Anchors positive system states, confirmed collection paths, high-efficiency ratings, and critical call-to-actions.
- **Secondary Deep Slate Navy (`#0F172A`)**: Sets the standard for primary data readouts, map chrome, high-contrast labels, and command bars.
- **Tertiary Smart Teal (`#0D9488`)**: Dedicated to dynamic IoT data streams, sensor telemetry points, fill-level indicators, and real-time optimization calculations.
- **Neutral Canvas (`#F8FAFC` base, `#F1F5F9` sub-tier, `#FFFFFF` surfaces)**: Creates sharp atmospheric contrast, separating base canvas map viewports from elevated floating analytical panels.
- **System Telemetry & Status**:
  - Critical Urgent (`#EF4444`): Bin overflow (>90%), route obstruction, hydraulic sensor failure.
  - Cautionary Warning (`#F59E0B`): Pending collection threshold (70-89%), schedule variance, maintenance overdue.
  - Nominal Transit (`#2563EB`): Compactor trucks in transit, active dynamic turn-by-turn routing, automated dispatch pulses.
  - Neutral Inactive (`#64748B`): Parked assets, depots, offline IoT nodes.

Borders utilize `#E2E8F0` on cards and `#CBD5E1` on interactive divider elements to maintain clean visual boundaries under high ambient lighting environments.

## Typography

The typographic strategy is split into two specialized functions: natural interface comprehension via Geist, and rapid computational scanning via JetBrains Mono.

- **Primary Interface (Geist)**: Delivers geometric neutrality, tight character apertures, and disciplined spacing. Used for headings, analytical narrative, contextual metadata, and general user navigation.
- **Telemetry & Tabular Figures (JetBrains Mono)**: Mandatory for all live operational statistics, including fill percentages, GPS coordinate lat/long readouts, timestamps, truck IDs, and dynamic distance calculations. Ensures strict tabular alignment across dense tables and multi-point HUD panels without baseline jank.
- **Visual Rhythm**: High-density design requires compact line-heights. Maintain a strict distinction between informational prose and telemetry metrics, prioritizing uppercase styling with tracking for compact labels.

## Layout & Spacing

The layout operates on a dynamic fixed-sidebar, fluid-operational-core architecture tailored to single-screen and multi-monitor operations center displays:

- **Desktop (>= 1280px)**: A 3-zone system featuring an ultra-compact icon-and-label sidebar navigation (64px collapsed, 240px expanded), an interactive split viewport (50–65% interactive Map Canvas with 35–50% telemetric sidecar or floating overlay panels), and an optional collapsible bottom timeline (240px). Gutters remain locked at `1.5rem` to avoid visual clutter.
- **Tablet (768px - 1279px)**: Split-screen pivots to a stacked orientation or drawer-based panels where the GIS map occupies the main stage and operational metrics dock into a bottom sheet drawer.
- **Mobile (< 768px)**: Strict vertical single-column stack with persistent floating action drawers for field-driver turn lists and container override logs.
- **Spacing Rhythm**: Governed by an 8pt base grid with a 4pt sub-grid specifically reserved for compact metric headers, tag spacing, and mini-gauges (`space-2xs`, `space-xs`).

## Elevation & Depth

Visual hierarchy prioritizes surface clarity over heavy artificial lighting:

- **Surface Level 0 (Base Canvas `#F8FAFC`)**: The operational bedrock housing foundational grid lines, structural backdrops, and GIS satellite/vector basemaps.
- **Surface Level 1 (Primary Work Cards `#FFFFFF`)**: Standard telemetry modules, data grids, and summary cards. Border: `1px solid #E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Surface Level 2 (Floating Telemetry Overlays & Hover Panels)**: Live tracking inspection HUDs, route tooltips, and flyout navigation. Backdrop blur: `8px`. Background: `rgba(255, 255, 255, 0.92)`. Border: `1px solid #CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Surface Level 3 (Critical Incident Modals & Quick Action Sheets)**: Emergency route alterations, bin overflow dispatch modals. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`. Border: `1px solid #94A3B8`.

## Shapes

The design system embraces a calibrated medium curvature (12px to 16px) that softens high-density enterprise data while preserving geometric structure:

- **Primary Cards & Containers**: `12px` to `16px` border-radius (`rounded-lg` to `rounded-xl`).
- **Interactive Controls (Buttons, Inputs, Selects)**: `8px` (`rounded-md`) for sharp visual affordance.
- **Telemetry Chips, Badges & Pills**: Full pill (`9999px`) or `6px` depending on whether they represent qualitative status (pill) or categorical data/IDs (slight round).
- **Map Floating Panels**: Consistent `14px` border-radius with crisp 1px borders to separate tactical UI from GIS terrain layers.

## Components

- **Buttons**:
  - *Primary*: Background `#059669`, text `#FFFFFF`, font Geist SemiBold. Hover: `#047857`. Focus ring: 2px `#10B981` offset by 2px `#FFFFFF`.
  - *Secondary / Fleet Neutral*: Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#0F172A`. Hover: `#F1F5F9`.
  - *Critical Action*: Background `#EF4444`, text `#FFFFFF`. Hover: `#DC2626`.
- **Data Chips & Telemetry Status Badges**:
  - Compact height (20px to 24px) utilizing JetBrains Mono for alphanumeric indicators.
  - *Normal/Green*: `#ECFDF5` background, `#047857` text, `#A7F3D0` border.
  - *Warning/Amber*: `#FFFBEB` background, `#B45309` text, `#FDE68A` border.
  - *Critical/Red*: `#FEF2F2` background, `#B91C1C` text, `#FECACA` border.
  - *Transit/Blue*: `#EFF6FF` background, `#1D4ED8` text, `#BFDBFE` border.
- **Input Fields & Search Bars**:
  - Height 36px (compact) to 40px (standard). Background `#FFFFFF`, border `1px solid #E2E8F0`.
  - Left-aligned Lucide icons (`Search`, `Filter`, `Calendar`) colored `#64748B`. Placeholder text in `#94A3B8`. Focus creates a `2px solid #059669` ring without layout shift.
- **Telemetry & Bin Cards**:
  - Structured modular cards with an integrated progress bar or fill-gauge header.
  - Header: Truck ID or Bin Node ID in `label-md`, followed by location name and status chip.
  - Metric row: Geist 700 bold numerical values with unit suffixes rendered in `label-sm` (`JetBrains Mono`).
- **Lists & Data Tables**:
  - Zebra-free layout using subtle `#E2E8F0` horizontal divider rules. Row height: 44px (dense) or 56px (expanded).
  - Hover row state triggers a transition to `#F8FAFC`.
  - Header row set in JetBrains Mono uppercase, 11px, with sorting indicators.
- **Checkboxes & Radios**:
  - Compact 16x16px boxes with `#059669` fill when active, `#CBD5E1` border when idle. Crisp white vector check mark.
- **Domain-Specific Components**:
  - *Bin Fill Gauge*: Multi-segment linear or radial bar showing 0–100% capacity with programmatic color shifts (green -> amber -> red).
  - *Route Optimization Stepper*: Real-time sequence list displaying turn-by-turn waste nodes, compactor payload capacity, and carbon offset estimation counters.