import { addProjectMetric, deleteProjectMetric, getMetricSummary, getProjectMetrics } from "@/pages/api/ProjMgmtAPI";
import { IMetric, IProjectMetric } from "@/types/metric";
import { ITeam } from "@/types/team";
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button, DatePicker, Form, Segmented, Select, SelectProps, Space, Tabs, TabsProps, Tag, Typography, message } from "antd"
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFilterDate, getSelectedTeam, setFilterOption, setSelectedFilterDate } from "../../../../redux/features/ui/uiSlice";
import MetricChart from "@/components/VMBoard/MetricChart/MetricChart";
import { FilterEnum } from "@/types/filterEnum";
import { getMetricsByTeam } from "@/pages/api/MetricAPI";
import { metricLoaded } from "../../../../redux/features/metrics/metricsSlice";

import moment from "moment";
import { customDateFormat } from "@/utilities/formatters";
import _ from "lodash";

const { Text } = Typography;

function ProjectMetrics() {

  const dispatch = useDispatch();

  const router = useRouter();
  const { projId } = router.query;

  const selectedFilterDate: string = useSelector(getFilterDate);
  const selectedTeam: ITeam | null = useSelector(getSelectedTeam)

  const [projMetrics, setProjMetrics] = useState<{ label: JSX.Element, children: JSX.Element, key: string }[]>([])
  const [activeKey, setActiveKey] = useState("");

  const [metricSelect, setMetricSelect] = useState(-1)
  const [metricSummary, setMetricSummary] = useState<Array<{ metricId: number, metricName: string, project_metric_list: Array<number> }>>([])
  const [metricOptions, setMetricOptions] = useState<SelectProps['options']>([])

  const [form1] = Form.useForm()

  const FILTER_OPTIONS = [
    {
      value: FilterEnum.WEEK,
      label: "Week",
    },
    {
      value: FilterEnum.MONTH,
      label: "Month",
    },
    {
      value: FilterEnum.YEAR,
      label: "Year",
    },
  ];

  const { refetch: fetchProjectMetrics } = useQuery({
    queryKey: ["projects_getProjectMetrics", projId],
    queryFn: () => getProjectMetrics(Number(projId)),
    onSuccess: ({ data }: { data: IProjectMetric[] }) => {
      const projectMetrics: { label: JSX.Element, children: JSX.Element, key: string }[] = []
      data.forEach((obj) => {
        projectMetrics.push({
          label: 
          <Text style={{width: '15vw', textAlign: 'left'}} ellipsis>
            T{selectedTeam?.id}-M{obj.metricId} {obj.metricName}
          </Text>,
          children: <><MetricChart metricId={obj.metricId} height={300} /></>,
          key: String(obj.key)
        })
      })
      setProjMetrics(projectMetrics)
      setActiveKey(projectMetrics.length !== 0 ? projectMetrics[0].key : "0")
    },
    onError: () => {
      console.log('Unable to fetch project metrics data')
    },
    enabled: false
  })

  const { refetch: fetchMetricSummary } = useQuery({
    queryKey: ["actions_getMetricSummary", selectedTeam],
    queryFn: () => getMetricSummary(selectedTeam),
    onSuccess: ({ data }: { data: Array<{ metricId: number, metricName: string, project_metric_list: Array<number> }> }) => {
      setMetricSummary(data)
    },
    onError: () => {
      console.log('Unable to fetch action summary data')
    },
    enabled: false
  })

  const { refetch: fetchMetric } = useQuery({
    queryKey: ["metrics_getMetrics"],
    queryFn: () => getMetricsByTeam(selectedTeam.id || 0),
    onSuccess: ({ data }: { data: IMetric[] }) => {
      dispatch(metricLoaded(data));
    },
    enabled: false,
  });

  useEffect(() => {
    fetchProjectMetrics()
    fetchMetric()
    fetchMetricSummary()
  }, [fetchProjectMetrics, fetchMetric, fetchMetricSummary, selectedTeam])

  useEffect(() => {
    const tempMetricOptions: SelectProps['options'] = []
    metricSummary.forEach((obj) => {
      if (!obj.project_metric_list.includes(Number(projId))) {
        tempMetricOptions.push({
          value: obj.metricId,
          label:
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag>T{selectedTeam != null ? selectedTeam.id : null}-M{obj.metricId}</Tag> {obj.metricName}
            </div>
        })
      }
    })
    setMetricOptions(tempMetricOptions)
  }, [metricSummary, projId, selectedTeam])

  const { mutate: addProjMetric } = useMutation({
    mutationFn: (obj: { projectId: number, metricId: number }) => addProjectMetric(obj),
    onSuccess: ({ data }: { data: { id: number, metricName: string } }) => {
      setProjMetrics([...projMetrics, { label: <>T{selectedTeam?.id}-M{data.id} {data.metricName}</>, children: <MetricChart metricId={data.id} height={250} />, key: String(data.id) }]);
      setActiveKey(String(data.id));

      setMetricOptions(metricOptions!.filter(function (obj) {
        return obj.value !== data.id
      }))

      message.success('Project metric added successfully')
    },
    onError: () => {
      console.log('Unable to add project metric')
    }
  })

  const { mutate: removeProjMetric } = useMutation({
    mutationFn: (obj: { projectId: number, metricId: number }) => deleteProjectMetric(obj),
    onSuccess: ({ data }: { data: { id: number, metricName: string } }) => {
      const newData = projMetrics.filter(function (obj) {
        return obj.key !== String(data.id)
      })
      setProjMetrics(newData)
      if (newData.length && String(data.id) === activeKey) {
        const { key } = newData[newData.length - 1];
        setActiveKey(key);
      }

      setMetricOptions((prev) => [{
        value: data.id,
        label:
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tag>T{selectedTeam != null ? selectedTeam.id : null}-M{data.id}</Tag> {data.metricName}
          </div>
      }, ...metricOptions!])

      message.success('Project metric removed successfully')
    },
    onError: () => {
      console.log('Unable to remove project metric')
    }
  })

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const onFinishAdd = () => {
    if (metricSelect === -1) {
      message.info({
        content: 'Please select a metric to add',
        key: 'addMetric'
      })
    } else {
      addProjMetric({
        projectId: Number(projId),
        metricId: metricSelect
      })
      setMetricSelect(-1)
      form1.resetFields()
    }
  }

  const remove = (targetKey: string) => {
    removeProjMetric({
      projectId: Number(projId),
      metricId: Number(targetKey)
    })
  };

  const onEdit = (e: any, action: 'add' | 'remove') => {
    if (action === 'add') {
      onFinishAdd();
    } else {
      remove(e);
    }
  };

  const onFilterDateChange = (date: moment.Moment | null) => {
    if (date) {
      dispatch(setSelectedFilterDate(date.format("YYYY-MM-DD")));
    }
  };

  const onFilterOptionChange = (e: any) => {
    const option = _.find(FILTER_OPTIONS, (o) => o.label === e);

    if (option) {
      dispatch(setFilterOption(option.value));
    }
  };

  return (
    <>
      <Space
        direction="horizontal"
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}>
        <Form layout='horizontal' form={form1} onFinish={onFinishAdd} style={{ display: 'flex', alignItems: 'center' }}>
          <Form.Item
            name='Metric'
            label={'Metric'}
            rules={[{ required: true, message: '' }]}
            noStyle={true}
          >
            <Select
              placeholder='Please select metric to track'
              options={metricOptions}
              onChange={(e) => setMetricSelect(e)}
              style={{ width: '20vw' }}
            />
          </Form.Item>
          <Button
            htmlType='submit'
            style={{ marginLeft: '10px' }}
          >
            Add
          </Button>
        </Form>
        {projMetrics.length !== 0 && <div>
          <DatePicker
            allowClear={false}
            inputReadOnly
            format={customDateFormat}
            defaultValue={moment(selectedFilterDate)}
            showToday
            onChange={onFilterDateChange}
            style={{ marginRight: '10px', width: '9vw' }}
          />
          <Segmented
            options={FILTER_OPTIONS.map((option) => option.label)}
            defaultValue={FILTER_OPTIONS[1]?.label}
            onChange={onFilterOptionChange}
          />
        </div>}
      </Space>
      <Tabs
        hideAdd
        onEdit={onEdit}
        items={projMetrics}
        type="editable-card"
        onChange={onChange}
        activeKey={activeKey}
        tabPosition="left"
      />
    </>
  )
}

export default ProjectMetrics