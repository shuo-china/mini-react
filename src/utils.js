// ! flags
export const NoFlags = /*                      */ 0b00000000000000000000

export const Placement = /*                    */ 0b0000000000000000000010 // 2
export const Update = /*                       */ 0b0000000000000000000100 // 4
export const Deletion = /*                     */ 0b0000000000000000001000 // 8

export function isStr(s) {
  return typeof s === 'string'
}

export function isStringOrNumber(s) {
  return typeof s === 'string' || typeof s === 'number'
}

export function isFn(fn) {
  return typeof fn === 'function'
}

export function isArray(arr) {
  return Array.isArray(arr)
}

export function isUndefined(s) {
  return s === undefined
}

export function updateNode(node, prevVal, nextVal) {
  Object.entries(prevVal).forEach(([k, v]) => {
    if (k === 'children') {
      if (isStringOrNumber(v)) {
        node.textContent = ''
      }
    } else if (k.startsWith('on')) {
      const eventName = k.slice(2).toLocaleLowerCase()
      node.removeEventListener(eventName, v)
    } else {
      if (!(k in nextVal)) {
        node[k] = ''
      }
    }
  })

  Object.entries(nextVal).forEach(([k, v]) => {
    if (k === 'children') {
      if (isStringOrNumber(v)) {
        node.textContent = v
      }
    } else if (k.startsWith('on')) {
      const eventName = k.slice(2).toLocaleLowerCase()
      node.addEventListener(eventName, v)
    } else {
      node[k] = v
    }
  })
}
