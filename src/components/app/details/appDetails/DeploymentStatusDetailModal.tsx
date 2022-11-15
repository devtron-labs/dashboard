import React, { useEffect, useRef } from 'react'
import { Drawer, handleUTCTime } from '../../../common'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import DeploymentStatusDetailBreakdown from './DeploymentStatusBreakdown'
import { DeploymentStatusDetailModalType } from './appDetails.type'
import moment from 'moment'
import { Moment12HourFormat, URLS } from '../../../../config'
import { useHistory, useParams } from 'react-router-dom'

export default function DeploymentStatusDetailModal({
    appName,
    environmentName,
    streamData,
    deploymentStatusDetailsBreakdownData,
}: DeploymentStatusDetailModalType) {
    const history = useHistory()
    const { appId, envId} = useParams<{appId: string , envId: string}>()
    const appStatusDetailRef = useRef<HTMLDivElement>(null)

    const close = () => {
        const newUrl = `${URLS.APP}/${appId}/${URLS.APP_DETAILS}/${envId}`
        history.replace(newUrl)
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape') {
            evt.preventDefault()
            close()
        }
    }
    const outsideClickHandler = (evt): void => {
        if (
            appStatusDetailRef.current &&
            !appStatusDetailRef.current.contains(evt.target)
        ) {
            close()
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
            <div className="deployment-status-breakdown-modal-container bcn-0" ref={appStatusDetailRef}>
                <div className="dc__box-shadow pb-12 pt-12 bcn-0">
                    <div className="title flex dc__content-space pl-20 pr-20 ">
                        <div>
                            <div className="cn-9 fs-16 fw-6">
                                Deployment status: {appName} / {environmentName}
                            </div>
                            <div className="flexbox">
                                <span
                                    className={`app-summary__status-name fs-13 fw-6 f-${deploymentStatusDetailsBreakdownData.deploymentStatus}`}
                                >
                                    {deploymentStatusDetailsBreakdownData.deploymentStatusText}
                                </span>
                                <span className="dc__bullet mr-8 ml-8 mt-10"></span>
                            </div>
                        </div>
                        <span className="cursor" onClick={close}>
                            <Close className="icon-dim-24" />
                        </span>
                    </div>
                </div>
                <div style={{ height: 'calc(100vh - 70px)' }} className="bcn-1 dc__overflow-scroll pb-20">
                    <DeploymentStatusDetailBreakdown
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                        streamData={streamData}
                    />
                </div>
            </div>
        </Drawer>
    )
}
