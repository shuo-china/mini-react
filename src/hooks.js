import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

let currentlyRenderingFiber = null
let workInProgressHook = null

export function renderWithHooks(wip) {
  currentlyRenderingFiber = wip
  currentlyRenderingFiber.memorizedState = null
  workInProgressHook = null
}

function updateWorkInProgressHook() {
  let hook

  const current = currentlyRenderingFiber.alternate
  if (current) {
    // 更新
    currentlyRenderingFiber.memorizedState = current.memorizedState
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next
    } else {
      // hook0
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState
    }
  } else {
    // 初次渲染
    hook = {
      memorizedState: null,
      next: null
    }
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook
    } else {
      // hook0
      workInProgressHook = currentlyRenderingFiber.memorizedState = hook
    }
  }

  return hook
}

export function useReducer(reducer, initialState) {
  const hook = updateWorkInProgressHook()

  // 初次渲染
  if (!currentlyRenderingFiber.alternate) {
    hook.memorizedState = initialState
  }

  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    hook,
    reducer
  )

  return [hook.memorizedState, dispatch]
}

function dispatchReducerAction(fiber, hook, reducer, action) {
  hook.memorizedState = reducer ? reducer(hook.memorizedState, action) : action
  fiber.alternate = { ...fiber }
  fiber.sibling = null
  scheduleUpdateOnFiber(fiber)
}

export function useState(initialState) {
  return useReducer(null, initialState)
}
