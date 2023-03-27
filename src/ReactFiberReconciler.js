import { createFiber } from './ReactFiber'
import { isArray, isStringOrNumber, updateNode } from './utils'

export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type)
    updateNode(wip.stateNode, wip.props)
  }

  reconcileChildren(wip, wip.props.children)
}

export function updateFunctionComponent(wip) {
  const { type, props } = wip
  const children = type(props)
  reconcileChildren(wip, children)
}

export function updateClassComponent(wip) {
  const { type, props } = wip
  const instance = new type(props)
  const children = instance.render()
  reconcileChildren(wip, children)
}

export function updateFragmentComponent(wip) {
  reconcileChildren(wip, wip.props.children)
}

export function updateHostText(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createTextNode(wip.props.children)
  }
}

// 首次渲染（创建子Fiber）
// 协调(diff)
function reconcileChildren(wip, children) {
  if (isStringOrNumber(children)) {
    return
  }
  const newChildren = isArray(children) ? children : [children]
  let previousNewFiber = null
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]
    if (newChild == null) {
      continue
    }

    const newFiber = createFiber(newChild, wip)

    if (previousNewFiber === null) {
      wip.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
  }
}
