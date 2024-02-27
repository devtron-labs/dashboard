import React from 'react'
import Tippy from '@tippyjs/react'
import ReactGA from 'react-ga4'
import { DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { AppStatusCardType } from './appDetails.type'
import LoadingCard from './LoadingCard'
import './appDetails.scss'

const AppStatusCard = ({ appDetails, status, cardLoading, setDetailed, message }: AppStatusCardType) => {
    const isHibernated = ['hibernating', 'hibernated'].includes(status.toLowerCase())
    const displayMessage = message && appDetails?.deploymentAppType === DeploymentAppTypes.HELM

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
                {displayMessage && (
                    <div className="app-details-info-card__bottom-container__message fs-12 fw-4">
                        {message.slice(0, 30)}
                    </div>
                )}
                <div
                    className={`app-details-info-card__bottom-container__details fs-12 fw-6 ${
                        displayMessage ? 'ml-4' : ''
                    }`}
                >
                    Details
                </div>
            </>
        )
    }

    if (cardLoading) {
        return <LoadingCard wider={displayMessage} />
    }

    return (
        <div
            data-testid="app-status-card"
            onClick={showApplicationDetailedModal}
            className={`app-details-info-card pointer flex left bcn-0 br-8 mr-12 lh-20 ${
                displayMessage ? 'w-250' : 'w-200'
            }`}
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
                            <div className="flex">
                                <Question className="icon-dim-16 mt-2" />
                            </div>
                        </Tippy>
                    </div>
                    <div className="flex fs-12 fw-4">
                        <div className={`fs-13 fw-6 lh-20 f-${status.toLowerCase()}`}>
                            {isHibernated ? 'Hibernating' : status}
                        </div>
                    </div>
                </div>
                <div className="flex br-4">
                    <figure
                        className={`dc__app-summary__icon ${status.toLowerCase()} h-24 w-24`}
                        style={{ margin: 'auto', backgroundSize: 'contain, contain' }}
                    />
                </div>
            </div>
            <div className="app-details-info-card__bottom-container">{renderBottomContainer()}</div>
        </div>
    )
}

export default React.memo(AppStatusCard)
