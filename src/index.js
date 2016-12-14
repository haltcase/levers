import { app, remote } from 'electron'
import isPlainObject from 'is-plain-obj'
import root from 'app-root-path'
import jetpack from 'fs-jetpack'
import dotProp from 'dot-prop'
import path from 'path'

const obj = () => Object.create(null)

class Levers {
  /**
   * Create a new Levers instance and access or create the data file.
   * By default the file is stored in the OS application data directory.
   * For example, on Windows this is `C:\Users\YourName\AppData\YourApp`.
   * Levers creates a subdirectory `data` that will contain the file.
   *
   * To override this default directory, pass the `dir` property in the
   * options object. In both this and the above case, the directory and
   * file will be created if they do not exist already.
   *
   * If the file does exist already, it will be read into memory.
   *
   * @param {string} [fileName='.settings']
   *  Specify a name for the file. If a `.json` extension is included,
   *  it is removed upon creating the file to prevent a double extension.
   * @param {Object} [opts={}]
   * @param {string} [opts.dir]
   *  Optional alternate directory in which to store the file.
   * @param {Object} [opts.defaults]
   *  Initialize the data store with default values
   *
   * @example
   *
   * import Levers from 'levers'
   *
   * // creates a file named `.settings.json` in the default directory
   * const settings = new Levers()
   *
   * // creates `app.json` in the default directory
   * const appSettings = new Levers('app')
   *
   * // creates `config.json` in custom directory
   * // uses opts.defaults to set initial values
   * const path = require('path')
   * const windowSettings = new Levers('config', {
   *   dir: path.resolve(__dirname, 'settings')
   *   defaults: { dev: true, theme: 'light' }
   * })
   */
  constructor (fileName = '.settings', opts = {}) {
    this.PATH = initFile(getPath(fileName, opts.dir))
    this.data = Object.assign(obj(), opts.defaults, this.data)
  }

  /**
   * Retrieve a value from the store
   *
   * `defaultValue` is returned if the key doesn't exist
   *
   * @param {string} key
   *  Can be a simple string or use dot-notation, eg. 'three.levels.deep'
   * @param {*} [defaultValue] Returned if value for `key` is undefined
   *
   * @example
   *
   * levers.get('dev')
   *
   * // with a default value to use if key is not present
   * levers.get('dev', false)
   *
   * // using dot-notation for nested properties
   * levers.get('ui.theme')
   */
  get (key, defaultValue) {
    const val = dotProp.get(this.data, key)
    return typeof val !== 'undefined' ? val : defaultValue
  }

  /**
   * Set the value for a specified key in the store<br><br>
   * `key` can either be a string (including dot-notation)
   * or an object, in which case `value` is ignored
   *
   * @param {(string|Object)} key
   * @param {*} [value]
   *
   * @example
   *
   * levers.set('dev', true)
   *
   * // using dot-notation for nested properties
   * levers.set('ui.theme', 'dark')
   *
   * // using object syntax
   * levers.set({ dev: true, ui: { theme: 'dark' } })
   */
  set (key, value) {
    const data = this.data

    if (isPlainObject(key)) {
      for (const k of Object.keys(data)) {
        dotProp.set(data, k, data[k])
      }
    } else {
      dotProp.set(data, key, value)
    }

    this.data = data
  }

  /**
   * Returns true if `key` exists in the store, else false
   *
   * @param {string} key
   *  Can be a simple string or use dot-notation, eg. 'three.levels.deep'
   * @returns {boolean}
   *
   * @example
   *
   * levers.has('dev')
   * // -> false
   *
   * levers.set('dev', true)
   * levers.has('dev')
   * // -> true
   */
  has (key) {
    return dotProp.has(this.data, key)
  }

  /**
   * Remove a specified key from the store
   *
   * @param {string} key
   *  Can be a simple string or use dot-notation, eg. 'three.levels.deep'
   *
   * @example
   *
   * levers.set('dev', false)
   * levers.set({ ui: { theme: 'blue' } })
   *
   * levers.has('dev')
   * // -> true
   * levers.has('ui.theme')
   * // -> true
   *
   * levers.del('dev')
   * levers.del('ui.theme')
   *
   * levers.has('dev')
   * // -> false
   * levers.has('ui.theme')
   * // -> false
   */
  del (key) {
    const data = this.data
    dotProp.delete(data, key)
    this.data = data
  }

  /**
   * Remove all keys from the store
   *
   * @example
   *
   * levers.set({ dev: true, ui: { theme: 'dark' } })
   *
   * levers.data
   * // -> { dev: true, ui: { theme: 'dark' } }
   *
   * levers.clear()
   *
   * levers.data
   * // -> {}
   */
  clear () {
    this.data = obj()
  }

  /**
   * Retrieve the total number of keys in the store
   * @type {number}
   *
   * @example
   *
   * levers.set('dev', true)
   * levers.size
   * // -> 1
   */
  get size () {
    return Object.keys(this.data).length
  }

  /**
   * GETTER<br>
   * Retrieve the entire dataset
   * @type {Object}
   *
   * @example
   *
   * levers.set({ dev: true, ui: { theme: 'dark' } })
   *
   * levers.data
   * // -> { dev: true, ui: { theme: 'dark' } }
   */
  get data () {
    return Object.assign(obj(), jetpack.read(this.PATH, 'json'))
  }

  /**
   * SETTER<br>
   * Replace the entire store with a new object
   *
   * Also used internally to write changes
   *
   * @type {Object}
   *
   * @example
   *
   * levers.set('youWillNeverSeeThis', true)
   *
   * levers.data = { dev: true, ui: { theme: 'dark' } }
   *
   * levers.data
   * // -> { dev: true, ui: { theme: 'dark' } }
   */
  set data (content) {
    if (!isPlainObject(content)) return
    jetpack.file(this.PATH, { content, mode: '777' })
  }

  /**
   * Retrieve the file path of the instance
   * @type {string}
   *
   * @example
   *
   * const levers = new Levers('app')
   *
   * // on Windows in an app called Spaghetti
   * levers.path
   * // -> C:\Users\YourName\AppData\Roaming\Spaghetti\data\app.json
   */
  get path () {
    return this.PATH
  }

  /**
   * Check the existence of a Levers file.
   *
   * @param {string} name
   *   The name of the file to search for
   * @param {string} [dir]
   *   The directory in which to search. Uses the same resolution
   *   as passing `options.dir` to a `Levers` constructor.
   * @returns {boolean}
   *
   * @example
   *
   * import Levers from 'levers'
   *
   * if (!Levers.exists('app')) {
   *   // the file doesn't exist
   * }
   *
   * const settings = new Levers('app')
   */
  static exists (name, dir) {
    return jetpack.exists(getPath(name, dir)) === 'file'
  }

  /**
   * Factory method for creating `Levers` instances. Provides
   * a cleaner method of creating a Levers instance when used
   * in callback or factory situations without having to wrap
   * `new Levers()` in an anonymous function.
   *
   * @param {string} [fileName='.settings']
   * @param {Object} [opts={}]
   * @returns {Levers}
   * @see {@link Levers}
   *
   * @example
   *
   * import Levers from 'levers'
   *
   * // the following are exactly equivalent
   * new Levers('app')
   * Levers.create('app')
   */
  static create (fileName, opts) {
    return new Levers(fileName, opts)
  }

  /**
   * Allow for direct iteration over the store
   */
  * [Symbol.iterator] () {
    const data = this.data

    for (const key of Object.keys(data)) {
      yield [key, data[key]]
    }
  }
}

/**
 * Helper function to ensure the file exists. If it doesn't,
 * it will be created and set to an empty object. If it does,
 * its permissions will be confirmed.
 *
 * @param {string} [fileName]
 * @param {string} [dir]
 * @returns {string} absolute file path
 * @private
 */
function getPath (fileName, dir) {
  fileName = path.basename(fileName, '.json') + '.json'
  if (dir) return path.resolve(dir, `${fileName}`)

  // We don't use Electron's `userData` path here as it's unreliable
  // It sometimes points toward the default Electron directory in certain cases
  // To avoid this, we hunt down the app name from the root package.json if we can

  let appName = 'Electron'
  try {
    const { name, productName } = require(`${root}/package.json`)
    appName = productName || name || 'Electron'
  } catch (e) {}

  const APP = app || remote.app
  const DIR = path.resolve(APP.getPath('appData'), appName, 'data')
  return path.resolve(DIR, fileName)
}

function initFile (filePath) {
  // Ensure the file exists, create it if it doesn't
  if (!jetpack.exists(filePath)) {
    jetpack.file(filePath, { content: obj(), mode: '777' })
  } else {
    // File already exists, so just ensure permissions
    jetpack.file(filePath, { mode: '777' })
  }

  return filePath
}

export default Levers