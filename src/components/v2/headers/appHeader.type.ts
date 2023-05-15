export interface OptionType {
    label: string;
    value: string;
}

export interface LabelTags {
    tags: OptionType[];
    inputTagValue: string;
    tagError: string;
}

export interface ChartHeaderComponentType{
  errorResponseCode?: number
}