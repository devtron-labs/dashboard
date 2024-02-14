import React, { useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import DeploymentStatusDetailBreakdown from './DeploymentStatusBreakdown'
import { DeploymentStatusDetailModalType } from './appDetails.type'
import './appDetails.scss'
import { Drawer, Progressing } from '@devtron-labs/devtron-fe-common-lib'

export default function DeploymentStatusDetailModal({
    appName,
    environmentName,
    streamData,
    deploymentStatusDetailsBreakdownData,
    isVirtualEnvironment,
    isLoading,
}: DeploymentStatusDetailModalType) {
    const history = useHistory()
    const appStatusDetailRef = useRef<HTMLDivElement>(null)

    const closeStatusModal = () => {
        history.replace({
            search: '',
        })
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape') {
            evt.preventDefault()
            closeStatusModal()
        }
    }
    const outsideClickHandler = (evt): void => {
        if (appStatusDetailRef.current && !appStatusDetailRef.current.contains(evt.target)) {
            closeStatusModal()
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    return (
        <Drawer position="right" width="1024px">
            <div
                className="deployment-status-breakdown-modal-container bcn-0"
                data-testid="deployment-status-drawer"
                ref={appStatusDetailRef}
            >
                <div className="dc__box-shadow pb-12 pt-12 bcn-0">
                    <div
                        className="title flex dc__content-space pl-20 pr-20 show-shimmer-loading"
                        data-testid="app-status-cross"
                    >
                        <div>
                            <div className="cn-9 fs-16 fw-6 flexbox flex-align-center">
                                Deployment status:&nbsp;
                                {appName ?? <span className="child child-shimmer-loading w-120 h-20 mt-0-imp" />}
                                &nbsp;/&nbsp;
                                {environmentName ?? (
                                    <span className="child child-shimmer-loading w-120 h-20 mt-0-imp" />
                                )}
                            </div>
                            <div className="flexbox">
                                {isLoading ? (
                                    <span className="child child-shimmer-loading w-120 h-20" />
                                ) : (
                                    <span
                                        className={`app-summary__status-name fs-13 fw-6 f-${deploymentStatusDetailsBreakdownData.deploymentStatus}`}
                                    >
                                        {deploymentStatusDetailsBreakdownData.deploymentStatusText}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="cursor" onClick={closeStatusModal}>
                            <Close className="icon-dim-24" />
                        </span>
                    </div>
                </div>
                <div className="bcn-1 dc__overflow-scroll pb-20 deployment-status-breakdown">
                    {isLoading ? (
                        <Progressing />
                    ) : (
                        <DeploymentStatusDetailBreakdown
                            deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                            streamData={streamData}
                            isVirtualEnvironment={isVirtualEnvironment}
                        />
                    )}
                </div>
            </div>
        </Drawer>
    )
}
