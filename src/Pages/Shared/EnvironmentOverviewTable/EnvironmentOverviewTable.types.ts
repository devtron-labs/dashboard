import { FunctionComponent, MouseEvent, SVGProps } from 'react'
import { EnvironmentOverviewTableHeaderKeys } from './EnvironmentOverview.constants'

export interface EnvironmentOverviewTableRowData {
    id: number
    [EnvironmentOverviewTableHeaderKeys.NAME]: string
    [EnvironmentOverviewTableHeaderKeys.STATUS]: string
    [EnvironmentOverviewTableHeaderKeys.DEPLOYMENT_STATUS]: string
    [EnvironmentOverviewTableHeaderKeys.LAST_DEPLOYED_IMAGE]: string
    [EnvironmentOverviewTableHeaderKeys.COMMITS]: string[]
    [EnvironmentOverviewTableHeaderKeys.DEPLOYED_AT]: string
    [EnvironmentOverviewTableHeaderKeys.DEPLOYED_BY]: string
}

export interface EnvironmentOverviewTablePopUpMenuItem {
    label: string
    Icon?: FunctionComponent<SVGProps<SVGSVGElement>>
    iconType?: 'fill' | 'stroke'
    disabled?: boolean
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

export interface EnvironmentOverviewTableRow {
    environment: EnvironmentOverviewTableRowData
    isChecked?: boolean
    onLastDeployedImageClick: (event: MouseEvent<HTMLButtonElement>) => void
    onCommitClick: (event: MouseEvent<HTMLButtonElement>) => void
    deployedAtLink: string
    redirectLink: string
    popUpMenuItems?: EnvironmentOverviewTablePopUpMenuItem[]
}

export interface EnvironmentOverviewTableProps {
    rows: EnvironmentOverviewTableRow[]
    isVirtualEnv?: boolean
    onCheckboxSelect: (id: EnvironmentOverviewTableRowData['id'], isChecked: boolean, isAllChecked: boolean) => void
}
