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

import { AppStatus, DATE_TIME_FORMATS, FiltersTypeEnum, handleUTCTime, TableCellProps } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import { LazyImage } from '../../common'
import defaultChartImage from '../../../assets/icons/ic-default-chart.svg'
import { HelmAppListRowType } from './AppListType'

const handleImageError = (e) => {
    const target = e.target as HTMLImageElement
    target.onerror = null
    target.src = defaultChartImage
}

export const HelmAppNameCellComponent = ({ rowData }: TableCellProps<HelmAppListRowType, FiltersTypeEnum.URL>) => {
    const app = rowData.data.detail
    return (
        <>
            <div className="app-list__cell--icon">
                <LazyImage
                    className="dc__chart-grid-item__icon icon-dim-24"
                    src={app.chartAvatar}
                    onError={handleImageError}
                />
            </div>
            <div className="app-list__cell app-list__cell--name flex column left">
                <div className="dc__truncate-text m-0 value cb-5">{app.appName}</div>
                <div className="dc__truncate-text fs-12 m-0">{app.chartName}</div>
            </div>
        </>
    )
}

export const HelmAppStatusCellComponent = ({ rowData }: TableCellProps<HelmAppListRowType, FiltersTypeEnum.URL>) => {
    const app = rowData.data.detail
    return <AppStatus status={app.appStatus} isVirtualEnv={app.environmentDetail.isVirtualEnvironment} />
}

export const HelmAppEnvironmentCellComponent = ({ rowData }: TableCellProps<HelmAppListRowType, FiltersTypeEnum.URL>) => {
    const app = rowData.data.detail
    return (
        <p className="dc__truncate-text m-0" data-testid={`${app.environmentDetail.environmentName}-environment`}>
            {app.environmentDetail.environmentName
                ? app.environmentDetail.environmentName
                : `${app.environmentDetail.clusterName}__${app.environmentDetail.namespace}`}
        </p>
    )
}

export const HelmAppLastDeployedCellComponent = ({ rowData }: TableCellProps<HelmAppListRowType, FiltersTypeEnum.URL>) => {
    const app = rowData.data.detail
    
    if (!app.lastDeployedAt) {
        return null
    }
    
    return (
        <Tippy
            className="default-tt"
            arrow
            placement="top"
            content={moment(app.lastDeployedAt).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
        >
            <p className="dc__truncate-text m-0">{handleUTCTime(app.lastDeployedAt, true)}</p>
        </Tippy>
    )
}
