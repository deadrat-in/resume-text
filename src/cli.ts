import { readFile, writeFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { styleText } from 'node:util'
import sade from 'sade'
import { render } from './render.js'
import type { Resume } from './types.js'
import type { Theme } from './render.js'
import { themes } from './render.js'
import pkg from '../package.json' with { type: 'json' }

const DEFAULT_FILENAME = 'resume.json'

type Options = {
  output?: string
  theme?: string
  'no-labels'?: boolean
  dates?: string
}

const getOutputFilename = (filename: string) =>
  `${basename(filename, extname(filename))}.txt`

const parseDates = (dates?: string): 'human' | 'iso' => {
  if (dates === 'iso') return 'iso'
  if (dates === 'human') return 'human'
  throw new Error(
    `Invalid --dates value "${dates}". Use "human" or "iso".`,
  )
}

export const cli = sade(pkg.name).version(pkg.version)

cli
  .command('render [filename]', 'Render resume to plain text', {
    default: true,
  })
  .option('-o, --output', 'Output filename')
  .option('-t, --theme', 'Theme to use')
  .option('--no-labels', 'Omit "Label: " prefixes (overrides theme default)')
  .option('--dates', 'Date format: human (default) or iso')
  .action(
    async (
      filename: string = DEFAULT_FILENAME,
      {
        output = getOutputFilename(filename),
        theme,
        labels,
        dates,
      }: Options & { labels?: boolean },
    ) => {
      const resume = JSON.parse(
        await readFile(filename, 'utf-8'),
      ) as Resume

      const text = render(resume, {
        theme: (theme ?? 'ats') as string | Theme,
        ...(labels !== undefined ? { labels } : {}),
        ...(dates ? { dates: parseDates(dates) } : {}),
      })

      if (output === '-') {
        process.stdout.write(text)
      } else {
        await writeFile(output, text)
        console.log(
          `Rendered resume to ${styleText('yellow', output)}.`,
        )
      }
    },
  )

cli
  .command('themes', 'List available themes')
  .action(async () => {
    for (const [name, theme] of Object.entries(themes)) {
      console.log(`${name} — ${theme.description}`)
    }
  })