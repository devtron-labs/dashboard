import moment from 'moment'

import {
    AppStatus,
    DATE_TIME_FORMATS,
    FiltersTypeEnum,
    handleUTCTime,
    TableCellComponentProps,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { AppListSortableKeys } from '../list-new/AppListType'
import { APP_LIST_HEADERS } from '../list-new/Constants'
import { App, Environment } from './types'

export const CellComponent = ({
    field,
    row: { data },
    isExpandedRow,
    isRowInExpandState,
}: TableCellComponentProps<App | Environment, FiltersTypeEnum.URL>) => {
    if (isRowInExpandState) {
        return null
    }

    const app = data as App
    const env = data as Environment

    if (field === APP_LIST_HEADERS.AppStatus) {
        return (
            <div className="flex left" data-testid="devtron-app-status">
                <AppStatus
                    status={isExpandedRow ? env.status : app.defaultEnv.appStatus}
                    isVirtualEnv={isExpandedRow ? env.isVirtualEnvironment : app.defaultEnv.isVirtualEnvironment}
                />
            </div>
        )
    }

    if (field === APP_LIST_HEADERS.Cluster) {
        const clusterName = isExpandedRow ? env.clusterName : app.defaultEnv?.clusterName ?? ''

        return (
            <div className="flex left">
                <p data-testid={`${clusterName}-cluster`} className="dc__truncate-text  m-0">
                    {clusterName}
                </p>
            </div>
        )
    }

    if (field === APP_LIST_HEADERS.Namespace) {
        const namespace = isExpandedRow ? env.namespace : app.defaultEnv?.namespace ?? ''
        return (
            <div className="flex left">
                <p data-testid={`${namespace}-namespace`} className="dc__truncate-text  m-0">
                    {namespace}
                </p>
            </div>
        )
    }

    if (field === AppListSortableKeys.LAST_DEPLOYED) {
        const lastDeployedTime = isExpandedRow ? env.lastDeployedTime : app.defaultEnv.lastDeployedTime

        return (
            <div className="flex left">
                {lastDeployedTime && (
                    <Tooltip
                        alwaysShowTippyOnHover
                        content={moment(lastDeployedTime).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT)}
                    >
                        <p className="dc__truncate-text  m-0" data-testid="last-deployed-time">
                            {handleUTCTime(lastDeployedTime, true)}
                        </p>
                    </Tooltip>
                )}
            </div>
        )
    }

    return null
}
