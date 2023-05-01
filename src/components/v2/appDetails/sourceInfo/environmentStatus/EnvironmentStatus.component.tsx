import React, { useState } from 'react'
import AppStatusDetailModal from './AppStatusDetailModal'
import './environmentStatus.scss'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'
import { ReactComponent as Alert } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as File } from '../../../../../assets/icons/ic-file.svg'
import IndexStore from '../../index.store'
import { URLS } from '../../../../../config'
import { AppType } from '../../../appDetails/appDetails.type'
import { useSharedState } from '../../../utils/useSharedState'
import { Link } from 'react-router-dom'
import { useRouteMatch, useHistory, useParams } from 'react-router'
import Tippy from '@tippyjs/react'
import NotesDrawer from './NotesDrawer'
import { getInstalledChartNotesDetail } from '../../appDetails.api'
import DeploymentStatusCard from '../../../../app/details/appDetails/DeploymentStatusCard'
import { DeploymentStatusDetailsBreakdownDataType } from '../../../../app/details/appDetails/appDetails.type'
import { noop, useAsync } from '../../../../common'

function EnvironmentStatusComponent({
    appStreamData,
    loadingDetails,
    loadingResourceTree,
    deploymentStatusDetailsBreakdownData
}: {
    appStreamData: any
    loadingDetails: boolean
    loadingResourceTree: boolean
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
}) {
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const status = appDetails.resourceTree?.status || ''
    const showHibernationStatusMessage =
        status.toLowerCase() === 'hibernated' || status.toLowerCase() === 'partially hibernated'
    const { url } = useRouteMatch()
    const history = useHistory()
    const params = useParams<{ appId: string; envId: string }>()
    const [, notesResult] = useAsync(() => getInstalledChartNotesDetail(+params.appId, +params.envId), [])


    const onClickUpgrade = () => {
        let _url = `${url.split('/').slice(0, -1).join('/')}/${URLS.APP_VALUES}`
        history.push(_url)
    }

    const notes = appDetails.notes || notesResult?.result?.gitOpsNotes

    const handleShowAppStatusDetail = () => {
        setShowAppStatusDetail(true)
    }

    const shimmerLoaderBlocks = () => {
        return (
            <div className="flex left ml-20 mb-16">
                <div className="bcn-0 w-150 mh-92 en-2 bw-1 mr-12 br-8 dc__position-rel">
                    <div className="flex left column mt-6 w-85 ml-16 dc__place-abs-shimmer-center">
                        <div className="shimmer-loading w-80px h-20 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-16 br-2 mb-6" />
                    </div>
                </div>
                <div className="bcn-0 w-150 mh-92 en-2 bw-1 mr-12 br-8 dc__position-rel">
                    <div className="flex left column mt-6 w-85 ml-16 dc__place-abs-shimmer-center">
                        <div className="shimmer-loading w-80px h-20 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-16 br-2 mb-6" />
                    </div>
                </div>
                <div className="bcn-0 w-150 mh-92 en-2 bw-1 mr-12 br-8 dc__position-rel">
                    <div className="flex left column mt-6 w-85 ml-16 dc__place-abs-shimmer-center">
                        <div className="shimmer-loading w-80px h-20 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-16 br-2 mb-6" />
                    </div>
                </div>
            </div>
        )
    }

    const renderStatusBlock = () => {
        return (
            <div
                className="app-status-card bcn-0 mr-12 br-8 p-16 cursor en-2 bw-1"
                onClick={loadingResourceTree ? noop : handleShowAppStatusDetail}
            >
                <div className="cn-9 flex left">
                    <span data-testid="application-status-heading">Application status</span>
                    <Tippy className="default-tt cursor" arrow={false} content={'The health status of your app'}>
                        <Question className="cursor icon-dim-16 ml-4" />
                    </Tippy>
                </div>
                {loadingResourceTree ? (
                    <div className="flex left column mt-6">
                        <div className="shimmer-loading w-80px h-16 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-12 br-2" />
                    </div>
                ) : (
                    <>
                        <div className={`f-${status.toLowerCase()} dc__capitalize fw-6 fs-14 flex left`}>
                            <span data-testid="application-status-app-details">{status}</span>
                            <figure
                                className={`${
                                    showHibernationStatusMessage ? 'hibernating' : status.toLowerCase()
                                } dc__app-summary__icon ml-8 icon-dim-20`}
                            ></figure>
                        </div>
                        <div>
                            <span className="details-hover cb-5 fw-6" data-testid="details-button-app-details">
                                Details
                            </span>
                        </div>
                    </>
                )}
            </div>
        )
    }

    const onClickShowNotes = () => {
        setShowNotes(true)
    }

    const renderHelmConfigApplyStatusBlock = () => {
        return (
            appDetails?.appType == AppType.EXTERNAL_HELM_CHART && (
                <div className="app-status-card bcn-0 mr-12 br-8 p-16 en-2 bw-1">
                    <div className="cn-9 flex left">
                        <span>Config apply status</span>
                        <Tippy
                            className="default-tt cursor"
                            arrow={false}
                            content={'Whether or not your last helm install was successful'}
                        >
                            <Question className="cursor icon-dim-16 ml-4" />
                        </Tippy>
                    </div>
                    <div
                        className={`f-${appDetails.additionalData[
                            'status'
                        ].toLowerCase()} dc__capitalize fw-6 fs-14 flex left`}
                    >
                        <span>{appDetails.additionalData['status']}</span>
                        <figure
                            className={`${appDetails.additionalData[
                                'status'
                            ].toLowerCase()} dc__app-summary__icon ml-8 icon-dim-20`}
                        ></figure>
                    </div>
                    <div className="cn-9 flex left">
                        <span>{appDetails.additionalData['message']}</span>
                    </div>
                </div>
            )
        )
    }


    const renderLastUpdatedBlock = () => {
        return (
            appDetails?.lastDeployedTime && (
              <DeploymentStatusCard
              deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
          />
            )
        )
    }

    const renderChartUsedBlock = () => {
        return (
            appDetails?.appStoreAppName && (
                <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12 en-2 bw-1">
                    <div className="cn-9 flex left">
                        <span data-testid="chart-used-heading">Chart used</span>
                        <Tippy
                            className="default-tt cursor"
                            arrow={false}
                            content={'Chart used to deploy to this application'}
                        >
                            <Question className="cursor icon-dim-16 ml-4" />
                        </Tippy>
                    </div>
                    <div className=" fw-6 fs-14" data-testid="full-chart-name-with-version">
                        {appDetails.appStoreChartName && (
                            <span data-testid="chart-name-value">{appDetails.appStoreChartName}/</span>
                        )}
                        {appDetails.appStoreAppName}({appDetails.appStoreAppVersion})
                    </div>
                    <div className="flex left">
                        {notes && (
                            <div
                                className="details-hover flex cb-5 fw-6 cursor"
                                onClick={onClickShowNotes}
                                data-testid="notes.txt-heading"
                            >
                                <File className="app-notes__icon icon-dim-16 mr-4" /> Notes.txt
                            </div>
                        )}
                        {!!notes && !!appDetails.appStoreChartId && <div className="app-status-card__divider" />}
                        {appDetails.appStoreChartId && (
                            <div data-testid="view-chart-button">
                                <Link
                                    className="cb-5 fw-6"
                                    to={`${URLS.CHARTS}/discover/chart/${appDetails.appStoreChartId}`}
                                >
                                    View Chart
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )
        )
    }

    const renderUpgraderChartBlock = () => {
        return (
            appDetails?.deprecated && (
                <div className="app-status-card er-2 bw-1 bcr-1 br-8 pt-16 pl-16 pb-16 pr-16 mr-12 en-2 bw-1">
                    <div className="cn-9 flex left">
                        <span>Chart deprecated</span>
                        <Alert className="icon-dim-16 ml-4" />
                    </div>
                    <div className=" fw-6 fs-14">Upgrade required</div>
                    <div onClick={onClickUpgrade} className="cursor cb-5 fw-6">
                        Upgrade chart
                    </div>
                </div>
            )
        )
    }

    return (
        <div>
            {loadingDetails ? (
                shimmerLoaderBlocks()
            ) : (
                <div className="flex left ml-20 mb-16 lh-20">
                    {renderStatusBlock()}
                    {renderHelmConfigApplyStatusBlock()}
                    {renderLastUpdatedBlock()}
                    {renderChartUsedBlock()}
                    {renderUpgraderChartBlock()}
                </div>
            )}
            {showAppStatusDetail && (
                <AppStatusDetailModal
                    close={() => {
                        setShowAppStatusDetail(false)
                    }}
                    appStreamData={appStreamData}
                    showAppStatusMessage={showHibernationStatusMessage}
                />
            )}
            {showNotes && (
                <NotesDrawer
                    notes={notes}
                    close={() => {
                        setShowNotes(false)
                    }}
                />
            )}
        </div>
    )
}

export default EnvironmentStatusComponent
