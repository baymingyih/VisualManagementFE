import { Draggable } from 'react-beautiful-dnd'

function DraggableItem({ id, index, children }: IDraggableItem) {
  return (
    <Draggable key={id} draggableId={`${id}`} index={id} isDragDisabled={true}>
      {(provided) => (
        <div {...provided.draggableProps} {...provided.dragHandleProps}>
          {children}
        </div>
      )}
    </Draggable>
  )
}

interface IDraggableItem {
  id: number
  index: number
  children: React.ReactNode
}
