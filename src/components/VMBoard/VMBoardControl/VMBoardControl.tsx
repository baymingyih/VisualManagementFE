import { CalendarOutlined, CaretDownOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, message, Modal, Radio, Segmented, Space, Typography } from "antd";
import _ from "lodash";
import { IMetric } from "./../../../types/metric";
import moment from "moment";
import { ITeam } from "./../../../types/team";
import { selectAllMetrics, updateMetric } from "../../../../redux/features/metrics/metricsSlice";
import { useSelector, useDispatch } from "react-redux";
import {
    takeMetricSnapshot,
    restoreMetricSnapshot,
    commitMetricSnapshot,
    deleteMetricById,
} from "../../../../redux/features/metrics/metricsSlice";
import {
    toggleBoardInViewMode,
    getBoardInViewMode,
    getFilterDate,
    getFilterOption,
    setSelectedFilterDate,
    getTeams,
    getSelectedTeam,
    setSelectedTeam,
    setTeam,
    toggleCreateMetricFormIsOpen,
    toggleCreateActionFormIsOpen,
} from "../../../../redux/features/ui/uiSlice";
import { FilterEnum } from "../../../types/filterEnum";
import { setFilterOption } from "../../../../redux/features/ui/uiSlice";
import { useMutation } from "@tanstack/react-query";
import {
    deleteMetric,
    updateMetric as updateMetricAPI,
    updateMetricCategory,
} from "@/pages/api/MetricAPI";
import {
    commitColumnSnapshot,
    restoreColumnSnapshot,
    selectAllColumns,
    takeColumnSnapshot,
    updateMetricColumn,
} from "../../../../redux/features/columns/columnsSlice";
import { IColumn } from "@/types/column";

const { Title } = Typography;

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

function VMBoardControl() {
    const dispatch = useDispatch();

    const metrics: IMetric[] | undefined = useSelector(selectAllMetrics);
    const columns: IColumn[] | undefined = useSelector(selectAllColumns);
    const inViewMode: boolean = useSelector(getBoardInViewMode);
    const selectedFilterDate: string = useSelector(getFilterDate);

    const selectedTeam: ITeam | null = useSelector(getSelectedTeam);

    // const ref = useRef(false)

    const onCreateActionButtonEvent = () => {
        dispatch(toggleCreateActionFormIsOpen());
    };

    const onEditButtonEvent = () => {
        dispatch(toggleBoardInViewMode());
        dispatch(takeMetricSnapshot());
        dispatch(takeColumnSnapshot());
    };

    const onCancelButtonEvent = () => {
        Modal.confirm({
            title: "Are you sure you want to cancel?",
            content: "All changes will be lost",
            onOk: () => {
                dispatch(restoreMetricSnapshot());
                dispatch(restoreColumnSnapshot());
                dispatch(toggleBoardInViewMode());
            },
        });
    };

    const onSaveChangesEvent = () => {
        Modal.confirm({
            title: "Are you sure you want to save changes?",
            content: "All changes will be saved",
            onOk: () => {
                commitStagingMetric();
            },
        });
    };

    const onError = () => {
        message.destroy("saving");
        message.error("Something went wrong");
    };

    const { mutate: mutateMetric } = useMutation({
        mutationKey: ["metrics.updateMetric"],
        mutationFn: (metric: any) => updateMetricAPI(metric),
        onError,
    });

    const { mutate: mutateColumn } = useMutation({
        mutationKey: ["columns.updateColumn"],
        mutationFn: (payload: { id: number; columnId: number; categoryName: string }) =>
            updateMetricCategory(payload),
        onError,
    });

    const { mutate: deleteTeamMetric } = useMutation({
        mutationKey: ["metrics.deleteMetric"],
        mutationFn: (metricInfo: any) => deleteMetric(metricInfo.metricId, metricInfo.teamId),
        onError,
    });

    // const { mutate: deleteTeamMetric } = trpc.useMutation(["metrics.deleteTeamMetric"], {
    //     // onSuccess,
    //     onError,
    // });

    const commitStagingMetric = () => {
        message.loading({ content: "Saving changes...", key: "saving" });

        metrics.forEach((metric: IMetric) => {
            // UPDATE EXISTING METRIC
            if (metric.mutated) {
                mutateMetric({
                    ...metric,
                    teamId: selectedTeam!.id,
                    rowId: metric.metricRowId,
                    metricCat: metric.metricCategoryId,
                });

                dispatch(updateMetric({ ...metric, mutated: false }));
            }

            // DELETE EXISTING METRIC
            if (metric.deleted) {
                deleteTeamMetric({
                    metricId: +metric.metricId,
                    teamId: selectedTeam!.id,
                });
                dispatch(deleteMetricById(+metric.metricId));
            }
        });

        // Update Existing Columns
        columns.forEach((column: IColumn) => {
            if (column.edited) {
                mutateColumn({
                    id: column.id,
                    columnId: column.columnId,
                    categoryName: column.categoryName,
                });

                dispatch(
                    updateMetricColumn({
                        ...column,
                        edited: false,
                    })
                );
            }
        });

        dispatch(commitColumnSnapshot());
        dispatch(commitMetricSnapshot());
        dispatch(toggleBoardInViewMode());

        message.success({ content: "Saved!", key: "saving" });
    };

    const onCreateMetricButtonClicked = () => {
        dispatch(toggleCreateMetricFormIsOpen());
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
        <Space
            direction="horizontal"
            style={{
                width: "100%",
                justifyContent: "space-between",
                padding: "15px 0",
            }}>
            <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                <Title level={2} style={{ margin: 0 }}>
                    Visual Board
                </Title>
                {!inViewMode ? (
                    <>
                        <Button icon={<EditOutlined />} onClick={onEditButtonEvent}>
                            Customise
                        </Button>
                        <Button type="primary" onClick={onCreateActionButtonEvent}>
                            Create Action
                        </Button>
                    </>
                ) : (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginRight: 10 }}
                        onClick={onCreateMetricButtonClicked}>
                        Create Metric
                    </Button>
                )}
            </div>

            <div style={{ display: "flex", flexFlow: "column nowrap", gap: 5 }}>
                {!inViewMode && (
                    <div className="board">
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
                            style={{ width: "fit-content", alignSelf: "flex-end" }}
                        />
                    </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {!inViewMode ? (
                        <>
                            <Segmented
                                options={FILTER_OPTIONS.map((option) => option.label)}
                                onResize={undefined}
                                onResizeCapture={undefined}
                                defaultValue={FILTER_OPTIONS[1]?.label}
                                onChange={onFilterOptionChange}
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                style={{
                                    backgroundColor: "#B6B6B6",
                                    color: "white",
                                    marginRight: 10,
                                }}
                                onClick={onCancelButtonEvent}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={onSaveChangesEvent}>
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Space>
    );
}

export default VMBoardControl;
