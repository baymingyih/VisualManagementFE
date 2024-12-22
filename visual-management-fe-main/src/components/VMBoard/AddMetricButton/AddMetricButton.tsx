import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import styles from './AddMetricButton.module.css'
import { useSelector } from 'react-redux'
import { getBoardInViewMode } from '../../../../redux/features/ui/uiSlice'

function AddMetricButton({ onButtonClick }: IAddMetricButtonProps) {
  const isViewMode: boolean = useSelector((state: any) =>
    getBoardInViewMode(state)
  )

  return (
    isViewMode && (
      <div className={styles.add_button_wrapper}>
        <Button
          type='link'
          onClick={onButtonClick}
          icon={<PlusOutlined style={{ stroke: '#1890ff', strokeWidth: 20 }} />}
          className={styles.add_button}
        ></Button>
      </div>
    )
  )
}

interface IAddMetricButtonProps {
  onButtonClick: () => void
}

export default AddMetricButton
