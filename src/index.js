import React from './react'
import ReactDOM from './react-dom'

function FunctionComponent(props) {
  return (
    <div className="border">
      <p>{props.name}</p>
    </div>
  )
}

class ClassComponent extends React.Component {
  render() {
    return (
      <div className="border">
        <h3>{this.props.name}</h3>
        我是文本
      </div>
    )
  }
}

function FragmentComponent() {
  return (
    <ul>
      <>
        <li>part1</li>
        <li>part2</li>
      </>
    </ul>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))

const element = (
  <div className="border">
    <h1>react</h1>
    <a href="https://www.baidu.com/">百度一下</a>
    <FunctionComponent name="函数组件" />
    <ClassComponent name="类组件" />
    <FragmentComponent />
  </div>
)

root.render(element)
