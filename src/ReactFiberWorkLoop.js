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
    const before = getHostSibling(wip.sibling)
    insertOrAppendPlacementNode(stateNode, before, parentNode)
    // parentNode.appendChild(stateNode)
  }
  if (flags & Update && stateNode) {
    updateNode(stateNode, alternate.props, props)
  }
  if (wip.deletions) {
    commitDeletions(wip.deletions, stateNode || parentNode)
  }

  if (wip.tag === FunctionComponent) {
    invokeHooks(wip)
  }

  // 提交子节点
  commitWorker(wip.child)
  // 提交兄弟
  commitWorker(wip.sibling)
}

function invokeHooks(wip) {
  const { updateQueueEffect, updateQueueLayout } = wip

  for (let i = 0; i < updateQueueLayout.length; i++) {
    const effect = updateQueueLayout[i]
    effect.create()
  }

  for (let i = 0; i < updateQueueEffect.length; i++) {
    const effect = updateQueueEffect[i]
    scheduleCallback(() => {
      effect.create()
    })
  }
}

function getHostSibling(sibling) {
  while (sibling) {
    if (sibling.stateNode && !(sibling.flags & Placement)) {
      return sibling.stateNode
    }
    sibling = sibling.sibling
  }
}

function insertOrAppendPlacementNode(stateNode, before, parentNode) {
  if (before) {
    parentNode.insertBefore(stateNode, before)
  } else {
    parentNode.appendChild(stateNode)
  }
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

function commitDeletions(deletions, parentNode) {
  for (let i = 0; i < deletions.length; i++) {
    parentNode.removeChild(getStateNode(deletions[i]))
  }
}

function getStateNode(fiber) {
  let tem = fiber
  while (!tem.stateNode) {
    tem = tem.child
  }
  return tem.stateNode
}
