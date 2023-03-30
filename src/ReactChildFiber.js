import { createFiber } from './ReactFiber'
import { isArray, isStringOrNumber, Placement, Update } from './utils'

// 首次渲染（创建子Fiber）
// 协调(diff)
export function reconcileChildren(returnFiber, children) {
  if (isStringOrNumber(children)) {
    return
  }
  const newChildren = isArray(children) ? children : [children]
  let oldFiber = returnFiber.alternate?.child
  // 下一个oldFiber | 暂时缓存下一个oldFiber
  let nextOldFiber = null
  // 判断父Fiber是初次渲染还是更新
  let shouldTrackSideEffects = !!returnFiber.alternate
  let previousNewFiber = null
  let newIndex = 0
  // 上一次dom节点插入的最远位置
  let lastPlacedIndex = 0

  // 更新阶段 从左往右遍历，比较新老节点，如果可以复用，继续往右，否则停止
  for (; oldFiber && newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex]
    if (newChild == null) {
      continue
    }

    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber
      oldFiber = null
    } else {
      nextOldFiber = oldFiber.sibling
    }

    const same = sameNode(newChild, oldFiber)
    if (!same) {
      if (!oldFiber) {
        oldFiber = nextOldFiber
      }
      break
    }

    const newFiber = createFiber(newChild, returnFiber)
    Object.assign(newFiber, {
      stateNode: oldFiber.stateNode,
      alternate: oldFiber,
      flags: Update
    })

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    )

    if (previousNewFiber === null) {
      returnFiber.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }
    previousNewFiber = newFiber
    oldFiber = nextOldFiber
  }

  // 新节点没了 旧节点还存在 删除旧节点
  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber)
    return
  }

  // 初次渲染
  // 旧节点没了，新节点还有
  if (!oldFiber) {
    for (; newIndex < newChildren.length; newIndex++) {
      const newChild = newChildren[newIndex]
      if (newChild == null) {
        continue
      }

      const newFiber = createFiber(newChild, returnFiber)
      // 只是添加了index属性
      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        newIndex,
        shouldTrackSideEffects
      )

      if (previousNewFiber === null) {
        returnFiber.child = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }

      previousNewFiber = newFiber
    }

    return
  }

  // 新老节点都还存在
  // 构建旧节点的hash表
  const existingChildren = mapRemainingChildren(oldFiber)

  // 遍历新节点，通过新节点的K去hash表中查找节点，找到旧复用，并删除hash表中对应的节点
  for (; newIndex < newChildren.length; newIndex++) {
    const newChild = newChildren[newIndex]
    if (newChild == null) {
      continue
    }
    const newFiber = createFiber(newChild, returnFiber)
    const matchedFiber = existingChildren.get(newFiber.key || newFiber.index)
    if (matchedFiber) {
      Object.assign(newFiber, {
        stateNode: matchedFiber.stateNode,
        alternate: matchedFiber,
        flags: Update
      })
      existingChildren.delete(newFiber.key || newFiber.index)
    }

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    )

    if (previousNewFiber === null) {
      returnFiber.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
  }

  // hash表中还有值，遍历删除
  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child))
  }
}

function mapRemainingChildren(currentFirstChild) {
  const existingChildren = new Map()
  let existingChild = currentFirstChild
  while (existingChild) {
    existingChildren.set(
      existingChild.key || existingChild.index,
      existingChild
    )
    existingChild = existingChild.sibling
  }
  return existingChildren
}

function placeChild(
  newFiber,
  lastPlacedIndex,
  newIndex,
  shouldTrackSideEffects
) {
  newFiber.index = newIndex
  // 父节点初次渲染
  if (!shouldTrackSideEffects) {
    return lastPlacedIndex
  }
  // 父节点更新
  // 子节点是否更新
  const current = newFiber.alternate
  if (current) {
    // 子节点更新
    const oldIndex = current.index
    if (oldIndex < lastPlacedIndex) {
      // 移动
      newFiber.flags |= Placement
      return lastPlacedIndex
    } else {
      return oldIndex
    }
  } else {
    return lastPlacedIndex
  }
}

function deleteRemainingChildren(returnFiber, currentFirstChild) {
  let childToDelete = currentFirstChild
  while (childToDelete) {
    deleteChild(returnFiber, childToDelete)
    childToDelete = childToDelete.sibling
  }
}

function sameNode(a, b) {
  return a && b && a.type === b.type && a.key === b.key
}

function deleteChild(returnFiber, childToDelete) {
  const deletions = returnFiber.deletions
  if (deletions) {
    returnFiber.deletions.push(childToDelete)
  } else {
    returnFiber.deletions = [childToDelete]
  }
}
