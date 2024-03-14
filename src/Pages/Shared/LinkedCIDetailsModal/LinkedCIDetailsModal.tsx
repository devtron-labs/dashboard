import React from 'react'
import {
    Drawer,
    InfoColourBar,
    Pagination,
    SearchBar,
    SortableTableHeaderCell,
    SortingOrder,
    getCommonSelectStyle,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { LinkedCIDetailsModalProps } from './types'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'

import AppListData from './constants'

const commonStyles = getCommonSelectStyle()

export interface AppListRowDataType {
    appName: string
    environment: string
    triggerMode: string
    deploymentStatus: string
}

const AppListRow = ({ appName, environment, triggerMode, deploymentStatus }: AppListRowDataType) => {
    return (
        <div className="flexbox pl-20 pr-20 pt-8 pb-8 dc__align-self-stretch dc__align-center dc__gap-16 fs-13 fw-4 dc__content-space">
            <span>{appName}</span>
            <span>{environment}</span>
            <span>{triggerMode}</span>
            <span> {deploymentStatus} </span>
        </div>
    )
}

const AppList = () => {
    return (
        <div className="">
            <div className="flexbox bcn-0 dc__uppercase pl-20 pr-20 pt-6 pb-6 dc__border-bottom dc__align-self-stretch dc__align-center dc__gap-16 fs-12 fw-6 dc__content-space">
                <SortableTableHeaderCell
                    title="Application"
                    sortOrder={SortingOrder.ASC}
                    isSorted={false}
                    triggerSorting={() => {}}
                    disabled={false}
                />
                <span>Deploys To (ENV)</span>
                <span>Trigger Mode</span>
                <span>Last Deployment Status</span>
            </div>
            <div className="flexbox-col bcn-0 dc__overflow-scroll">
                {AppListData.map((appRowData) => (
                    <AppListRow
                        appName={appRowData.appName}
                        environment={appRowData.environment}
                        triggerMode={appRowData.triggerMode}
                        deploymentStatus={appRowData.deploymentStatus}
                    />
                ))}
            </div>
        </div>
    )
}

const LinkedCIDetailsModal = ({ title, linkedAppCount }: LinkedCIDetailsModalProps) => {
    return (
        <Drawer position="right" width="800px">
            <div className="dc__overflow-hidden h-100">
                <div className="bcn-0">
                    <div className="flexbox flex-align-center flex-justify dc__border-bottom pt-12 pr-20 pb-12 pl-20">
                        <h2 className="fs-16 fw-6 lh-1-43 m-0">{title}</h2>
                        <button type="button" className="dc__transparent flex icon-dim-24" aria-label="close-modal">
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <InfoColourBar
                        message={`This build pipeline is linked as image source in ${linkedAppCount} workflows`}
                        classname="info_bar justify-start"
                        Icon={Info}
                    />
                    <div className="flexbox pl-20 pr-20 pt-8 pb-8 dc__gap-8 flex-align-center dc__align-self-stretch">
                        <div className="w-250">
                            <SearchBar />
                        </div>
                        <div className="w-200">
                            <ReactSelect
                                styles={{
                                    ...commonStyles,
                                    control: (base) => ({
                                        ...base,
                                        ...commonStyles.control,
                                        backgroundColor: 'var(--N50)',
                                    }),
                                }}
                            />
                        </div>
                    </div>
                </div>
                <AppList />
                <div className="bcn-0 dc__no-shrink">
                    <Pagination
                        rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                        size={100}
                        offset={1}
                        pageSize={20}
                        changePage={() => {}}
                        changePageSize={() => {}}
                    />
                </div>
            </div>
        </Drawer>
    )
}

export default LinkedCIDetailsModal
