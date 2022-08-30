import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as glob from 'glob'
import {statSync} from 'fs'
import os from 'os'
import path from 'path'

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
    return acc.concat(glob.sync(pattern).filter(p => statSync(p).isFile()))
  }, [])
}

export function unmatchedPatterns(patterns: string[]): string[] {
  return patterns.reduce((acc: string[], pattern: string): string[] => {
    return acc.concat(
      glob.sync(pattern).filter(p => statSync(p).isFile()).length === 0
        ? [pattern]
        : []
    )
  }, [])
}

export async function downloadToolFromManifest(
  repo: string,
  tool: string,
  version: string,
  github_token: string,
  archive_subdir?: string
): Promise<unknown> {
  const manifest = await tc.getManifestFromRepo(
    'conventional-actions',
    repo,
    github_token,
    'main'
  )
  core.debug(`manifest = ${JSON.stringify(manifest)}`)

  const rel = await tc.findFromManifest(
    version === 'latest' ? '*' : version,
    true,
    manifest,
    os.arch()
  )
  core.debug(`rel = ${JSON.stringify(rel)}`)

  if (rel && rel.files.length > 0) {
    const downloadUrl = rel.files[0].download_url
    core.debug(`downloading from ${downloadUrl}`)

    const downloadPath = await tc.downloadTool(downloadUrl)
    core.debug(`downloaded to ${downloadPath}`)

    let extPath: string
    if (path.extname(downloadPath) === '.zip') {
      extPath = await tc.extractZip(downloadPath)
    } else if (path.extname(downloadPath) === '.7z') {
      extPath = await tc.extract7z(downloadPath)
    } else if (
      path.extname(downloadPath) === '.xar' ||
      path.extname(downloadPath) === '.pkg'
    ) {
      extPath = await tc.extractXar(downloadPath)
    } else {
      extPath = await tc.extractTar(downloadPath)
    }
    core.debug(`extracted to ${extPath}`)

    const toolPath = await tc.cacheDir(
      `${extPath}/${archive_subdir || ''}`,
      tool,
      rel.version,
      os.arch()
    )
    core.debug(`tool path ${toolPath}`)

    core.addPath(toolPath)
    return
  } else {
    throw new Error(`could not find ${tool} ${version} for ${os.arch()}`)
  }
}
