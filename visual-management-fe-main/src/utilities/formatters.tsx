import { Avatar, Tooltip } from 'antd'
import { TooltipPlacement } from 'antd/lib/tooltip'
import type { DatePickerProps } from 'antd';

export const getAvatarLabel = (name: string, color: string, size: number, gap: number, position: TooltipPlacement | null, marginRight: number) => {
  if (color!==""){
    if (position!==null){
      return (
        <>
          <Tooltip title={name} placement={position}>
            <Avatar style={{ backgroundColor: color, verticalAlign: 'middle', marginRight: marginRight }} gap={gap} size={size}>
              {name.split(" ").map(word => word[0]).join("").slice(0,2)}
            </Avatar>
          </Tooltip>
        </>
      )
    } else {
      return (
        <>
          <Avatar style={{ backgroundColor: color, verticalAlign: 'middle', marginRight: marginRight }} gap={gap} size={size}>
              {name.split(" ").map(word => word[0]).join("").slice(0,2)}
          </Avatar>
        </>
      )
    }
  } else {
    return (
      <>
        <div style={{height: size}}></div>
      </>
    )
  }
}

export const customDateFormat: DatePickerProps['format'] = value =>
  `${value.format('DD-MMM-YYYY')}`.toUpperCase();