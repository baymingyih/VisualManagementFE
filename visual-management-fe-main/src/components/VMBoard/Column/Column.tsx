import React from "react";
import { Card, Layout } from "antd";
import _ from "lodash";

import { IMetric } from "../../../types/metric";

import { selectMetricsByCategoryId } from "../../../../redux/features/metrics/metricsSlice";
import { useSelector } from "react-redux";
import ActionCard from "../ActionCard/ActionCard";

import { Droppable } from "react-beautiful-dnd";
import { Content, Header } from "antd/lib/layout/layout";

import styles from "./Column.module.css";
import EditableLabel from "../ActionCard/EditableLabel";
import { useDebounce } from "@/utilities/useDebounce";
import { useDispatch } from "react-redux";
import { updateMetricColumn } from "../../../../redux/features/columns/columnsSlice";
import ActionCardV2 from "../ActionCard/ActionCardV2";

function Column({ id, category, columnId, isLastColumn }: IColumnProps) {
    const dispatch = useDispatch();

    const metrics: IMetric[] | undefined = useSelector((state: any) =>
        selectMetricsByCategoryId(state, id)
    );

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(
            updateMetricColumn({
                id: id,
                columnId: columnId,
                categoryName: e.target.value,
            })
        );
    };

    return (
        <Droppable key={id} droppableId={`${id}`}>
            {(provided) => (
                <Layout
                    ref={provided.innerRef}
                    className={styles.column}
                    style={{
                        height: "100%",
                        minWidth: "20%",
                }}>
                    <Header
                        style={{
                            backgroundColor: "inherit",
                            position: "relative",
                            display: "flex",
                            flexFlow: "column nowrap",
                            justifyContent: "center",
                        }}>
                        <EditableLabel editable text={category} onChange={onInputChange} />
                        <div
                            style={{
                                backgroundColor: "#1890ff",
                                height: 3,
                                position: "absolute",
                                bottom: 0,
                                left: 10,
                                right: 10,
                            }}></div>
                    </Header>
                    <Content
                        style={{
                            marginTop: 10,
                            marginBottom: 10,
                            padding: "0px 10px",
                            overflowY: "scroll",
                            paddingBottom: "40px",
                        }}
                        className={styles.hiddenScrollbar}>
                        {/* {metrics.map((metric: IMetric, index) => {
                            return (
                                !metric.deleted && (
                                    <div key={+metric.metricId} style={{ margin: "10px 0" }}>
                                        <ActionCardV2 metricId={+metric.metricId} listIndex={index}/>
                                    </div>
                                )
                            );
                        })} */}
                        {metrics.map((metric: IMetric) => {
                            return (
                                !metric.deleted && (
                                    <div key={+metric.metricId} style={{ margin: "10px 0" }}>
                                        <ActionCardV2 metricId={+metric.metricId}/>
                                    </div>
                                )
                            );
                        })}
                        {provided.placeholder}
                    </Content>
                </Layout>
            )}
        </Droppable>
    );
}

interface IColumnProps {
    id: number;
    category: string;
    columnId: number;
    isLastColumn: boolean;
}

export default Column;
