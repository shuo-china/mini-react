import { createFiber } from './ReactFiber'
import { isArray, isStringOrNumber, Update, updateNode } from './utils'
import { renderWithHooks } from './hooks'

export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type)
    updateNode(wip.stateNode, {}, wip.props)
  }

  reconcileChildren(wip, wip.props.children)
}

export function updateFunctionComponent(wip) {
  renderWithHooks(wip)
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
  let oldFiber = wip.alternate?.child
  let previousNewFiber = null
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]
    if (newChild == null) {
      continue
    }

    const newFiber = createFiber(newChild, wip)
    const same = sameNode(newFiber, oldFiber)
    if (same) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update
      })
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (previousNewFiber === null) {
      wip.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
  }
}

function sameNode(a, b) {
  return a && b && a.type === b.type && a.key === b.key
}
