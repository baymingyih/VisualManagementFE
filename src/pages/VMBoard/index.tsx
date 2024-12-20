import SharedLayout from "@/components/SharedLayout/SharedLayout";
import { ReactElement } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import VMBoardControl from "../../components/VMBoard/VMBoardControl/VMBoardControl";
import Board from "../../components/VMBoard/Board/Board";
import InfiniteModal from "@/components/VMBoard/InfiniteModal/InfiniteModal";
import CreateCountMetricDrawer from "@/components/VMBoard/CreateMetricForm/CreateCountMetricDrawer";
import EditCountMetricDrawer from "@/components/VMBoard/EditMetricForm/EditCountMetricDrawer";
import InfiniteModalV2 from "@/components/VMBoard/InfiniteModal/InfiniteModalV2";
import { useSelector } from "react-redux";
import { getFocusModalIsOpen } from "../../../redux/features/ui/uiSlice";

const FooterStyle = {
    padding: "10px 20px",
    color: "#939393",
    backgroundColor: "#FFF",
};

const ContentStyle = {
    height: "90%",
    width: "100%",
    padding: "0 20px",
    backgroundColor: "#FFF",
};

function VMBoard() {
    const focusModalOpen = useSelector(getFocusModalIsOpen);

    return (
        <DndProvider backend={HTML5Backend}>
            <div
                style={{
                    width: "100%",
                    padding: "0 20px",
                    height: "91%",
                }}>
                <VMBoardControl />
                <Board />
            </div>
            {focusModalOpen && <InfiniteModalV2 />}
            <CreateCountMetricDrawer />
            <EditCountMetricDrawer />
        </DndProvider>
    );
}

VMBoard.getLayout = function getLayout(page: ReactElement) {
    return <SharedLayout style={{ overflowY: "hidden" }}>{page}</SharedLayout>;
};

export default VMBoard;
