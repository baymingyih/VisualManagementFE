import { Button, Card, Carousel, DatePicker, Form, Modal, Segmented, Typography } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./InfiniteModal.module.css";
import { CaretDownOutlined, LeftOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
    getFilterDate,
    getFilterOption,
    getFocusModalIsOpen,
    getSelectedMetric,
    setSelectedFilterDate,
    toggleCreateActionFormIsOpen,
    toggleFocusViewer,
} from "../../../../redux/features/ui/uiSlice";
import MetricChart from "../MetricChart/MetricChart";
import { selectAllMetricsSorted } from "../../../../redux/features/metrics/metricsSlice";
import { IMetric } from "../../../types/metric";
import { v4 as uuidv4 } from "uuid";
import { IColumn } from "../../../types/column";
import { selectAllColumns, selectColumnById } from "../../../../redux/features/columns/columnsSlice";
import moment from "moment";
import { FilterEnum } from "../../../types/filterEnum";
import _ from "lodash";
import AddMetricDataButton from "../AddMetricDataButton/AddMetricDataButton";

const { Text, Title } = Typography;

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

const SlickArrowLeft = ({ ...props }) => (
    <Button
        {...props}
        className={`slick-prev ${styles.no_arrow}`}
        style={{ fontSize: "1em", color: "white" }}
        aria-hidden="true">
        <LeftOutlined />
    </Button>
);

const SlickArrowRight = ({ ...props }) => {
    return (
        <Button
            {...props}
            className={`slick-next ${styles.no_arrow}`}
            style={{ fontSize: "1em", color: "white" }}
            aria-hidden="true">
            <RightOutlined />
        </Button>
    );
};

function InfiniteModal() {
    const filterOption = useSelector(getFilterOption);

    const [filterDataOption, setFilterDataOption] = useState<FilterEnum>(filterOption);
    const dispatch = useDispatch();
    const ref = useRef(null);
    // const [selectedMetricCategory, setSelectedMetricCategory] = useState<number>()
    // const [displayData, setDisplayData] = useState<IMetric[]>()

    const selectedFilterDate: string = useSelector(getFilterDate);
    const focusModalOpen = useSelector(getFocusModalIsOpen);
    const columns: IColumn[] = useSelector(selectAllColumns);

    const onCreateActionButtonClicked = () => {
        dispatch(toggleCreateActionFormIsOpen());
    }

    const selectedMetric: IMetric | null =
        useSelector(getSelectedMetric);

    const categoryName = useMemo(() => {
        const selectedColumn = _.find(columns, { id: selectedMetric?.metricCategoryId });
        return selectedColumn?.categoryName;
    }, [columns, selectedMetric?.metricCategoryId])

    const closeFocusModal = () => {
        dispatch(toggleFocusViewer());
    };

    const onFilterDateChange = (date: moment.Moment | null) => {
        if (date) {
            dispatch(setSelectedFilterDate(date.format("DD-MMM-YYYY")));
        }
    };

    const onFilterOptionChange = (e: any) => {
        const option = _.find(FILTER_OPTIONS, (o) => o.label === e);
        if (option) {
            setFilterDataOption(option.value);
        }
    };


    return (
        <Modal
            open={focusModalOpen}
            onOk={closeFocusModal}
            onCancel={closeFocusModal}
            footer={null}
            title={null}
            bodyStyle={{
                margin: 0,
                padding: 0,
            }}
            centered
            width={1000}
        >
            {selectedMetric && <Card
                key={uuidv4()}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Text
                            style={{
                                fontSize: "0.75rem",
                            }}
                            type="secondary"
                            copyable>
                            {selectedMetric.metricId}
                        </Text>
                        <Button type="default" style={{ marginRight: 10 }} onClick={onCreateActionButtonClicked}>
                            Create Action
                        </Button>
                    </div>
                }>
                <div style={{
                    display: "flex",
                    flexFlow: 'column nowrap',
                    gap: 10
                }}>
                    <div style={{
                        display: "flex",
                        flexFlow: 'row nowrap',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', flexFlow: 'column nowrap', gap: 5 }}>
                            <div style={{ marginTop: 5 }}>
                                <Text type="secondary">{categoryName}</Text>
                                <Title level={4} style={{ marginBottom: 5, marginTop: 0 }}>{selectedMetric.metricName}</Title>
                            </div>
                            <AddMetricDataButton metric={selectedMetric} />
                        </div>


                        <div style={{ display: "flex", flexFlow: 'column nowrap', gap: 5 }}>
                            <div className="modal" style={{ alignSelf: 'flex-end' }}>
                                <DatePicker
                                    allowClear={false}
                                    bordered={false}
                                    className="hoverable"
                                    inputReadOnly
                                    format={(value) => value.format("DD-MMM-YYYY").toUpperCase()}
                                    defaultValue={moment(selectedFilterDate)}
                                    showToday
                                    onChange={onFilterDateChange}
                                    suffixIcon={<Button icon={<CaretDownOutlined />} type="link" />}
                                    style={{ width: 'fit-content', alignSelf: 'flex-end' }}
                                />
                            </div>
                            <Segmented
                                options={FILTER_OPTIONS.map((option) => option.label)}
                                onResize={undefined}
                                onResizeCapture={undefined}
                                value={FILTER_OPTIONS[filterDataOption].label}
                                onChange={onFilterOptionChange}
                                style={{ alignSelf: 'flex-end' }} />
                        </div>
                    </div>
                    <MetricChart metricId={+selectedMetric.metricId} filterOption={filterDataOption} isolated />
                </div>

            </Card >}
        </Modal>
    );
}

export default InfiniteModal;
