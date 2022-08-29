import * as glob from 'glob'
import {statSync} from 'fs'

export function parseMultiInput(files: string): string[] {
  return files.split(/\r?\n/).reduce<string[]>(
    (acc, line) =>
      acc
        .concat(line.split(','))
        .filter(pat => pat)
        .map(pat => pat.trim()),
    []
  )
}

export function paths(patterns: string[]): string[] {
  return patterns.reduce((acc: string[], pattern: string): string[] => {
    return acc.concat(
      glob.sync(pattern).filter(path => statSync(path).isFile())
    )
  }, [])
}

export function unmatchedPatterns(patterns: string[]): string[] {
  return patterns.reduce((acc: string[], pattern: string): string[] => {
    return acc.concat(
      glob.sync(pattern).filter(path => statSync(path).isFile()).length === 0
        ? [pattern]
        : []
    )
  }, [])
}
