import { app, remote } from 'electron'
import { isPlainObject } from 'lodash'
import root from 'app-root-path'
import jetpack from 'fs-jetpack'
import dotProp from 'dot-prop'
import path from 'path'

const obj = () => Object.create(null)

/**
 * @class Levels
 */
export default class Levers {
  /**
   * Create a new Levers instance, access / create the file
   *
   * @param {string} [prefix] - prefix to the file name
   * @param {object} [opts]
   */
  constructor (prefix, opts = {}) {
    this.PATH = initPath(`${prefix || ''}.settings`, opts.dir)
    this.data = Object.assign(obj(), opts.defaults, this.data)
    this.lastSync = 0
  }

  /**
   * Retrieve a value from the store
   * `defaultValue` is returned if the key doesn't exist
   * `key` can use dot-notation
   *
   * @param {string} key
   * @param {*} [defaultValue] - returned if value for `key` is undefined
   */
  get (key, defaultValue) {
    const val = dotProp.get(this.data, key)
    return typeof val !== 'undefined' ? val : defaultValue
  }

  /**
   * Set the value for a specified key in the store
   * `key` can either be a string (including dot-notation)
   * or an object, in which case `value` must be absent
   *
   * @param {(string|Object)} key
   * @param {*} [value]
   */
  set (key, value) {
    const data = this.data

    if (value === undefined && isPlainObject(key)) {
      for (const [k, v] of Object.entries(key)) {
        dotProp.set(data, k, v)
      }
    } else {
      dotProp.set(data, key, value)
    }

    this.data = data
  }

  /**
   * Returns true if `key` exists in the store, else false
   * `key` can use dot-notation
   *
   * @param {string} key
   * @returns {boolean}
   */
  has (key) {
    return dotProp.has(this.data, key)
  }

  /**
   * Remove a specified key from the store
   * `key` can use dot-notation
   *
   * @param {string} key
   */
  del (key) {
    const data = this.data
    dotProp.delete(data, key)
    this.data = data
  }

  /**
   * Remove all keys from the store
   */
  clear () {
    this.data = obj()
  }

  /**
   * Retrieve the total number of keys in the store
   * @returns {number}
   */
  get size () {
    return Object.keys(this.data).length
  }

  /**
   * Retrieve the entire dataset
   * @returns {Object}
   */
  get data () {
    const file = Object.assign(obj(), jetpack.read(this.PATH, 'json'))

    if (!isPlainObject(file)) {
      // I'm actually fairly sure this'll never happen
      return obj()
    } else {
      return file
    }
  }

  /**
   * Replace the entire store with a new object
   * Also used internally to write changes
   * Disk writes are queued so they aren't too frequent
   *
   * @param {Object} content
   */
  set data (content) {
    if (!isPlainObject(content)) return

    const now = new Date().getTime()

    if ((now - this.lastSync > 250)) {
      jetpack.file(this.PATH, { content, mode: '777' })
      if (this.active) clearTimeout(this.active)
    } else {
      if (this.active) clearTimeout(this.active)
      this.active = setTimeout(() => { this.data = content }, 275)
    }

    this.lastSync = now
  }

  get path () {
    return this.PATH
  }

  /**
   * Allow for direct iteration over the store
   */
  * [Symbol.iterator] () {
    const data = this.data

    for (const [k, v] of Object.entries(data)) {
      yield [k, v]
    }
  }
}

/**
 * Helper function to ensure the file exists
 * If it doesn't, it will be created and set to an empty object
 * If it does, its permissions will be confirmed
 * The permission check is mainly to handle Windows admin users
 *
 * @param {string} [fileName]
 * @param {string} [dir]
 * @returns {string} absolute file path
 */
function initPath (fileName, dir) {
  if (dir) return path.resolve(dir, `${fileName}.json`)

  // We don't use Electron's `userData` path here as it's unreliable
  // It sometimes points toward the default Electron directory in certain cases
  // To avoid this, we hunt down the app name from the root package.json if we can

  let appName
  try {
    const { name, productName } = require(`${root}/package.json`)
    appName = productName || name || 'Electron'
  } catch (e) {
    console.log(e)
  }

  const source = app || remote.app
  const DIR = path.resolve(`${source.getPath('appData')}/${appName}/data`)
  const PATH = path.resolve(DIR, `${fileName}.json`)

  // Ensure the file exists, create it if it doesn't
  if (!jetpack.exists(PATH)) {
    jetpack.file(PATH, { content: obj(), mode: '777' })
  } else {
    // File already exists, so just ensure permissions
    jetpack.file(PATH, { mode: '777' })
  }

  return PATH
}
