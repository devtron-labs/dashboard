import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { TAKING_LONGER_TO_CONNECT, TRYING_TO_CONNECT } from '../Constants'
import { ConnectingToClusterStateProps } from '../Types'
import CouldNotConnectImg from '../../../assets/img/app-not-deployed.png'
import { StyledProgressBar } from '../../common/formFields/Widgets/Widgets'
import ResourceFilterOptions from './ResourceFilterOptions'

export default function ConnectingToClusterState({
    loader,
    errorMsg,
    setErrorMsg,
    handleRetry,
    abortController,
    selectedResource,
    resourceList,
    clusterOptions,
    selectedCluster,
    onChangeCluster,
    namespaceOptions,
    selectedNamespace,
    setSelectedNamespace,
    searchText,
    setSearchText,
    searchApplied,
    setSearchApplied,
    handleFilterChanges,
    clearSearch,
}: ConnectingToClusterStateProps) {
    const history = useHistory()
    const [infoText, setInfoText] = useState(TRYING_TO_CONNECT)
    const [showCancel, setShowCancel] = useState(false)

    useEffect(() => {
        if (showCancel) {
            resetStates()
        }

        const timer = setTimeout(() => {
            setInfoText(TAKING_LONGER_TO_CONNECT)
            setShowCancel(true)

            if (timer) {
                clearTimeout(timer)
            }
        }, 10000)
    }, [selectedCluster])

    const renderInfo = (heading: string, infoText: string) => {
        return (
            <>
                <h2 className="fs-16 fw-6 lh-24 mt-20 mb-8 w-300">{heading}</h2>
                <p className="fs-13 fw-4 lh-20 w-300 mb-20">{infoText}</p>
            </>
        )
    }

    const resetStates = () => {
        setInfoText(TRYING_TO_CONNECT)
        setShowCancel(false)
        setErrorMsg('')
    }

    const handleCancelClick = () => {
        resetStates()
        abortController.abort()
        history.goBack()
    }

    const handleRetryClick = (e) => {
        resetStates()
        handleRetry(e)
    }

    return (
        <div
            className="flex column bcn-0"
            style={{
                height: 'calc(100vh - 92px)',
            }}
        >
            <ResourceFilterOptions
                selectedResource={selectedResource}
                clusterOptions={clusterOptions}
                selectedCluster={selectedCluster}
                onChangeCluster={onChangeCluster}
                namespaceOptions={namespaceOptions}
                selectedNamespace={selectedNamespace}
                setSelectedNamespace={setSelectedNamespace}
                hideSearchInput={true}
                searchText={searchText}
                searchApplied={searchApplied}
                resourceList={resourceList}
                setSearchText={setSearchText}
                setSearchApplied={setSearchApplied}
                handleFilterChanges={handleFilterChanges}
                clearSearch={clearSearch}
            />
            <div
                className="flex column dc__text-center bcn-0"
                style={{
                    height: 'calc(100vh - 152px)',
                }}
            >
                {loader && (
                    <>
                        <StyledProgressBar />
                        {renderInfo(`Connecting to ‘${selectedCluster.label}’`, infoText)}
                    </>
                )}
                {!loader && errorMsg && (
                    <>
                        <img src={CouldNotConnectImg} width={250} height={200} alt="not reachable" />
                        {renderInfo(`‘${selectedCluster.label}’ is not reachable`, errorMsg)}
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
        </div>
    )
}
