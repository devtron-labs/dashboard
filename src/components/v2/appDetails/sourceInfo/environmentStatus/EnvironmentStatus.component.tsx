import React, { useState } from 'react'
import AppStatusDetailModal from './AppStatusDetailModal'
import './environmentStatus.scss'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'
import { ReactComponent as Alert } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as File } from '../../../../../assets/icons/ic-file.svg'
import IndexStore from '../../index.store'
import moment from 'moment'
import { URLS } from '../../../../../config'
import { AppType } from '../../../appDetails/appDetails.type'
import { useSharedState } from '../../../utils/useSharedState'
import { Link } from 'react-router-dom'
import { useRouteMatch, useHistory, useParams } from 'react-router'
import Tippy from '@tippyjs/react'
import NotesDrawer from './NotesDrawer'
import { getInstalledChartNotesDetail } from '../../appDetails.api'
import { useAsync } from '../../../../common'

function EnvironmentStatusComponent({ appStreamData }: { appStreamData: any }) {
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const status = appDetails.resourceTree?.status || ''
    const showHibernationStatusMessage =
        status.toLowerCase() === 'hibernated' || status.toLowerCase() === 'partially hibernated'
    const { path, url } = useRouteMatch()
    const history = useHistory()
    const params = useParams<{ appId: string; envId: string }>()
    const [, notesResult] = useAsync(() => getInstalledChartNotesDetail(+params.appId, +params.envId), [])
    const onClickUpgrade = () => {
        let _url = `${url.split('/').slice(0, -1).join('/')}/${URLS.APP_VALUES}`
        history.push(_url)
    }

    const notes = appDetails.notes || notesResult?.result?.gitOpsNotes;
    
    const handleShowAppStatusDetail = () => {
        setShowAppStatusDetail(true)
    }

    return (
        <div>
            <div className="flex left ml-20 mb-16">
                {status && (
                    <div className="app-status-card bcn-0 mr-12 br-8 p-16 cursor" onClick={handleShowAppStatusDetail}>
                        <div className="lh-1-33 cn-9 flex left">
                            <span>Application status</span>
                            <Tippy
                                className="default-tt cursor"
                                arrow={false}
                                content={'The health status of your app'}
                            >
                                <Question className="cursor icon-dim-16 ml-4" />
                            </Tippy>
                        </div>

                        <div className={`f-${status.toLowerCase()} dc__capitalize fw-6 fs-14 flex left`}>
                            <span>{status}</span>
                            <figure
                                className={`${
                                    showHibernationStatusMessage ? 'hibernating' : status.toLowerCase()
                                } dc__app-summary__icon ml-8 icon-dim-20`}
                            ></figure>
                        </div>
                        <div>
                            <span className="details-hover cb-5 fw-6">Details</span>
                        </div>
                    </div>
                )}

                {appDetails?.appType == AppType.EXTERNAL_HELM_CHART && (
                    <div className="app-status-card bcn-0 mr-12 br-8 p-16">
                        <div className="lh-1-33 cn-9 flex left">
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
                        <div className="lh-1-33 cn-9 flex left">
                            <span>{appDetails.additionalData['message']}</span>
                        </div>
                    </div>
                )}

                {appDetails?.lastDeployedTime && (
                    <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left">
                            <span>Last updated</span>
                            <Tippy
                                className="default-tt cursor"
                                arrow={false}
                                content={'When was this app last updated'}
                            >
                                <Question className="cursor icon-dim-16 ml-4" />
                            </Tippy>
                        </div>
                        <div className=" fw-6 fs-14">
                            {moment(appDetails?.lastDeployedTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()}
                        </div>
                        {appDetails?.lastDeployedBy && appDetails?.lastDeployedBy}
                        {appDetails.appType == AppType.EXTERNAL_HELM_CHART && (
                            <div>
                                <Link
                                    className="cb-5 fw-6"
                                    to={`${URLS.APP}/${URLS.EXTERNAL_APPS}/${appDetails.appId}/${appDetails.appName}/${URLS.APP_DEPLOYMNENT_HISTORY}`}
                                >
                                    Details
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {appDetails?.appStoreAppName && (
                    <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left">
                            <span>Chart used</span>
                            <Tippy
                                className="default-tt cursor"
                                arrow={false}
                                content={'Chart used to deploy to this application'}
                            >
                                <Question className="cursor icon-dim-16 ml-4" />
                            </Tippy>
                        </div>
                        <div className=" fw-6 fs-14">
                            {appDetails.appStoreChartName && <span>{appDetails.appStoreChartName}/</span>}
                            {appDetails.appStoreAppName}({appDetails.appStoreAppVersion})
                        </div>
                        <div className="flex left">
                            {notes && (
                                <div className="details-hover flex cb-5 fw-6 cursor" onClick={() => setShowNotes(true)}>
                                    <File className="app-notes__icon icon-dim-16 mr-4" /> Notes.txt
                                </div>
                            )}
                            {!!notes && !!appDetails.appStoreChartId && <div className="app-status-card__divider" />}
                            {appDetails.appStoreChartId && (
                                <div>
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
                )}

                {appDetails?.deprecated && (
                    <div className="app-status-card er-2 bw-1 bcr-1 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left">
                            <span>Chart deprecated</span>
                            <Alert className="icon-dim-16 ml-4" />
                        </div>
                        <div className=" fw-6 fs-14">Upgrade required</div>
                        <div onClick={onClickUpgrade} className="cursor cb-5 fw-6">
                            Upgrade chart
                        </div>
                    </div>
                )}
            </div>

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
