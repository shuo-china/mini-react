import { Fragment } from 'react'
import {
  updateClassComponent,
  updateFragmentComponent,
  updateFunctionComponent,
  updateHostComponent,
  updateHostText
} from './ReactFiberReconciler'
import {
  ClassComponent,
  FunctionComponent,
  HostComponent,
  HostText
} from './ReactWorkTags'
import { scheduleCallback } from './scheduler'
import { Placement, Update, updateNode } from './utils'

let wip = null
let wipRoot = null

// 初次渲染或更新
export function scheduleUpdateOnFiber(fiber) {
  wip = fiber
  wipRoot = fiber

  scheduleCallback(workLoop)
}

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

function workLoop() {
  while (wip) {
    performUnitOfWork()
  }

  if (!wip && wipRoot) {
    commitRoot()
  }
}

function commitRoot() {
  commitWorker(wipRoot)
  wipRoot = null
}

function commitWorker(wip) {
  if (!wip) {
    return
  }
  // 提交自己
  const parentNode = getParentNode(wip.return)
  const { flags, stateNode, props, alternate } = wip

  if (flags & Placement && stateNode) {
    parentNode.appendChild(stateNode)
  }
  if (flags & Update && stateNode) {
    updateNode(stateNode, alternate.props, props)
  }
  // 提交子节点
  commitWorker(wip.child)
  // 提交兄弟
  commitWorker(wip.sibling)
}

function getParentNode(wip) {
  let tem = wip
  while (tem) {
    if (tem.stateNode) {
      return tem.stateNode
    }
    tem = tem.return
  }
}
