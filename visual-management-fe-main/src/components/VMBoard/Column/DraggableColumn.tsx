import { useSelector } from "react-redux";
import { selectColumnById } from "../../../../redux/features/columns/columnsSlice";
import { Draggable } from "react-beautiful-dnd";
import Column from "./Column";
import { IColumn } from "../../../types/column";

function DraggableColumn({ id }: IDraggableColumn) {
    const column: IColumn | undefined = useSelector((state: any) => selectColumnById(state, id));

    return column ? (
        <Draggable draggableId={`${id}`} index={column.columnId} isDragDisabled={false}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        width: `20%`,
                        flexShrink: 0,
                        flexBasis: "auto",
                        height: "100%",
                    }}>
                    {/* <Column key={column.id} id={column.id} category={column.categoryName} /> */}
                </div>
            )}
        </Draggable>
    ) : (
        <></>
    );
}

interface IDraggableColumn {
    id: number;
}

export default DraggableColumn;
