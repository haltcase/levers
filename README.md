### <p align="center"><b>levers</b></p>

> ***levers*** is a simple data storage module aimed at Electron apps.

*note: levers is currently in active development and while it's currently in a high-functioning state, there may be bugs, untested features, and a lack of documentation.*

## Why?

Electron doesn't really have a built-in way to manage data storage, aside from the typical browser's `localStorage`. But this is only available in the renderer process. ***levers*** gives you a way to read and write JSON files from both the main and renderer processes, and you can even access nested properties using dot notation, thanks to [dot-prop][dotprop].

***levers*** is similar to other implementations, especially [conf][conf] from the author of `dot-prop`. In fact a lot of credit for the code herein belongs to @sindresorhus. [See here for more on how these projects relate.](#relation-to-other-projects)

[dotprop]: https://github.com/sindresorhus/dot-prop
[conf]: https://github.com/sindresorhus/conf

## Installation

`npm i levers`

## Usage

> COMING SOON

## Relation to other projects

### `conf`

This module is heavily based on `conf` with a few core differences.

1. Electron focus

   ***levers*** is intended to be used in Electron apps. It uses Electron's `app.getPath()` method to track down the storage location ( by default ). `conf` on the other hand is more general and uses the OS environment to store its data in the configuration directory ( by default ). Both allow the path to be configured.

2. Parent app name inference

   `conf` uses node's `module.parent` to resolve to the app's root package.json and determine the app or module's name, which is used for file creation ( more on this below ). To make this work reliably, it needs to delete its own `require.cache` to prevent caching.

   ***levers*** uses Electron's API along with the [app-root-path][approot] module to retrieve the parent app's identifier from its package.json, settling in this order:

   `productName -> name -> 'Electron'`

## Contributing

I am open to input and discussion about the project. Feel free to open an issue or submit a pull request. For large changes, please open an issue to discuss the revisions first.

## License

MIT

Uses code also licensed under MIT © [Sindre Sorhus](https://sindresorhus.com)
