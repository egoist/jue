const App = <Component>
  <Data>{function () {
    return { count: 0 }
  }}</Data>

  <Method>{function handleClick() {
    this.count++
  }}</Method>

  <Render>{function () {
    return <button>click: {this.count}</button>
  }}</Render>
</Component>
