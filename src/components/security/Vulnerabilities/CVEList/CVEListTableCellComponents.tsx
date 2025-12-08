import {
    FiltersTypeEnum,
    getCVEUrlFromCVEName,
    SeverityChip,
    TableCellComponentProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { CVEDetails } from './types'

export const SeverityCellComponent = ({ row }: TableCellComponentProps<CVEDetails, FiltersTypeEnum.URL, {}>) => {
    const { data } = row
    return (
        <div className="flex left py-10">
            <SeverityChip severity={data.severity} />
        </div>
    )
}

export const CVENameCellComponent = ({ row }: TableCellComponentProps<CVEDetails, FiltersTypeEnum.URL, {}>) => {
    const { data } = row
    return (
        <a className="flex left py-10" href={getCVEUrlFromCVEName(data.cveName)} target="_blank" rel="noreferrer">
            {data.cveName}
        </a>
    )
}
