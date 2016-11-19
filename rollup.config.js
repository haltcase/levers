import babel from 'rollup-plugin-babel'

const pkg = require('./package.json')
const external = Object.keys(pkg.dependencies)

export default {
  entry: 'src/index.js',
  plugins: [
    babel({
      babelrc: false,
      presets: [],
      plugins: [
        'transform-es2015-parameters'
      ],
      comments: false
    })
  ],
  external,
  targets: [{
    dest: pkg['main'],
    format: 'cjs',
    moduleName: 'levers'
  }, {
    dest: pkg['jsnext:main'],
    format: 'es'
  }]
}
