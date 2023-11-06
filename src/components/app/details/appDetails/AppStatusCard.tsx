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

    const renderBottomContainer = () => {
        return (
            <>
                {message && appDetails?.deploymentAppType === DeploymentAppTypes.HELM && (
                    <div className="app-details-info-card__bottom-container__message fs-12 fw-4">
                        {message.slice(0, 30)}
                    </div>
                )}
                <div className="app-details-info-card__bottom-container__details fs-12 fw-6">Details</div>
            </>
        )
    }

    return (
        <div
            data-testid="app-status-card"
            onClick={loadingResourceTree ? noop : showApplicationDetailedModal}
            className="app-details-info-card pointer flex left bcn-0 br-8 mr-12 lh-20 w-250"
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5">Application Status</div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="The health status of your app"
                        >
                            <Question className="icon-dim-16 mt-2" />
                        </Tippy>
                    </div>
                    {loadingResourceTree ? (
                        <div className="shimmer-loading w-120 h-16 br-2 mb-6" />
                    ) : (
                        <div className="app-details-info-card__top-container__content__commit-text-wrapper flex fs-12 fw-4">
                            <div className={`fs-13 fw-6 lh-20 f-${status.toLowerCase()}`}>
                                {isHibernated ? 'Hibernating' : status}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex br-4">
                    {loadingResourceTree ? (
                        <div className="icon-dim-32 shimmer-loading" />
                    ) : (
                        <figure
                            className={`${status.toLowerCase()} dc__app-summary__icon h-24 w-24`}
                            style={{ margin: 'auto', backgroundSize: 'contain, contain' }}
                        ></figure>
                    )}
                </div>
            </div>
            <div className="app-details-info-card__bottom-container">
                {loadingResourceTree ? (
                    <div className="flex mt-6">
                        <div className="shimmer-loading w-120 h-16 br-2 mb-6" />
                        <div className="shimmer-loading w-54 h-12 br-2" />
                    </div>
                ) : (
                    renderBottomContainer()
                )}
            </div>
        </div>
    )
}

export default AppStatusCard
