import React, { useState } from 'react'
import { BulkRotatePodsMap, ResourcesMetaDataMap, RestartStatusListDrawerProps } from '../../AppGroup.types'
import { ReactComponent as ArrowRight } from '../../../../assets/icons/misc/arrow-solid-right.svg'
import { APP_DETAILS_TEXT } from './constants'

export const RestartStatusListDrawer = ({ bulkRotatePodsMap }: RestartStatusListDrawerProps) => {
    const [expandedAppIds, setExpandedAppIds] = useState<number[]>([])

    const toggleWorkloadCollapse = (appId?: number) => {
        if (expandedAppIds.includes(appId)) {
            setExpandedAppIds(expandedAppIds.filter((id) => id !== appId))
        } else {
            setExpandedAppIds([...expandedAppIds, appId])
        }
    }

    const renderWorkloadStatusDetails = (appId: number, appName: string, resources: ResourcesMetaDataMap) => {
        if (!expandedAppIds.includes(appId) || appName !== bulkRotatePodsMap[appId].appName) {
            return null
        }
        return (
            <div className="dc__gap-4 pl-8">
                {Object.keys(resources).map((kindName) => {
                    return (
                        <div
                            key={kindName}
                            data-testid="workload-details"
                            className="flex left dc__border-left cursor"
                            onClick={() => toggleWorkloadCollapse(appId)}
                        >
                            <div className="app-group-kind-name-row p-8 flex left w-100 ml-8">{kindName}</div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderWorkloadStatusRow = (resources, _appId) => {
        return Object.keys(resources).map((kindName) => {
            return (
                <div className="dc__gap-4 pl-8">
                    <div
                        key={kindName}
                        data-testid="workload-details"
                        className="flex left dc__border-left cursor"
                        onClick={() => toggleWorkloadCollapse(+_appId)}
                    >
                        <div className="app-group-kind-name-row p-8 flex left w-100 ml-8">{kindName}</div>
                    </div>
                </div>
            )
        })
    }

    const renderWorkloadStatusItems = () => {
        return Object.keys(bulkRotatePodsMap as BulkRotatePodsMap).map((_appId) => {
            return (
                <div className="pl-16 pr-16">
                    <ArrowRight className="icon-dim-16 rotate dc__flip-270 rotate" />
                    <div key={_appId} className="flex dc__content-space pt-12 pb-12 cursor">
                        <div className="flex dc__content-space w-100" onClick={() => toggleWorkloadCollapse(+_appId)}>
                            <span className="fw-6">{bulkRotatePodsMap[_appId].appName}</span>
                            <div className="flex dc__gap-4">
                                {renderWorkloadStatusRow(bulkRotatePodsMap[_appId].resources, _appId)}
                            </div>
                        </div>
                    </div>
                    {renderWorkloadStatusDetails(
                        +_appId,
                        bulkRotatePodsMap[_appId].appName,
                        bulkRotatePodsMap[_appId].resources,
                    )}
                </div>
            )
        })
    }
    const renderWorkloadStatusTableHeader = () => (
        <div className="dc__zi-1 flex dc__content-space pt-8 pb-8 fs-12 fw-6 cn-7 dc__border-bottom-n1 w-100 pl-16 pr-16 pt-8 p-8">
            <div>{APP_DETAILS_TEXT.APPLICATIONS}</div>
            <div>{APP_DETAILS_TEXT.RESTART_STATUS}</div>
            <div>{APP_DETAILS_TEXT.MESSAGE}</div>
        </div>
    )

    return (
        <>
            {renderWorkloadStatusTableHeader()}
            {renderWorkloadStatusItems()}
        </>
    )
}
