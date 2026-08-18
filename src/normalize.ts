import type {
  Resume,
  ResumeLocation,
  ResumeProfile,
  ResumeProject,
  ResumeWork,
  ResumeVolunteer,
  ResumeEducation,
  ResumeCertificate,
} from './types.js'

export type DateFormat = 'human' | 'iso'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const fmtDate = (dateStr?: string, format: DateFormat = 'human'): string => {
  if (!dateStr) return ''
  if (format === 'iso') return dateStr
  const fullDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (fullDate) {
    const [, year, month] = fullDate
    const monthIndex = Number(month) - 1
    return `${MONTHS[monthIndex] ?? month} ${year}`
  }
  const yearMonth = /^(\d{4})-(\d{2})$/.exec(dateStr)
  if (yearMonth) {
    const [, year, month] = yearMonth
    const monthIndex = Number(month) - 1
    return `${MONTHS[monthIndex] ?? month} ${year}`
  }
  const yearOnly = /^(\d{4})$/.exec(dateStr)
  if (yearOnly) return yearOnly[1] ?? dateStr
  return dateStr
}

export const dateRange = (
  start?: string,
  end?: string,
  format: DateFormat = 'human',
): string | undefined => {
  if (!start && !end) return undefined
  const startStr = fmtDate(start, format)
  const endStr = end ? fmtDate(end, format) : 'Present'
  if (!startStr) return endStr
  return `${startStr} - ${endStr}`
}

export const formatLocation = (location?: ResumeLocation): string => {
  if (!location) return ''
  const parts = [
    location.city,
    location.region,
    location.countryCode,
    location.address,
    location.postalCode,
  ]
  return parts.filter((p): p is string => Boolean(p)).join(', ')
}

export const renderProfiles = (
  profiles?: ResumeProfile[],
): string[] => {
  if (!profiles?.length) return []
  return profiles.map((profile) => {
    const label = profile.username || profile.network || ''
    const url = profile.url || ''
    return url ? `${label}: ${url}` : label
  })
}

export const bulletList = (
  items: string[] | undefined,
  prefix = '  * ',
): string[] => (items?.length ? items.map((item) => `${prefix}${item}`) : [])

export const csvLine = (
  items: string[] | undefined,
  indent = '  ',
): string | undefined =>
  items?.length ? `${indent}${items.join(', ')}` : undefined

export const filterEmpty = <T extends Record<string, unknown>>(
  items: T[] | undefined,
): T[] => {
  if (!items) return []
  return items.filter((item) =>
    Object.values(item).some((value) => {
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null && value !== ''
    }),
  )
}

export const workDates = (work: ResumeWork, format?: DateFormat) =>
  dateRange(work.startDate, work.endDate, format)

export const volunteerDates = (volunteer: ResumeVolunteer, format?: DateFormat) =>
  dateRange(volunteer.startDate, volunteer.endDate, format)

export const educationDates = (education: ResumeEducation, format?: DateFormat) =>
  dateRange(education.startDate, education.endDate, format)

export const projectDates = (project: ResumeProject, format?: DateFormat) =>
  dateRange(project.startDate, project.endDate, format)

export const certificateDate = (cert: ResumeCertificate, format?: DateFormat) =>
  fmtDate(cert.date, format)

export const heading = (text: string, char = '='): string => {
  const underline = char.repeat(text.length)
  return `${text}\n${underline}`
}

export const joinSections = (
  sections: (string | undefined)[],
): string => {
  const present = sections.filter((s): s is string => Boolean(s?.trim()))
  return present.join('\n\n').replace(/\n{3,}/g, '\n\n')
}

export const resumeSections = (resume: Resume) =>
  resume as Record<string, unknown>