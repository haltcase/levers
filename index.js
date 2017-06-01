const fs = require('fs')
const os = require('os')
const path = require('path')
const makeDir = require('make-dir')
const dotProp = require('dot-prop')
const appRoot = require('app-root-path')
const isPlainObject = require('is-plain-obj')

const empty = () => Object.create(null)

function levers (name, options) {
  options = Object.assign({}, options)

  let path = getFilePath(name)
  let getData = createGetter(path)
  let setData = createSetter(path)

  let store = Object.assign(empty(), options.defaults, getData())

  function get (key, defaultValue) {
    store = getData()
    return dotProp.get(store, key, defaultValue)
  }

  function set (key, value) {
    store = getData()

    if (isPlainObject(key)) {
      for (let k of Object.keys(key)) {
        dotProp.set(store, k, key[k])
      }
    } else {
      dotProp.set(store, key, value)
    }

    setData(store)
  }

  function has (key) {
    store = getData()
    return dotProp.has(store, key)
  }

  function del (key) {
    store = getData()
    dotProp.delete(store, key)
    setData(store)
  }

  function clear () {
    store = empty()
    setData(store)
  }

  return {
    get,
    set,
    has,
    del,
    clear,

    get size () {
      return Object.keys(store).length
    },

    get data () {
      return getData()
    },

    set data (content) {
      if (!isPlainObject(content)) return
      setData(content)
    },

    get path () {
      return path
    },

    * [Symbol.iterator] () {
      for (let key of Object.keys(store)) {
        yield [key, store[key]]
      }
    }
  }
}

levers.exists = name => fs.existsSync(getFilePath(name))

function getFilePath (name) {
  let pkgPath = path.resolve(`${appRoot}`, 'package.json')
  let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

  let inHome = path.resolve.bind(null, os.homedir())
  let fileName = path.basename(name, '.json') + '.json'

  if (process.platform === 'win32') {
    return inHome('AppData', 'Local', pkg.name, 'Data', fileName)
  }

  if (process.platform === 'darwin') {
    return inHome('Library', 'Application Support', pkg.name, fileName)
  }

  let root = process.env.XDG_DATA_HOME || inHome('.local', 'share')
  return path.resolve(root, pkg.name, fileName)
}

function createGetter (atPath) {
  return () => {
    try {
      let raw = fs.readFileSync(atPath, 'utf8')
      return Object.assign(empty(), JSON.parse(raw))
    } catch (err) {
      if (err.code === 'ENOENT') {
        makeDir.sync(path.dirname(atPath))
        return empty()
      }

      if (err.name === 'SyntaxError') {
        return empty()
      }

      throw err
    }
  }
}

function createSetter (atPath) {
  return data => {
    makeDir.sync(path.dirname(atPath))
    fs.writeFileSync(atPath, JSON.stringify(data, null, 2))
  }
}

module.exports = levers
