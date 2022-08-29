declare module "@conventional-actions/toolkit" {
  export function parseMultiInput(files: string): string[]
  export function paths(patterns: string[]): string[]
  export function unmatchedPatterns(patterns: string[]): string[]
}
