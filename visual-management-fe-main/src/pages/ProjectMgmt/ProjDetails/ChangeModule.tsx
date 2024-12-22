import { Tag } from "antd";

const ChangeModule = ({changeFlag} : {changeFlag:boolean | null | undefined}) => {
  if (changeFlag === false) {
    return(
        <>
          <Tag color="success" style={{marginLeft: '10px'}}>Changes saved</Tag>
        </>
    )
  } else if (changeFlag === true) {
    return(
      <>
        <Tag color="error" style={{marginLeft: '10px'}}>Unsaved changes</Tag>
      </>
    )
  } else {
    return (
      <></>
    )
  }
}

export default ChangeModule