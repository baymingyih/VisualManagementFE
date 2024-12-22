import { Input, Typography } from "antd";
import { useSelector } from "react-redux";
import { getBoardInViewMode } from "../../../../redux/features/ui/uiSlice";
import styles from "./EditableLabel.module.css";
import { useDebounce } from "@/utilities/useDebounce";

const { Text } = Typography;

function EditableLabel({ editable, text, onChange }: IEditableLabelProps) {
    const boardInViewMode: boolean = useSelector(getBoardInViewMode);

    return boardInViewMode && editable ? (
        <Input style={{ display: "block" }} value={text} onChange={onChange} />
    ) : (
        <div style={{
            textAlign: "center",
            color: "#545454",
            fontWeight: 600,
            fontSize: "1.2rem",
        }}>{text}</div>
    );
}

interface IEditableLabelProps {
    editable: boolean;
    text: string;
    onChange?: any;
}

export default EditableLabel;
