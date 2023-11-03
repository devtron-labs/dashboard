import React, { useEffect, useState } from 'react'
import { TAKING_LONGER_TO_CONNECT, TRYING_TO_CONNECT } from '../Constants'
import { ConnectingToClusterStateProps } from '../Types'
import CouldNotConnectImg from '../../../assets/img/app-not-deployed.png'
import { StyledProgressBar } from '../../common/formFields/Widgets/Widgets'
import { useHistory, useParams } from 'react-router-dom'
import { URLS } from '../../../config'

export default function ConnectingToClusterState({
    loader,
    errorMsg,
    setErrorMsg,
    selectedCluster,
    setSelectedCluster,
    handleRetry,
    sideDataAbortController,
}: ConnectingToClusterStateProps) {
    const { replace } = useHistory()
    const { clusterId } = useParams<{ clusterId: string }>()
    const [infoText, setInfoText] = useState(TRYING_TO_CONNECT)
    const [showCancel, setShowCancel] = useState(false)
    const [resetProgress, setResetProgress] = useState(false)
    let progressTimer = null

    useEffect(() => {
        if (selectedCluster) {
            if (showCancel) {
                resetStates()
            } else {
                setResetProgress(!resetProgress)
            }
            initProgressTimer()
        }

        return (): void => {
            if (progressTimer) {
                clearTimeout(progressTimer)
            }
        }
    }, [clusterId, selectedCluster])

    const initProgressTimer = () => {
        if (progressTimer) {
            clearTimeout(progressTimer)
        }

        progressTimer = setTimeout(() => {
            setInfoText(TAKING_LONGER_TO_CONNECT)
            setShowCancel(true)

            if (progressTimer) {
                clearTimeout(progressTimer)
            }
        }, 10000)
    }

    const renderInfo = (heading: string, infoText: string) => {
        return (
            <>
                <h2 className="fs-16 fw-6 lh-24 mt-20 mb-8 w-300" data-testid="cluster_info_getting_loaded">
                    {heading}
                </h2>
                <p className="fs-13 fw-4 lh-20 w-300 mb-20">{infoText}</p>
            </>
        )
    }

    const resetStates = () => {
        setInfoText(TRYING_TO_CONNECT)
        setShowCancel(false)
        setErrorMsg('')
        setResetProgress(!resetProgress)
    }

    const handleCancelClick = () => {
        sideDataAbortController.new.abort()
        sideDataAbortController.prev = sideDataAbortController.new
        resetStates()
        setSelectedCluster(null)
        replace({
            pathname: URLS.RESOURCE_BROWSER,
        })
    }

    const handleRetryClick = (e) => {
        resetStates()
        initProgressTimer()
        handleRetry(e)
    }

    const renderSelectionState = () => {
        if (loader && !errorMsg) {
            return (
                <>
                    <StyledProgressBar resetProgress={resetProgress} />
                    {renderInfo(`Connecting to ‘${selectedCluster.label}’`, infoText)}
                </>
            )
        } else if (errorMsg) {
            return (
                <>
                    <img src={CouldNotConnectImg} width={250} height={200} alt="not reachable" />
                    {renderInfo(`‘${selectedCluster.label}’ is not reachable`, errorMsg)}
                    <button className="flex cta h-36" onClick={handleRetryClick}>
                        Retry
                    </button>
                </>
            )
        }
        return null
    }

    const renderClusterState = () => {
        return (
            <div
                className="flex column dc__text-center"
                style={{
                    height: 'calc(100vh - 152px)',
                }}
            >
                {renderSelectionState()}
                {showCancel && !errorMsg && (
                    <span className="fs-13 fw-6 lh-20 cr-5 cursor" onClick={handleCancelClick}>
                        Cancel
                    </span>
                )}
            </div>
        )
    }

    return (
        <div
            className="flex column bcn-0"
            style={{
                height: 'calc(100vh - 84px)',
            }}
        >
            {renderClusterState()}
        </div>
    )
}
