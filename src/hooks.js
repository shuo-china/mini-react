import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { HookLayout, HookPassive, areHookInputsEqual } from './utils'

let currentlyRenderingFiber = null
let workInProgressHook = null
let currentHook = null

export function renderWithHooks(wip) {
  currentlyRenderingFiber = wip
  currentlyRenderingFiber.memorizedState = null
  workInProgressHook = null
  currentlyRenderingFiber.updateQueueEffect = []
  currentlyRenderingFiber.updateQueueLayout = []
}

function updateWorkInProgressHook() {
  let hook

  const current = currentlyRenderingFiber.alternate
  if (current) {
    // 更新
    currentlyRenderingFiber.memorizedState = current.memorizedState
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next
      currentHook = currentHook.next
    } else {
      // hook0
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState
      currentHook = current.memorizedState
    }
  } else {
    currentHook = null
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

function updateEffectImp(hooksFlags, create, deps) {
  const hook = updateWorkInProgressHook()

  if (currentHook) {
    const prevEffect = currentHook.memorizedState
    if (deps) {
      const prevDeps = prevEffect.deps
      if (areHookInputsEqual(deps, prevDeps)) {
        return
      }
    }
  }

  const effect = {
    hooksFlags,
    create,
    deps
  }

  hook.memorizedState = effect

  if (hooksFlags & HookPassive) {
    currentlyRenderingFiber.updateQueueEffect.push(effect)
  } else if (hooksFlags & HookLayout) {
    currentlyRenderingFiber.updateQueueLayout.push(effect)
  }
}

export function useEffect(create, deps) {
  return updateEffectImp(HookPassive, create, deps)
}

export function useLayoutEffect(create, deps) {
  return updateEffectImp(HookLayout, create, deps)
}
