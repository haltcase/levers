import Levers from '../dist/levers'

import { exists } from 'fs-jetpack'
import { resolve, isAbsolute, join } from 'path'
import { ok, strictEqual, deepEqual } from 'assert'
import { isPlainObject, isEmpty } from 'lodash'

const fileName = 'test.json'
const filePath = resolve(__dirname, '../fixtures')
let settings = new Levers(fileName, { dir: filePath })

describe('levers', () => {
  afterEach('clear the data file', () => settings.clear())

  it('ensures the file exists and removes user added .json extension', () => {
    strictEqual(exists(join(filePath, fileName)), 'file')
  })

  describe('#path', () => {
    it('should be an absolute path', () => {
      ok(isAbsolute(settings.path))
    })

    it('should be equal to the initialization path + file name', () => {
      strictEqual(settings.path, join(filePath, fileName))
    })
  })

  describe('#data', () => {
    const oldObj = { one: 'one', two: 'two', three: 'three' }
    const newObj = { four: 'four', five: 'five', six: 'six' }

    before(() => {
      settings.data = oldObj
    })

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
      ok(isPlainObject(settings.data) && isEmpty(settings.data))
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
