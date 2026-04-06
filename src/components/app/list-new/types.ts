export enum AppListFilterLabelOperatorType {
    EQUALS = 'EQUALS',
    DOES_NOT_EQUAL = 'DOES_NOT_EQUAL',
    CONTAINS = 'CONTAINS',
    DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
    EXISTS = 'EXISTS',
    DOES_NOT_EXIST = 'DOES_NOT_EXIST',
}

export type AppListFilterLabelType = {
    key: string
    id: string
} & (
    | {
          operator: AppListFilterLabelOperatorType.EXISTS | AppListFilterLabelOperatorType.DOES_NOT_EXIST
          value?: never
      }
    | {
          operator:
              | AppListFilterLabelOperatorType.EQUALS
              | AppListFilterLabelOperatorType.DOES_NOT_EQUAL
              | AppListFilterLabelOperatorType.CONTAINS
              | AppListFilterLabelOperatorType.DOES_NOT_CONTAIN
          value: string
      }
)

export enum AppListFilterLabelTableHeaderType {
    KEY = 'key',
    OPERATOR = 'operator',
    VALUE = 'value',
}

export interface LabelSelectorFormProps {
    closePopover: () => void
    initialLabels: AppListFilterLabelType[]
    onApply: (selectors: AppListFilterLabelType[]) => void
}
