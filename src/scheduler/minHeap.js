// 返回最小堆的堆顶
export function peek(heap) {
  return heap.length === 0 ? null : heap[0]
}

export function push(heap, node) {
  const index = heap.length
  heap.push(node)
  siftUp(heap, node, index)
}

function siftUp(heap, node, index) {
  let i = index
  while (i > 0) {
    const parentIndex = (i - 1) >> 1
    const parent = heap[parentIndex]
    if (compare(parent, node) > 0) {
      heap[parentIndex] = node
      heap[i] = parent
      i = parentIndex
    } else {
      break
    }
  }
}

export function pop(heap) {
  if (heap.length === 0) {
    return null
  }
  const first = heap[0]
  const last = heap.pop()
  if (first !== last) {
    heap[0] = last
    siftDown(heap, last, 0)
  }

  return first
}

function siftDown(heap, node, index) {
  let i = index
  const len = heap.length
  const halfLen = len >> 1
  while (i < halfLen) {
    const leftIndex = 2 * i + 1
    const rightIndex = leftIndex + 1
    const left = heap[leftIndex]
    const right = heap[rightIndex]

    if (compare(left, node) < 0) {
      if (rightIndex < len && compare(right, left) < 0) {
        heap[i] = right
        heap[rightIndex] = node
        i = rightIndex
      } else {
        heap[i] = left
        heap[leftIndex] = node
        i = leftIndex
      }
    } else if (rightIndex < len && compare(right, node) < 0) {
      heap[i] = right
      heap[rightIndex] = node
      i = rightIndex
    } else {
      break
    }
  }
}

function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}
