import type { Resume } from './types.js'
import type { DateFormat } from './normalize.js'
import {
  bulletList,
  certificateDate,
  csvLine,
  educationDates,
  filterEmpty,
  fmtDate,
  formatLocation,
  heading,
  joinSections,
  projectDates,
  renderProfiles,
  volunteerDates,
  workDates,
} from './normalize.js'

export type SectionName =
  | 'basics'
  | 'summary'
  | 'work'
  | 'volunteer'
  | 'education'
  | 'awards'
  | 'certificates'
  | 'publications'
  | 'skills'
  | 'languages'
  | 'interests'
  | 'references'
  | 'projects'

export type RenderOptions = {
  theme?: string | Theme
  /** Prefix lines with "Label: " (e.g. "Name: Jane Doe"). Default true for `ats`, false for `standard`. */
  labels?: boolean
  /** Render dates as "August 2023" (human) or "2023-08" (iso). Default human. */
  dates?: DateFormat
  /** Only render these sections, in this order. Default: all sections. */
  sections?: SectionName[]
  /** Separator between sections. Default "\n\n". */
  separator?: string
}

export type Theme = {
  name: string
  description: string
  render: (resume: Resume, options?: RenderOptions) => string
}

const DEFAULT_OPTIONS = (theme: string): RenderOptions => ({
  labels: theme === 'ats',
  dates: 'human',
  separator: '\n\n',
})

export type NormalizedOptions = {
  theme: string
  labels: boolean
  dates: DateFormat
  sections?: SectionName[]
  separator: string
}

export const normalizeOptions = (
  theme: string,
  options?: RenderOptions,
): NormalizedOptions => {
  const defaults = DEFAULT_OPTIONS(theme)
  return {
    theme,
    labels: options?.labels ?? defaults.labels ?? true,
    dates: options?.dates ?? 'human',
    sections: options?.sections,
    separator: options?.separator ?? '\n\n',
  }
}

type Line = string | undefined
const present = (lines: Line[]): string[] =>
  lines.filter((line): line is string => line !== undefined && line.trim() !== '')

// ---------------------------------------------------------------------------
// Section renderers. Each returns lines for one section of the resume.
// ---------------------------------------------------------------------------

const sectionTitle = (title: string): string => title.toUpperCase()

const basicsSection = (
  basics: Resume['basics'],
  opts: NormalizedOptions,
): string | undefined => {
  if (!basics) return undefined
  const useLabels = opts.labels
  const lines: Line[] = []
  if (basics.name) lines.push(useLabels ? `Name: ${basics.name}` : basics.name)
  if (basics.label)
    lines.push(useLabels ? `Title: ${basics.label}` : basics.label)
  if (basics.email)
    lines.push(useLabels ? `Email: ${basics.email}` : basics.email)
  if (basics.phone)
    lines.push(useLabels ? `Phone: ${basics.phone}` : basics.phone)
  const location = formatLocation(basics.location)
  if (location)
    lines.push(useLabels ? `Location: ${location}` : location)
  if (basics.url)
    lines.push(useLabels ? `Website: ${basics.url}` : basics.url)
  lines.push(...renderProfiles(basics.profiles))
  return joinSections([heading(sectionTitle('Contact Information')), ...present(lines)])
}

const summarySection = (
  basics: Resume['basics'],
  opts: NormalizedOptions,
): string | undefined => {
  const summary = basics?.summary?.trim()
  if (!summary) return undefined
  return opts.labels
    ? joinSections([heading(sectionTitle('Professional Summary')), `Summary: ${summary}`])
    : joinSections([heading(sectionTitle('Professional Summary')), summary])
}

const workSection = (
  work: Resume['work'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(work ?? [])
  if (!items.length) return undefined
  const blocks: string[] = []
  for (const job of items) {
    const lines: Line[] = []
    if (opts.labels) {
      lines.push(`Job Title: ${job.position ?? ''}`)
      lines.push(`Company: ${job.name ?? ''}`)
      if (job.location) lines.push(`Location: ${job.location}`)
    } else {
      const title = [job.position, job.name].filter(Boolean).join(' @ ')
      if (title) lines.push(title)
      if (job.location) lines.push(job.location)
    }
    if (opts.labels) {
      if (job.startDate || job.endDate) {
        lines.push(`From: ${fmtDate(job.startDate, opts.dates)}`)
        lines.push(`To: ${job.endDate ? fmtDate(job.endDate, opts.dates) : 'Present'}`)
      }
    } else {
      const range = workDates(job, opts.dates)
      if (range) lines.push(range)
    }
    if (job.summary?.trim()) lines.push(job.summary.trim())
    lines.push(...bulletList(job.highlights))
    if (job.url) lines.push(opts.labels ? `Reference URL: ${job.url}` : job.url)
    blocks.push(present(lines).join('\n'))
  }
  return joinSections([heading(sectionTitle('Work Experience')), blocks.join('\n\n')])
}

const volunteerSection = (
  volunteer: Resume['volunteer'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(volunteer ?? [])
  if (!items.length) return undefined
  const blocks: string[] = []
  for (const vol of items) {
    const lines: Line[] = []
    if (opts.labels) {
      lines.push(`Position: ${vol.position ?? ''}`)
      lines.push(`Organization: ${vol.organization ?? ''}`)
    } else {
      const title = [vol.position, vol.organization].filter(Boolean).join(' @ ')
      if (title) lines.push(title)
    }
    if (opts.labels) {
      if (vol.startDate || vol.endDate) {
        lines.push(`From: ${fmtDate(vol.startDate, opts.dates)}`)
        lines.push(`To: ${vol.endDate ? fmtDate(vol.endDate, opts.dates) : 'Present'}`)
      }
    } else {
      const range = volunteerDates(vol, opts.dates)
      if (range) lines.push(range)
    }
    if (vol.summary?.trim()) lines.push(vol.summary.trim())
    lines.push(...bulletList(vol.highlights))
    if (vol.url) lines.push(opts.labels ? `Reference URL: ${vol.url}` : vol.url)
    blocks.push(present(lines).join('\n'))
  }
  return joinSections([heading(sectionTitle('Volunteer')), blocks.join('\n\n')])
}

const educationSection = (
  education: Resume['education'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(education ?? [])
  if (!items.length) return undefined
  const blocks: string[] = []
  for (const edu of items) {
    const lines: Line[] = []
    if (opts.labels) {
      lines.push(`Degree: ${edu.studyType ?? ''}`)
      lines.push(`Field of Study: ${edu.area ?? ''}`)
      lines.push(`Institution: ${edu.institution ?? ''}`)
    } else {
      const study = [edu.studyType, edu.area].filter(Boolean).join(', ')
      const title = [edu.institution, study].filter(Boolean).join(' - ')
      if (title) lines.push(title)
    }
    if (opts.labels) {
      if (edu.startDate || edu.endDate) {
        lines.push(`From: ${fmtDate(edu.startDate, opts.dates)}`)
        lines.push(`To: ${edu.endDate ? fmtDate(edu.endDate, opts.dates) : 'Present'}`)
      }
    } else {
      const range = educationDates(edu, opts.dates)
      if (range) lines.push(range)
    }
    if (edu.score)
      lines.push(opts.labels ? `Score: ${edu.score}` : `Score: ${edu.score}`)
    if (edu.courses?.length)
      lines.push(opts.labels ? `Courses: ${edu.courses.join(', ')}` : edu.courses.join(', '))
    if (edu.url) lines.push(opts.labels ? `Institution URL: ${edu.url}` : edu.url)
    blocks.push(present(lines).join('\n'))
  }
  return joinSections([heading(sectionTitle('Education')), blocks.join('\n\n')])
}

const awardsSection = (
  awards: Resume['awards'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(awards ?? [])
  if (!items.length) return undefined
  const lines: Line[] = []
  for (const award of items) {
    if (opts.labels) {
      lines.push(`Award: ${award.title ?? ''}`)
      if (award.awarder) lines.push(`Awarder: ${award.awarder}`)
      if (award.date) lines.push(`Date: ${fmtDate(award.date, opts.dates)}`)
    } else {
      const meta = [award.awarder, award.date ? fmtDate(award.date, opts.dates) : undefined]
        .filter(Boolean)
        .join(' - ')
      lines.push(award.title ?? 'Award')
      if (meta) lines.push(meta)
    }
    if (award.summary?.trim()) lines.push(award.summary.trim())
  }
  return joinSections([heading(sectionTitle('Awards')), ...present(lines)])
}

const certificatesSection = (
  certificates: Resume['certificates'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(certificates ?? [])
  if (!items.length) return undefined
  const lines: Line[] = []
  for (const cert of items) {
    if (opts.labels) {
      lines.push(`Certification: ${cert.name ?? ''}`)
      if (cert.issuer) lines.push(`Issuer: ${cert.issuer}`)
      if (cert.date) lines.push(`Date: ${certificateDate(cert, opts.dates)}`)
      if (cert.url) lines.push(`Certification URL: ${cert.url}`)
    } else {
      const meta = [cert.issuer, cert.date ? certificateDate(cert, opts.dates) : undefined]
        .filter(Boolean)
        .join(' - ')
      lines.push(cert.name ?? 'Certification')
      if (meta) lines.push(meta)
      if (cert.url) lines.push(cert.url)
    }
  }
  return joinSections([heading(sectionTitle('Certifications')), ...present(lines)])
}

const publicationsSection = (
  publications: Resume['publications'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(publications ?? [])
  if (!items.length) return undefined
  const lines: Line[] = []
  for (const pub of items) {
    if (opts.labels) {
      lines.push(`Publication: ${pub.name ?? ''}`)
      if (pub.publisher) lines.push(`Publisher: ${pub.publisher}`)
      if (pub.releaseDate) lines.push(`Date: ${fmtDate(pub.releaseDate, opts.dates)}`)
    } else {
      const meta = [pub.publisher, pub.releaseDate ? fmtDate(pub.releaseDate, opts.dates) : undefined]
        .filter(Boolean)
        .join(' - ')
      lines.push(pub.name ?? 'Publication')
      if (meta) lines.push(meta)
    }
    if (pub.summary?.trim()) lines.push(pub.summary.trim())
    if (pub.url) lines.push(pub.url)
  }
  return joinSections([heading(sectionTitle('Publications')), ...present(lines)])
}

const skillsSection = (
  skills: Resume['skills'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(skills ?? [])
  if (!items.length) return undefined
  const lines: Line[] = []
  for (const skill of items) {
    if (opts.labels) {
      lines.push(`Skill Category: ${skill.name ?? ''}`)
      if (skill.keywords?.length) lines.push(`Keywords: ${skill.keywords.join(', ')}`)
    } else {
      const title = [skill.name, skill.level].filter(Boolean).join(' - ')
      lines.push(title || 'Skill')
      const keywords = csvLine(skill.keywords)
      if (keywords) lines.push(keywords)
    }
  }
  return joinSections([heading(sectionTitle('Skills')), ...present(lines)])
}

const languagesSection = (
  languages: Resume['languages'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(languages ?? [])
  if (!items.length) return undefined
  const lines: Line[] = []
  for (const lang of items) {
    const text = opts.labels
      ? `Language: ${[lang.language, lang.fluency].filter(Boolean).join(' - ')}`
      : `  * ${[lang.language, lang.fluency].filter(Boolean).join(' - ')}`
    lines.push(text)
  }
  return joinSections([heading(sectionTitle('Languages')), ...present(lines)])
}

const interestsSection = (
  interests: Resume['interests'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(interests ?? [])
  if (!items.length) return undefined
  const lines: Line[] = []
  for (const interest of items) {
    if (opts.labels) {
      lines.push(`Interest: ${interest.name ?? ''}`)
      if (interest.keywords?.length) lines.push(`Details: ${interest.keywords.join(', ')}`)
    } else {
      lines.push(interest.name ?? 'Interest')
      const keywords = csvLine(interest.keywords)
      if (keywords) lines.push(keywords)
    }
  }
  return joinSections([heading(sectionTitle('Interests')), ...present(lines)])
}

const referencesSection = (
  references: Resume['references'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(references ?? [])
  if (!items.length) return undefined
  const lines: Line[] = []
  for (const ref of items) {
    if (opts.labels) {
      lines.push(`Reference: ${ref.name ?? ''}`)
    } else {
      lines.push(ref.name ?? 'Reference')
    }
    if (ref.reference?.trim()) lines.push(ref.reference.trim())
  }
  return joinSections([heading(sectionTitle('References')), ...present(lines)])
}

const projectsSection = (
  projects: Resume['projects'],
  opts: NormalizedOptions,
): string | undefined => {
  const items = filterEmpty(projects ?? [])
  if (!items.length) return undefined
  const blocks: string[] = []
  for (const project of items) {
    const lines: Line[] = []
    if (opts.labels) {
      lines.push(`Project Name: ${project.name ?? ''}`)
      if (project.startDate || project.endDate) {
        lines.push(`From: ${fmtDate(project.startDate, opts.dates)}`)
        lines.push(`To: ${project.endDate ? fmtDate(project.endDate, opts.dates) : 'Present'}`)
      }
      if (project.description?.trim()) lines.push(`Project Description: ${project.description.trim()}`)
    } else {
      lines.push(project.name ?? 'Project')
      const range = projectDates(project, opts.dates)
      if (range) lines.push(range)
      if (project.description?.trim()) lines.push(project.description.trim())
    }
    lines.push(...bulletList(project.highlights))
    const keywords = csvLine(project.keywords)
    if (keywords) lines.push(keywords)
    if (project.url) lines.push(opts.labels ? `Project URL: ${project.url}` : project.url)
    blocks.push(present(lines).join('\n'))
  }
  return joinSections([heading(sectionTitle('Projects')), blocks.join('\n\n')])
}

// ---------------------------------------------------------------------------
// Theme registry + renderer
// ---------------------------------------------------------------------------

// Core section assembler. Consumed by built-in themes; custom themes can use
// it via renderWith or provide their own render.
export const renderSections = (
  resume: Resume,
  themeName: string,
  options?: RenderOptions,
): string => {
  const opts = normalizeOptions(themeName, options)
  const sectionRenderers: Record<SectionName, () => string | undefined> = {
    basics: () => basicsSection(resume.basics, opts),
    summary: () => summarySection(resume.basics, opts),
    work: () => workSection(resume.work, opts),
    volunteer: () => volunteerSection(resume.volunteer, opts),
    education: () => educationSection(resume.education, opts),
    awards: () => awardsSection(resume.awards, opts),
    certificates: () => certificatesSection(resume.certificates, opts),
    publications: () => publicationsSection(resume.publications, opts),
    skills: () => skillsSection(resume.skills, opts),
    languages: () => languagesSection(resume.languages, opts),
    interests: () => interestsSection(resume.interests, opts),
    references: () => referencesSection(resume.references, opts),
    projects: () => projectsSection(resume.projects, opts),
  }

  const order: SectionName[] =
    opts.sections ??
    ([
      'basics',
      'summary',
      'work',
      'volunteer',
      'education',
      'awards',
      'certificates',
      'publications',
      'skills',
      'languages',
      'interests',
      'references',
      'projects',
    ] satisfies SectionName[])

  const parts = order
    .filter((name) => name in sectionRenderers)
    .map((name) => sectionRenderers[name]!())
    .filter((part): part is string => Boolean(part?.trim()))

  return parts.join(opts.separator)
}

export const ats: Theme = {
  name: 'ats',
  description:
    'Deterministic "Label: value" output, one field per line. Optimized for ATS auto-population (Workday, etc).',
  render: (resume, options) => renderSections(resume, 'ats', options),
}

export const standard: Theme = {
  name: 'standard',
  description:
    'Readable plain-text resume: section headings with merged role lines and bullets. No labels.',
  render: (resume, options) => renderSections(resume, 'standard', options),
}

export const themes: Record<string, Theme> = { ats, standard }

export const getTheme = (theme: string | Theme): Theme => {
  if (typeof theme !== 'string') return theme
  const found = themes[theme]
  if (!found) {
    throw new Error(
      `Unknown theme "${theme}". Available themes: ${Object.keys(themes).join(', ')}`,
    )
  }
  return found
}

export const renderWith = (
  resume: Resume,
  theme: string | Theme,
  options?: RenderOptions,
): string => {
  const resolved = getTheme(theme)
  return resolved.render(resume, options)
}

export const render = (resume: Resume, options?: RenderOptions): string =>
  renderWith(resume, options?.theme ?? 'ats', options)