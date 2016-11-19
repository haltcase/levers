import Levers from '../dist/levers'

import isPlainObject from 'is-plain-obj'
import { exists, remove } from 'fs-jetpack'
import { resolve, isAbsolute, join } from 'path'
import { ok, strictEqual, deepEqual } from 'assert'

const FILE_NAME = 'test.json'
const FILE_PATH = resolve(__dirname, '../fixtures')
let settings = new Levers(FILE_NAME, { dir: FILE_PATH })

describe('levers', () => {
  afterEach('clear the data file', () => settings.clear())

  it('ensures the file exists and removes user added .json extension', () => {
    strictEqual(exists(join(FILE_PATH, FILE_NAME)), 'file')
  })

  describe('#path', () => {
    it('should be an absolute path', () => {
      ok(isAbsolute(settings.path))
    })

    it('should be equal to the initialization path + file name', () => {
      strictEqual(settings.path, join(FILE_PATH, FILE_NAME))
    })
  })

  describe('#data', () => {
    const oldObj = { one: 'one', two: 'two', three: 'three' }
    const newObj = { four: 'four', five: 'five', six: 'six' }

    before(() => { settings.data = oldObj })

    describe('GETTER', () => {
      it('retrieves the entire dataset', () => {
        deepEqual(settings.data, oldObj)
      })
    })

    describe('SETTER', () => {
      it('overwrites the dataset with specified object', () => {
        settings.data = newObj

        deepEqual(settings.data, newObj)
      })
    })
  })

  describe('#set() and #get()', () => {
    it('sets and gets the value for a specified key', () => {
      settings.set('keyOne', 'valueOne')

      strictEqual(settings.get('keyOne'), 'valueOne')
    })
  })

  describe('#clear()', () => {
    it('removes all keys from the store', () => {
      settings.data = { one: 'one', two: 'two', three: 'three' }

      settings.clear()
      ok(isPlainObject(settings.data))
      deepEqual(settings.data, {})
    })
  })

  describe('.exists()', () => {
    it('returns false if the given file does not exist', () => {
      ok(!Levers.exists('non-existent', FILE_PATH))
    })

    it('returns true if the given file does not exist', () => {
      ok(Levers.exists(FILE_NAME, FILE_PATH))
    })
  })

  describe('.create()', () => {
    it('creates and returns a new instance', () => {
      const NEW_FILE = 'new-file.json'
      const instance = Levers.create(NEW_FILE, { dir: FILE_PATH })
      deepEqual(instance.data, {})
      ok(Levers.exists(NEW_FILE, FILE_PATH))

      remove(join(FILE_PATH, NEW_FILE))
    })
  })

  describe('iteration', () => {
    it('should iterate over store keys', () => {
      settings.data = { one: 'one', two: 'two', three: 'three' }

      ok(Symbol.iterator in settings)

      for (const [k, v] of settings) ok(k === v)
    })
  })
})
