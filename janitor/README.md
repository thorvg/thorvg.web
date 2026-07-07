# Thor Janitor - WebCanvas

Web port of [thorvg.janitor](https://github.com/thorvg/thorvg.janitor), running on the [`@thorvg/webcanvas`](https://www.npmjs.com/package/@thorvg/webcanvas).

**"Clean the Galaxy, One Sweep at a Time!"**

## Development

```
$ npm install
$ npm run dev       # dev server
$ npm run build     # type-check + production build (`dist/`)
$ npm run preview   # serve the production build locally
```

## Render flags
Switch renderer with a URL param:
- Software: `?renderer=sw`
- WebGL: `?renderer=gl` (default)
- WebGPU: `?renderer=wg`

## Controls

* **Arrow Keys**: Movement (Left/Right rotate, Up thrust)
* **A**: Shoot

## Credits

See: https://github.com/thorvg/thorvg.janitor