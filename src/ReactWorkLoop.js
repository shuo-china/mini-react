import { Fragment } from 'react'
import {
  updateClassComponent,
  updateFragmentComponent,
  updateFunctionComponent,
  updateHostComponent,
  updateHostText
} from './ReactReconciler'
import {
  ClassComponent,
  FunctionComponent,
  HostComponent,
  HostText
} from './ReactWorkTags'

let wip = null

function performUnitOfWork() {
  const { tag } = wip

  // todo 更新当前组件
  switch (tag) {
    case HostComponent:
      updateHostComponent(wip)
      break

    case FunctionComponent:
      updateFunctionComponent(wip)
      break

    case ClassComponent:
      updateClassComponent(wip)
      break

    case Fragment:
      updateFragmentComponent(wip)
      break

    case HostText:
      updateHostText(wip)
      break

    default:
      break
  }

  if (wip.child) {
    wip = wip.child
    return
  }

  let next = wip

  while (next) {
    // todo complted work

    if (next.sibling) {
      wip = next.sibling
      return
    }

    next = next.return
  }

  wip = null
}
