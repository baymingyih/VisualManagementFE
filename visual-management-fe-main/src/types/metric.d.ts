export interface IMetric {
  metricId: number | string;
  metricRowId: number;
  metricCategoryId: number;
  metricName: string;
  targetType: TargetType;
  trackingFrequency: TrackingFrequency;
  mutated: boolean | false;
  deleted: boolean | false;
  creator: number;
  metric_single_target?: number;
  defaultView: number;
  metric_single_target_above: number;
}

export interface DbMetric {
  metricId: number | string;
  metricRowId: number;
  metricCategoryId: number;
  metricName: string;
  targetType: TargetType | null;
  trackingFrequency: TrackingFrequency;
  deleted: boolean | false;
  creator: number;
  metric_single_target?: number;
  defaultView: number;
  metric_single_target_above: number;
}

// TODO: Deconflict...
export interface DBSaveMetric {
  metricCat: number;
  name: string;
  freq: TrackingFrequency;
  value: number;
  defaultView: number;
  above: number;
  teamId: number;
}

export enum TargetType {
  "Simple" = 0,
  "Multiple",
  "Range",
}

export enum TrackingFrequency {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
}

export interface IProjectMetric {
  metricId: number;
  metricName: string;
  key: number;
}
