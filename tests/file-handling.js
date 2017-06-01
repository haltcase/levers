import test from 'ava'
import levers from '..'
import { join, isAbsolute } from 'path'
import { existsSync, unlinkSync } from 'fs'

const baseName = '__levers_temp_test_file__'

test('exposes path resolution logic as a static `resolve()` method', t => {
  t.is(typeof levers.resolve, 'function')
  t.is(typeof levers.resolve(baseName), 'string')
  t.true(isAbsolute(levers.resolve(baseName)))
})

test('`resolve()` uses provided directory for resolution', t => {
  let dir = __dirname
  t.is(levers.resolve('test', dir), join(dir, 'test.json'))
})

test('exposes file existence helper as a static `exists()` method', t => {
  t.is(typeof levers.exists, 'function')
  t.false(levers.exists('some-non-existent-file-name'))
  
  let name = '__levers_temp_settings_file__'
  let settings = levers(name)
  settings.set('someKey', 'someValue')

  t.true(levers.exists(name))

  unlinkSync(levers.resolve(name))
})

test('creates the target file lazily if it does not exist', t => {
  let name = baseName + 'new'
  let path = levers.resolve(name)
  t.false(existsSync(path))

  let settings = levers(name)
  t.false(existsSync(path))

  settings.set('someKey', 'someValue')
  t.true(existsSync(path))

  unlinkSync(path)
})

test('access the target file if it already exists', t => {
  let name = baseName + 'existing'
  let path = levers.resolve(name)

  let initializer = levers(name)
  initializer.set('someKey', 'someValue')
  t.true(existsSync(path))
  initializer = null

  let settings = levers(name)
  t.is(settings.get('someKey'), 'someValue')

  unlinkSync(path)
})

test('allows providing a custom directory', t => {
  let settings = levers('test', { dir: process.cwd() })

  settings.set('something', 'value')
  t.true(existsSync(join(process.cwd(), 'test.json')))

  unlinkSync(settings.path)
})
