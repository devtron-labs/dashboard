/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import CouldNotConnectImg from '../../../assets/img/app-not-deployed.svg'
import { URLS } from '../../../config'
import { StyledProgressBar } from '../../common/formFields/Widgets/Widgets'
import { CONNECTION_TIMEOUT_TIME, TAKING_LONGER_TO_CONNECT, TRYING_TO_CONNECT } from '../Constants'
import { ConnectingToClusterStateProps, URLParams } from '../Types'

const ConnectingToClusterState: React.FC<ConnectingToClusterStateProps> = ({
    loader,
    errorMsg,
    selectedCluster,
    handleRetry,
    requestAbortController,
}) => {
    const { replace } = useHistory()
    const { clusterId } = useParams<URLParams>()
    const [infoText, setInfoText] = useState(TRYING_TO_CONNECT)
    const [showCancel, setShowCancel] = useState(false)
    const [resetProgress, setResetProgress] = useState(false)
    const progressTimerRef = useRef(null)

    const resetStates = () => {
        setInfoText(TRYING_TO_CONNECT)
        setShowCancel(false)
        setResetProgress(!resetProgress)
    }

    const initProgressTimer = () => {
        progressTimerRef.current = setTimeout(() => {
            setInfoText(TAKING_LONGER_TO_CONNECT)
            setShowCancel(true)
        }, CONNECTION_TIMEOUT_TIME)
    }

    useEffect(() => {
        if (selectedCluster) {
            if (showCancel) {
                resetStates()
            } else {
                setResetProgress(!resetProgress)
            }
            initProgressTimer()
        }

        return () => clearTimeout(progressTimerRef.current)
    }, [clusterId, selectedCluster])

    const renderInfo = (heading: string, _infoText: string) => (
        <>
            <h2 className="fs-16 fw-6 lh-24 mt-20 mb-8 w-300" data-testid="cluster_info_getting_loaded">
                {heading}
            </h2>
            <p className="fs-13 fw-4 lh-20 w-300 mb-20">{_infoText}</p>
        </>
    )

    const handleCancelClick = () => {
        requestAbortController?.abort()
        resetStates()
        replace({
            pathname: URLS.RESOURCE_BROWSER,
        })
    }

    const handleRetryClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        resetStates()
        initProgressTimer()
        handleRetry(event)
    }

    const renderSelectionState = () => {
        /* NOTE: should show loading irrespective of errorMsg */
        if (loader) {
            return (
                <>
                    <StyledProgressBar resetProgress={resetProgress} />
                    {renderInfo(`Connecting to ‘${selectedCluster.label}’`, infoText)}
                </>
            )
        }
        if (errorMsg) {
            return (
                <>
                    <img src={CouldNotConnectImg} width={250} height={200} alt="not reachable" />
                    {renderInfo(`‘${selectedCluster.label}’ is not reachable`, errorMsg)}
                    <button type="button" className="flex cta h-36" onClick={handleRetryClick}>
                        Retry
                    </button>
                </>
            )
        }
        return null
    }

    const renderClusterState = () => (
        <div className="flex column dc__text-center">
            {renderSelectionState()}
            {showCancel && !errorMsg && (
                <span className="fs-13 fw-6 lh-20 cr-5 cursor" onClick={handleCancelClick}>
                    Cancel
                </span>
            )}
        </div>
    )

    return <div className="flex column flex-grow-1 bg__primary">{renderClusterState()}</div>
}

export default ConnectingToClusterState
