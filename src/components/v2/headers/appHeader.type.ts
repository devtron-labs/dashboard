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

export interface EAHeaderComponentType{
  title: string
  redirectURL: string
  appType: string
}