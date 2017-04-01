import Vue from 'vue'

const App = <Component name="App">
  <Data>{function () {
    return { count: 0 }
  }}</Data>

  <Method>{function handleClick() {
    this.count++
  }}</Method>

  <Computed>{function double() {
    return this.count * 2
  }}</Computed>

  <Template>{`
    <div>
      hello!
      <button @click="handleClick">{{ count }}</button>
    </div>
  `}</Template>

</Component>

new Vue({
  el: '#app',
  render: h => h(App)
})
