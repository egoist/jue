# jue

[![NPM version](https://img.shields.io/npm/v/jue.svg?style=flat)](https://npmjs.com/package/jue) [![NPM downloads](https://img.shields.io/npm/dm/jue.svg?style=flat)](https://npmjs.com/package/jue) [![Build Status](https://img.shields.io/circleci/project/egoist/jue/master.svg?style=flat)](https://circleci.com/gh/egoist/jue) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

## Install

You will need the `jue` runtime and `babel-preset-vue` for transforming Jue JSX:

```bash
yarn add jue
yarn add babel-preset-jue --dev
```

Configure `.babelrc`:

```js
{
  "presets": ["jue"]
}
```

## Example

**In:**

```jsx
const Counter = <Component>
  <Data>{function () {
    return { count: 0 }
  }}</Data>

  <Method>{function handleClick() {
    this.count++
  }}</Method>

  <Template>{`
    <button @click="handleClick">{{ count }}</button>
  `}</Template>
</Component>
```

**Out**:

```js
const Counter = {
  data() {
    return { count: 0 }
  },
  methods: {
    handleClick() {
      this.count++
    }
  },
  template: `<button @click="handleClick">{{ count }}</button>`
}
```

Alternatively, you can use Vue JSX with Jue JSX! For example in `render` function:

```js
const Counter = <Component>
  <Data>{function () {
    return { count: 0 }
  }}</Data>

  <Method>{function handleClick() {
    this.count++
  }}</Method>

  <Render>{function () {
    return <button onClick={this.handleClick}>{this.count}</button>
  }}</Render>
</Component>
```

## Tips

For `methods` and `computed` whose value should be an object, you can define its name via function name or component prop:

```js
<Method>{function handleClick() {
  this.count++
}}</Method>
```

Is equivalent to:

```js
<Method name="handleClick">{function () {
  this.count++
}}</Method>
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**jue** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/jue/contributors)).

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)
