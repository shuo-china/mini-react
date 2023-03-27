import { Fragment } from 'react'
import {
  ClassComponent,
  FunctionComponent,
  HostComponent,
  HostText
} from './ReactWorkTags'
import { Placement, isStr, isFn, isUndefined } from './utils'

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
    fiber.tag = type.prototype.isReactComponent
      ? ClassComponent
      : FunctionComponent
  } else if (isUndefined(type)) {
    fiber.tag = HostText
    fiber.props = {
      children: vnode
    }
  } else {
    fiber.tag = Fragment
  }

  return fiber
}
