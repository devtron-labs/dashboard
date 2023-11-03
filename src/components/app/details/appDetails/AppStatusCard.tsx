import React from 'react'
import Tippy from '@tippyjs/react'
import ReactGA from 'react-ga4'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { AppStatusCardType } from './appDetails.type'
import { DeploymentAppTypes, noop } from '@devtron-labs/devtron-fe-common-lib'

const AppStatusCard = ({ appDetails, status, loadingResourceTree, setDetailed, message }: AppStatusCardType) => {
    const isHibernated = ['hibernating', 'hibernated'].includes(status.toLowerCase())

    const showApplicationDetailedModal = (): void => {
        setDetailed && setDetailed(true)
        ReactGA.event({
            category: 'App Details',
            action: 'App Status clicked',
        })
    }

    return (
        <div
            data-testid="app-status-card"
            onClick={loadingResourceTree ? noop : showApplicationDetailedModal}
            className="pointer flex left bcn-0 p-16 br-8 mw-340 mr-12 lh-20"
        >
            <div className="mw-48 mh-48 bcn-1 flex br-4 mr-16">
                {loadingResourceTree ? (
                    <div className="icon-dim-32 shimmer-loading" />
                ) : (
                    <figure
                        className={`${status.toLowerCase()} dc__app-summary__icon mr-8 h-32 w-32`}
                        style={{ margin: 'auto', backgroundSize: 'contain, contain' }}
                    ></figure>
                )}
            </div>
            <div className="flex left column">
                <div className="flexbox">
                    <span className="fs-12 mr-5 fw-4 cn-9">Application status</span>

                    <Tippy className="default-tt" arrow={false} placement="top" content="The health status of your app">
                        <Question className="icon-dim-16 mt-2" />
                    </Tippy>
                </div>
                {loadingResourceTree ? (
                    <div className="flex left column mt-6">
                        <div className="shimmer-loading w-120 h-16 br-2 mb-6" />
                        <div className="shimmer-loading w-54 h-12 br-2" />
                    </div>
                ) : (
                    <>
                        <div
                            data-testid="app-status-name"
                            className={`app-summary__status-name fs-14 mr-8 fw-6 f-${status.toLowerCase()}`}
                        >
                            {isHibernated ? 'Hibernating' : status}
                        </div>
                        <div className="flex left">
                            {appDetails?.deploymentAppType === DeploymentAppTypes.HELM ? (
                                <span data-testid="app-status-card-details" className="cb-5 fw-6">
                                    Details
                                </span>
                            ) : (
                                <>
                                    {message && <span className="select-material-message">{message.slice(0, 30)}</span>}
                                    <span
                                        data-testid="app-status-card-details"
                                        className={`${message?.length > 30 ? 'more-message' : ''} cb-5 fw-6`}
                                    >
                                        Details
                                    </span>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AppStatusCard
