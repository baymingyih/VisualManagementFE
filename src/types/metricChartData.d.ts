export interface IMetricChartData {
  metricId: number;
  value?: number;
  comment?: string;
  dateTime: string;
}

export interface IMetricDataGroup {
  metricId: number;
  chartData: IMetricChartData[];
  newDataAdded: boolean;
}

export interface DbChartData {
  metricId: number;
  value: number;
  comment?: string;
  dateString: string;
  updatedBy: number;
  comment_updatedBy?: number;
}
