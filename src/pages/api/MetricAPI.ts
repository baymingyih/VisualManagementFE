import axios from "axios";
import { DbMetric, IMetric } from "../../types/metric";

export const getMetricsByTeam = async (teamId: number) => {
    return await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/metrics?teamId=${teamId}`);
};

export const getMetricCategoriesByTeam = async (teamId: number) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/metrics/categories?teamId=${teamId}`
    );
};

export const createSimpleMetric = async (metric: any) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/metrics/simple`, metric);
};

export const updateMetric = async (metric: any) => {
    return await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/metrics/${metric.metricId}`,
        metric
    );
};

export const updateMetricCategory = async ({
    id,
    columnId,
    categoryName,
}: {
    id: number;
    columnId: number;
    categoryName: string;
}) => {
    return await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/metrics/categories/${id}`, {
        columnId: columnId,
        categoryName: categoryName,
    });
};

export const deleteMetric = async (metricId: number, teamId: number) => {
    return await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/metrics/${metricId}?teamId=${teamId}`
    );
};
