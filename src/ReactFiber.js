import { FunctionComponent, HostComponent } from './ReactWorkTags'
import { Placement, isStr, isFn } from './utils'

export function createFiber(vnode, returnFiber) {
  const fiber = {
    type: vnode.type,
    key: vnode.key,
    props: vnode.props,
    stateNode: null,
    child: null,
    sibling: null,
    return: returnFiber,
    flags: Placement,
    alternate: null,
    deletions: null,
    index: null
  }

  const { type } = vnode
  if (isStr(type)) {
    fiber.tag = HostComponent
  } else if (isFn(type)) {
    // 类或函数组件
    fiber.tag = FunctionComponent
  }

  return fiber
}
