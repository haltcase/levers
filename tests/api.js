import test from 'ava'
import levers from '..'
import { isAbsolute } from 'path'
import { unlinkSync } from 'fs'

const baseName = '__levers_temp_file_api__'

test('set() :: stores value at the specified path', t => {
  let storage = levers(baseName + 'set')

  storage.set('keyOne', 'valueOne')
  t.is(storage.get('keyOne'), 'valueOne')

  unlinkSync(storage.path)
})

test('set() :: allows for setting deeply nested keys', t => {
  let storage = levers(baseName + 'set-deep')

  storage.set('deeply.nested.key', true)
  t.deepEqual(storage.data, { deeply: { nested: { key: true } } })

  unlinkSync(storage.path)
})

test('set() :: allows using an object to set multiple keys', t => {
  let storage = levers(baseName + 'set-object')

  storage.set({ one: 1, two: 2 })
  t.deepEqual(storage.data, { one: 1, two: 2 })

  unlinkSync(storage.path)
})

test('get() :: retrieves value at the specified path', t => {
  let storage = levers(baseName + 'get')

  storage.set('someKey', 42)
  t.is(storage.get('someKey'), 42)

  unlinkSync(storage.path)
})

test('get() :: allows for accessing deeply nested keys', t => {
  let storage = levers(baseName + 'get-deep')

  storage.data = { deeply: { nested: { object: { key: 'value' } } } }
  t.is(storage.get('deeply.nested.object.key'), 'value')

  unlinkSync(storage.path)
})

test('getOr() :: returns provided value if the path is nil', t => {
  let storage = levers(baseName + 'get-or')

  storage.set('actualKey', 'with a value')
  t.is(storage.getOr('nothingHere', 'default value'), 'default value')

  unlinkSync(storage.path)
})

test('has() :: returns true or false based on the path\'s existence', t => {
  let storage = levers(baseName + 'has')

  t.false(storage.has('someKey'))
  storage.set('someKey', 'a value')
  t.true(storage.has('someKey'))

  unlinkSync(storage.path)
})

test('has() :: allows checking for deeply nested keys', t => {
  let storage = levers(baseName + 'has-deep')

  let path = 'deeply.nested.inner.property'
  t.false(storage.has(path))
  
  storage.set(path, '42')
  t.true(storage.has(path))

  unlinkSync(storage.path)
})

test('del() :: remove the specified path from the storage', t => {
  let storage = levers(baseName + 'del')

  storage.set('property', 999999)
  t.true(storage.has('property'))
  
  storage.del('property')
  t.false(storage.has('property'))

  unlinkSync(storage.path)
})

test('del() :: allows for removing deeply nested keys', t => {
  let storage = levers(baseName + 'del-deep')

  let path = 'deeply.nested.internal.property'
  storage.set(path, true)
  t.true(storage.has(path))

  storage.del(path)
  t.false(storage.has(path))

  unlinkSync(storage.path)
})

test('clear() :: remove all keys from the storage', t => {
  let storage = levers(baseName + 'clear')

  for (let v of [1, 2, 3, 4, 5]) {
    storage.set(`key${v}`, v)
  }
  
  t.is(storage.size, 5)
  
  storage.clear()
  t.is(storage.size, 0)

  unlinkSync(storage.path)
})

test('size :: returns the number of keys in storage', t => {
  let storage = levers(baseName + 'size')

  t.is(storage.size, 0)

  storage.set('something', 42)
  t.is(storage.size, 1)

  for (let v of [1, 2, 3, 4, 5]) {
    storage.set(`key${v}`, v)
  }
  
  t.is(storage.size, 6)

  unlinkSync(storage.path)
})

test('data :: returns the entire storage set', t => {
  let storage = levers(baseName + 'data-get')

  t.deepEqual(storage.data, {})

  storage.set('key', 'value')
  t.deepEqual(storage.data, { key: 'value'  })

  unlinkSync(storage.path)
})

test('data :: replaces the entire storage set', t => {
  let storage = levers(baseName + 'data-set')

  let expected = {
    theme: 'dark',
    config: {
      showToolbar: false,
      showSidebar: true,
      autoLogin: false
    }
  }
  
  storage.data = expected
  t.deepEqual(storage.data, expected)

  unlinkSync(storage.path)
})

test('path :: returns the actual absolute file path', t => {
  let storage = levers(baseName + 'path')

  t.true(isAbsolute(storage.path))
})

test('iterator :: allows direct iteration over the storage set', t => {
  let storage = levers(baseName + 'iterator')

  t.true(Symbol.iterator in storage)
  storage.data = { one: 'one', two: 'two', three: 'three' }
  
  let keys = []
  for (const [k, v] of storage) {
    t.true(k === v)
    keys.push(k)
  }
  
  t.deepEqual(keys, ['one', 'two', 'three'])

  unlinkSync(storage.path)
})
