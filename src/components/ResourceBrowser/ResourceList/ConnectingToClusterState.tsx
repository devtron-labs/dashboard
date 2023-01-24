import React, { useEffect, useRef, useState } from 'react'
import { TAKING_LONGER_TO_CONNECT, TRYING_TO_CONNECT } from '../Constants'
import { ConnectingToClusterStateProps } from '../Types'
import CouldNotConnectImg from '../../../assets/img/app-not-deployed.png'
import { StyledProgressBar } from '../../common/formFields/Widgets/Widgets'

export default function ConnectingToClusterState({ loader, clusterName, errorMsg }: ConnectingToClusterStateProps) {
    const [infoText, setInfoText] = useState(TRYING_TO_CONNECT)
    const progressValueRef = useRef(0)

    useEffect(() => {
        setTimeout(() => {
            setInfoText(TAKING_LONGER_TO_CONNECT)
        }, 10000)
    }, [])

    const renderInfo = (heading: string, infoText: string) => {
        return (
            <>
                <h2 className="fs-16 fw-6 lh-24 mt-20 mb-8 w-300">{heading}</h2>
                <p className="fs-13 fw-4 lh-20 w-300">{infoText}</p>
            </>
        )
    }

    const updateProgressValue = (currentValue) => {
        if (currentValue <= 30) {
            progressValueRef.current = currentValue
        }
    }

    return (
        <div
            className="flex column bcn-0 dc__text-center"
            style={{
                height: 'calc(100vh - 92px)',
            }}
        >
            {loader && !errorMsg && (
                <>
                    <StyledProgressBar updateProgressValue={updateProgressValue} />
                    {renderInfo(`Connecting to ‘${clusterName}’`, infoText)}
                </>
            )}
            {!loader && errorMsg && (
                <>
                    <img src={CouldNotConnectImg} width={250} height={200} alt="not reachable" />
                    {renderInfo(`‘${clusterName}’ is not reachable`, errorMsg)}
                </>
            )}
        </div>
    )
}
