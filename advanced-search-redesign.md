# Advanced Search UI Redesign

## Overview

This redesign aims to create an intuitive and powerful advanced search experience that separates content search from metadata search while maintaining a cohesive user experience. The design balances robust functionality with simplicity, using progressive disclosure to prevent overwhelming users.

## Core Principles

1. **Progressive Disclosure**: Reveal advanced options gradually as needed
2. **Clear Hierarchy**: Use visual design to guide users through the search experience
3. **Contextual Relevance**: Show different options based on search context
4. **Efficiency**: Minimize clicks for common search patterns
5. **Responsive Design**: Optimize for both desktop and mobile experiences

## Search Types

The redesign splits search into three distinct but interconnected modes:

1. **Basic Search**: Simple keyword search with type-ahead suggestions
2. **Advanced Search**: Structured metadata filtering with multiple criteria
3. **Content Search**: Full-text search within document contents

## Search Component Architecture

### 1. Universal Search Bar

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  🔍 Search files, content, and metadata...         │
│                                                    │
└────────────────────────────────────────────────────┘
```

- Single entry point that expands into contextual options
- Type-ahead suggestions showing recently used searches and popular filters
- Smart detection to determine if query is likely a content or metadata search

### 2. Search Mode Selector

```
┌─────────────┐┌─────────────────┐┌─────────────────┐
│ Basic Search ││ Advanced Search ││ Content Search  │
└─────────────┘└─────────────────┘└─────────────────┘
```

- Horizontal tabs for switching between search modes
- Visual indicators showing active filters in each mode
- Smooth transitions between modes, preserving current search parameters

### 3. Advanced Search Panel

```
┌────────────────────────────────────────────────────┐
│ FILTERS                          [Clear All]       │
├────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │Source System▼│ │File Type   ▼│ │Date Range  ▼│   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │Client ID    ▼│ │Tags        ▼│ │+ Add Filter │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                    │
│ APPLIED FILTERS:                                   │
│ ┌─────────┐ ┌───────────┐ ┌───────────────┐       │
│ │Source: X│ │Type: PDF X│ │Date: Last 7d X│       │
│ └─────────┘ └───────────┘ └───────────────┘       │
│                                                    │
│              [Search]                              │
└────────────────────────────────────────────────────┘
```

- Collapsible filter sections organized by relevance
- Visual feedback showing active filters
- Type-ahead suggestions for filter values
- Smart filter combinations with one-click application

### 4. Content Search Panel

```
┌────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────┐ │
│ │ 🔍 Search within document content...           │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ SEARCH OPTIONS:                                    │
│ ☑ Match exact phrase   ☐ Case sensitive           │
│ ☐ Regex search         ☑ Include document metadata│
│                                                    │
│ NARROW CONTENT SEARCH BY:                          │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │File Type   ▼│ │Date Range  ▼│ │Source      ▼│   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                    │
│              [Search Content]                      │
└────────────────────────────────────────────────────┘
```

- Focused text input optimized for content search
- Advanced content search options in collapsible panel
- Ability to combine content search with metadata filters

### 5. Recent Searches & Saved Filters

```
┌────────────────────────────────────────────────────┐
│ RECENT SEARCHES                 [Clear History]    │
├────────────────────────────────────────────────────┤
│ • "quarterly report" + PDF + Last 30 days          │
│ • Client ID: 12345 + Source: Dragon                │
│                                                    │
│ SAVED FILTERS                   [Manage]           │
├────────────────────────────────────────────────────┤
│ ★ Quarterly Reports                                │
│ ★ Client Documents                                 │
│ ★ Recent Submissions                               │
└────────────────────────────────────────────────────┘
```

- Quick access to search history with one-click reuse
- Ability to save and name custom filter combinations
- Visual distinction between content and metadata searches

## Responsive Design

### Desktop Experience

- Full horizontal layout with expanded filter options
- Side-by-side arrangement of filter panels and results
- Keyboard shortcuts for power users (⌘+/ for search, ⌘+Shift+A for advanced search)

### Tablet Experience

- Collapsible filter panel that slides in from left
- Results fill available space when filters are collapsed
- Touch-friendly filter controls with larger tap targets

### Mobile Experience

```
┌───────────────────────┐
│ 🔍 Search...          │
├───────────────────────┤
│ Filters (3) ▼  Mode ▼ │
├───────────────────────┤
│                       │
│                       │
│    Search Results     │
│                       │
│                       │
├───────────────────────┤
│   [Filters]  [Search] │
└───────────────────────┘
```

- Bottom sheet for filters that slides up
- Single column layout prioritizing results
- Filter pills showing active filters with easy removal
- Simplified controls optimized for touch

## Transitions Between Search Modes

### Basic → Advanced

- Expand basic search to reveal filter options
- Animate filter panels sliding in from right
- Maintain current query as initial filter value

### Advanced → Content

- Smooth tab transition showing content search panel
- Auto-apply relevant metadata filters from advanced search
- Highlight difference in scope with visual cue

### Content → Basic

- Collapse detailed options back to simple search bar
- Summarize content search parameters as filter pill
- Provide one-click return to detailed content search

## Filter Interaction Patterns

### Selection Behavior

- Single-click to select filter category
- Expandable list/grid for multiple choice options
- Type-ahead filtering for long lists
- Date picker with preset ranges and custom option

### Visual Feedback

- Active filters highlighted with accent color
- Filter pills showing applied values with clear removal option
- Count indicators showing number of results per filter value
- Loading states during search execution

## Implementation Considerations

1. **Performance Optimization**
   - Debounced search for real-time filtering
   - Virtualized lists for large result sets
   - Pagination or infinite scroll for results

2. **Accessibility**
   - ARIA labels for all search controls
   - Keyboard navigation support
   - Sufficient color contrast
   - Screen reader compatibility

3. **State Management**
   - URL parameter encoding of search state
   - Persistence of recent searches and filters
   - Clear error states for failed searches

## Results Presentation

```
┌────────────────────────────────────────────────────┐
│ 28 results                    Sort by: Relevance ▼ │
├────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Quarterly Report Q1 2023.pdf              │   │
│ │ PDF • Created April 12, 2023 • Dragon        │   │
│ │ [Preview] [Open] [More ▼]                    │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📄 Financial Statement Jan 2023.xlsx         │   │
│ │ Excel • Created Feb 3, 2023 • Genius         │   │
│ │ [Preview] [Open] [More ▼]                    │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│             [Load More Results]                    │
└────────────────────────────────────────────────────┘
```

- Card-based layout for rich metadata display
- List view option for dense information display
- Quick action buttons for common operations
- Highlighted content snippets for content search results
- Infinite scroll or pagination based on performance testing

## Notifications and Feedback

- Loading indicators during search execution
- Empty state suggestions when no results found
- Error handling with actionable recovery options
- Success confirmations for saved filters
- "Did you mean?" suggestions for potential typos

## Example User Flows

### Power User Scenario
1. Opens advanced search directly with keyboard shortcut
2. Selects "Source System: Dragon" and "File Type: PDF"
3. Adds date range "Last 30 days"
4. Adds content search "quarterly projections"
5. Saves search configuration as "Recent Quarterly Reports"

### Casual User Scenario
1. Types keyword in basic search
2. Sees suggestion to refine with advanced filters
3. Clicks "Add Filters" button
4. Selects source system from visual list
5. Views results with option to refine further

### Mobile User Scenario
1. Taps search icon in mobile header
2. Enters basic search term
3. Taps filter button to open bottom sheet
4. Selects 1-2 filters from simplified list
5. Swipes through results cards 