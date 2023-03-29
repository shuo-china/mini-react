import { useReducer, useState, Component } from './react'
import ReactDOM from './react-dom'

function FunctionComponent(props) {
  //                                  (state, action) => newState
  const [count, setCount] = useReducer(x => x + 1, 0)
  const [num, setNum] = useState(0)

  return (
    <div className="border">
      <p>{props.name}</p>
      <button onClick={() => setCount()}>{count}</button>
      <button onClick={() => setNum(num + 1)}>{num}</button>
    </div>
  )
}

class ClassComponent extends Component {
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
