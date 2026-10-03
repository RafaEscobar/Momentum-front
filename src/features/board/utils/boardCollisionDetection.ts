import { closestCorners, pointerWithin, rectIntersection } from '@dnd-kit/core'
import type { Collision, CollisionDetection } from '@dnd-kit/core'

function collisionsOfType(
  collisions: Collision[],
  type: 'task' | 'column',
  containers: Parameters<CollisionDetection>[0]['droppableContainers'],
) {
  return collisions.filter((collision) =>
    containers.find((container) => container.id === collision.id)?.data.current?.type === type,
  )
}

export const boardCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  const pointerTasks = collisionsOfType(
    pointerCollisions,
    'task',
    args.droppableContainers,
  )

  if (pointerTasks.length > 0) {
    return pointerTasks
  }

  const pointerColumns = collisionsOfType(
    pointerCollisions,
    'column',
    args.droppableContainers,
  )

  if (pointerColumns.length > 0) {
    return pointerColumns
  }

  const intersections = rectIntersection(args)
  const intersectingTasks = collisionsOfType(
    intersections,
    'task',
    args.droppableContainers,
  )

  if (intersectingTasks.length > 0) {
    return intersectingTasks
  }

  const intersectingColumns = collisionsOfType(
    intersections,
    'column',
    args.droppableContainers,
  )

  if (intersectingColumns.length > 0) {
    return intersectingColumns
  }

  // Keyboard dragging has no pointer coordinates and needs a proximity fallback.
  return args.pointerCoordinates ? [] : closestCorners(args)
}
