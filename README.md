# resume-text

[![npm version](https://img.shields.io/npm/v/resume-text)](https://www.npmjs.com/package/resume-text)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**JSON Resume → ATS-friendly plain text.**

Render a [JSON Resume](https://jsonresume.org/) into deterministic, machine-parseable plain text. The default `ats` theme emits one `Label: value` per line, which is the format that ATS systems like **Workday** auto-populate most reliably — the author verified this by applying through Workday with plain-text resumes.

Complements the [resumed](https://www.npmjs.com/package/resumed) / [resume-cli](https://www.npmjs.com/package/resume-cli) builders: use those for HTML/PDF, use this for ATS-ready text.

## Why plain text for ATS?

- ATS parsers read plain text top-to-bottom. Columns, tables, and icon fonts break extraction.
- `Label: value` lines let parsers map fields (Name, Email, Job Title, Dates) unambiguously.
- Deterministic output means the same resume always yields the same text.

## Installation

```bash
npm install resume-text
```

## CLI

```bash
# Default: ats theme, labels on, human dates → writes <name>.txt
npx resume-text render resume.json

# Specify a theme
npx resume-text render resume.json --theme ats
npx resume-text render resume.json --theme standard

# Options
npx resume-text render resume.json --no-labels     # omit "Label: " prefixes
npx resume-text render resume.json --dates iso     # 2019-06 instead of June 2019
npx resume-text render resume.json -o out.txt       # output filename ('-' = stdout)

# List themes
npx resume-text themes
```

## Library API

```ts
import { render } from 'resume-text'

const text = render(resume, {
  theme: 'ats',        // 'ats' (default) | 'standard'
  labels: true,        // include "Label: " prefixes
  dates: 'human',      // 'human' | 'iso'
  sections: ['basics', 'work', 'education', 'skills'], // filter + order
})
```

### Custom themes

Themes are plain objects exposing `render(resume, options)`. Use `renderWith` to
wrap the built-in section renderers with your own defaults, or supply a fully
custom renderer.

```ts
import { renderWith, renderSections } from 'resume-text'

const myTheme = {
  name: 'my-theme',
  description: 'Labels off, ISO dates',
  render: (resume, options) => renderSections(resume, 'ats', {
    ...options,
    labels: false,
    dates: 'iso',
  }),
}

const text = renderWith(resume, myTheme)
```

## Themes

| Theme | Description |
|---|---|
| `ats` | One `Label: value` per line. Optimized for ATS auto-population. |
| `standard` | Human-readable plain text: merged role lines, bullets, no labels. |

## Roadmap

- `compact` theme (dense one-line-per-entry)
- Date ranges as `From`/`To` in all labeled sections (partially done)
- Validate against `@jsonresume/schema` before rendering

## License

MIT

## Acknowledgments

Output format influenced by the [JSON Resume](https://jsonresume.org) ecosystem
and its text formatter (MIT). Plain-text field-labeling pattern informed by the
author's ATS testing.