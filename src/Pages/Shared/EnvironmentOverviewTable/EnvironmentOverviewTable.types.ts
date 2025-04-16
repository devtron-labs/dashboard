/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FunctionComponent, MouseEvent, ReactElement, SVGProps } from 'react'

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

export type EnvironmentOverviewTablePopUpMenuItem =
    | {
          label: string
          Icon?: FunctionComponent<SVGProps<SVGSVGElement>>
          iconType?: 'fill' | 'stroke'
          disabled?: boolean
          onClick?: (event: MouseEvent<HTMLButtonElement>) => void
      }
    | ReactElement

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
