import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { TAKING_LONGER_TO_CONNECT, TRYING_TO_CONNECT } from '../Constants'
import { ConnectingToClusterStateProps } from '../Types'
import CouldNotConnectImg from '../../../assets/img/app-not-deployed.png'
import { StyledProgressBar } from '../../common/formFields/Widgets/Widgets'

export default function ConnectingToClusterState({
    loader,
    clusterName,
    errorMsg,
    handleRetry,
}: ConnectingToClusterStateProps) {
    const history = useHistory()
    const [infoText, setInfoText] = useState(TRYING_TO_CONNECT)
    const [showCancel, setShowCancel] = useState(false)

    useEffect(() => {
        if (showCancel) {
            setInfoText(TRYING_TO_CONNECT)
            setShowCancel(false)
        }

        const timer = setTimeout(() => {
            setInfoText(TAKING_LONGER_TO_CONNECT)
            setShowCancel(true)

            if (timer) {
                clearTimeout(timer)
            }
        }, 10000)
    }, [clusterName])

    const renderInfo = (heading: string, infoText: string) => {
        return (
            <>
                <h2 className="fs-16 fw-6 lh-24 mt-20 mb-8 w-300">{heading}</h2>
                <p className="fs-13 fw-4 lh-20 w-300 mb-20">{infoText}</p>
            </>
        )
    }

    const handleCancelClick = () => {
        history.goBack()
    }

    const handleRetryClick = (e) => {
        setInfoText(TRYING_TO_CONNECT)
        setShowCancel(false)
        handleRetry(e)
    }

    return (
        <div
            className="flex column bcn-0 dc__text-center"
            style={{
                height: 'calc(100vh - 92px)',
            }}
        >
            {loader && (
                <>
                    <StyledProgressBar />
                    {renderInfo(`Connecting to ‘${clusterName}’`, infoText)}
                </>
            )}
            {!loader && errorMsg && (
                <>
                    <img src={CouldNotConnectImg} width={250} height={200} alt="not reachable" />
                    {renderInfo(`‘${clusterName}’ is not reachable`, errorMsg)}
                    <button className="flex cta h-36" onClick={handleRetryClick}>
                        Retry
                    </button>
                </>
            )}
            {showCancel && !errorMsg && (
                <span className="fs-13 fw-6 lh-20 cr-5 cursor" onClick={handleCancelClick}>
                    Cancel
                </span>
            )}
        </div>
    )
}
