import {
  useReducer,
  useState,
  Component,
  useEffect,
  useLayoutEffect
} from './react'
import ReactDOM from './react-dom'

function FunctionComponent(props) {
  //                                  (state, action) => newState
  const [count, setCount] = useReducer(x => x + 1, 0)
  const [num, setNum] = useState(4)

  useEffect(() => {
    console.log('hhh', num)
  }, [num])

  // useLayoutEffect(() => {
  //   console.log('sss', num)
  // }, [])

  return (
    <div className="border">
      <p>{props.name}</p>
      <button onClick={() => setCount()}>{count}</button>
      <button
        onClick={() => {
          if (num === 0) {
            setNum(4)
          } else {
            setNum(num - 2)
          }
        }}
      >
        {num}
      </button>
      {count % 2 ? <div>111</div> : <span>222</span>}
      <ul>
        {num === 2
          ? [0, 1, 3, 4].map(item => {
              return <li key={item}>{item}</li>
            })
          : [0, 1, 2, 3, 4].map(item => {
              return <li key={item}>{item}</li>
            })}

        {/* {[0, 1, 2, 3, 4].map(item => {
          return num >= item ? <li key={item}>{item}</li> : null
        })} */}
      </ul>
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
