import {paths, parseMultiInput, unmatchedPatterns} from '../src'
import * as assert from 'assert'

describe('util', () => {
  describe('parseInputFiles', () => {
    it('parses empty strings', () => {
      assert.deepStrictEqual(parseMultiInput(''), [])
    })
    it('parses comma-delimited strings', () => {
      assert.deepStrictEqual(parseMultiInput('foo,bar'), ['foo', 'bar'])
    })
    it('parses newline and comma-delimited (and then some)', () => {
      assert.deepStrictEqual(
        parseMultiInput('foo,bar\nbaz,boom,\n\ndoom,loom '),
        ['foo', 'bar', 'baz', 'boom', 'doom', 'loom']
      )
    })
  })
  describe('paths', () => {
    it('resolves files given a set of paths', async () => {
      assert.deepStrictEqual(
        paths(['__tests__/data/**/*', '__tests__/data/does/not/exist/*']),
        ['__tests__/data/foo/bar.txt']
      )
    })
  })
  describe('unmatchedPatterns', () => {
    it("returns the patterns that don't match any files", async () => {
      assert.deepStrictEqual(
        unmatchedPatterns([
          '__tests__/data/**/*',
          '__tests__/data/does/not/exist/*'
        ]),
        ['__tests__/data/does/not/exist/*']
      )
    })
  })
})
