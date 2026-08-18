import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { render, renderWith, themes } from '../src/index.js'
import type { Resume } from '../src/index.js'

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures/sample.json',
)

const loadFixture = (): Resume =>
  JSON.parse(readFileSync(fixturePath, 'utf-8')) as Resume

describe('render', () => {
  it('defaults to the ats theme', () => {
    const out = render(loadFixture())
    expect(out).toContain('Name: Richard Hendriks')
    expect(out).toContain('CONTACT INFORMATION')
  })

  it('renders the standard theme without labels', () => {
    const out = render(loadFixture(), { theme: 'standard' })
    expect(out).not.toContain('Name:')
    expect(out).toContain('CEO/President @ Pied Piper')
  })

  it('ats theme includes labelled work fields', () => {
    const out = render(loadFixture(), { theme: 'ats' })
    expect(out).toContain('Job Title: CEO/President')
    expect(out).toContain('Company: Pied Piper')
    expect(out).toContain('From: December 2013')
    expect(out).toContain('To: December 2014')
  })

  it('supports iso dates', () => {
    const out = render(loadFixture(), { dates: 'iso' })
    expect(out).toContain('From: 2013-12-01')
    expect(out).toContain('To: 2014-12-01')
  })

  it('supports no-labels via options', () => {
    const out = render(loadFixture(), { theme: 'ats', labels: false })
    expect(out).not.toContain('Name:')
    expect(out).toContain('Richard Hendriks')
  })

  it('supports section filtering and ordering', () => {
    const out = render(loadFixture(), { sections: ['skills', 'work'] })
    const skillsIdx = out.indexOf('SKILLS')
    const workIdx = out.indexOf('WORK EXPERIENCE')
    expect(skillsIdx).toBeGreaterThan(-1)
    expect(workIdx).toBeGreaterThan(-1)
    expect(skillsIdx).toBeLessThan(workIdx)
    expect(out).not.toContain('EDUCATION')
  })

  it('renders education with labels', () => {
    const out = render(loadFixture())
    expect(out).toContain('Degree: Bachelor')
    expect(out).toContain('Field of Study: Information Technology')
    expect(out).toContain('Institution: University of Oklahoma')
  })

  it('renders skills with labels', () => {
    const out = render(loadFixture())
    expect(out).toContain('Skill Category: Web Development')
    expect(out).toContain('Keywords: HTML, CSS, Javascript')
  })

  it('renders languages', () => {
    const out = render(loadFixture())
    expect(out).toContain('English - Native speaker')
  })

  it('renders projects', () => {
    const out = render(loadFixture())
    expect(out).toContain('Project Name: Miss Direction')
    expect(out).toContain('Project Description: A mapping engine that misguides you')
  })

  it('renders awards and publications', () => {
    const out = render(loadFixture())
    expect(out).toContain('Award: Digital Compression Pioneer Award')
    expect(out).toContain('Publication: Video compression for 3d media')
  })

  it('renders volunteer and references', () => {
    const out = render(loadFixture())
    expect(out).toContain('Position: Teacher')
    expect(out).toContain('Organization: CoderDojo')
    expect(out).toContain('Reference: Erlich Bachman')
  })

  it('handles an empty resume gracefully', () => {
    const out = render({})
    expect(out).toBe('')
  })

  it('skips empty sections in partial resumes', () => {
    const out = render({ basics: { name: 'Jay' } })
    expect(out).toContain('Name: Jay')
    expect(out).not.toContain('WORK EXPERIENCE')
  })
})

describe('renderWith', () => {
  it('accepts a theme object', () => {
    const customTheme = {
      name: 'custom',
      description: 'test',
      render: (resume: Resume) => `CUSTOM ${resume.basics?.name ?? ''}`,
    }
    const out = renderWith(loadFixture(), customTheme)
    expect(out).toContain('CUSTOM Richard Hendriks')
  })

  it('throws on unknown theme', () => {
    expect(() => render(loadFixture(), { theme: 'nope' })).toThrow(
      'Unknown theme',
    )
  })
})

describe('themes registry', () => {
  it('has ats and standard', () => {
    expect(Object.keys(themes).sort()).toEqual(['ats', 'standard'])
  })
})