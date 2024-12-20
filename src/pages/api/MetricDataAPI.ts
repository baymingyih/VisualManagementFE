import { DbChartData } from "@/types/metricChartData";
import axios from "axios";

export const getMetricDataByMonth = async (metricId: number, dateString: string) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/metricData/getByMonth?metricId=${metricId}&dateString=${dateString}`
    );
};

export const getMetricDataByRange = async (
    metricId: number,
    dateStart: string,
    dateEnd: string
) => {
    return await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/metricData/getByRange?metricId=${metricId}&dateStart=${dateStart}&dateEnd=${dateEnd}`
    );
};

export const createMetricData = async (metricData: DbChartData) => {
    return await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/metricData/`, metricData);
};

export const updateMetricData = async (metricData: DbChartData) => {
    return await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/metricData/`, metricData);
};
