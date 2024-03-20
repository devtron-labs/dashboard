import React from 'react'
import Tippy from '@tippyjs/react'
import { DockerImageDetailsProps } from './chartDeploymentHistory.service'
import { ReactComponent as DockerIcon } from '../../../assets/icons/misc/docker.svg'

const DockerImageDetails = ({ deployment, setShowDockerInfo }: DockerImageDetailsProps) => {
    const handleOnClick = () => {
        setShowDockerInfo(true)
    }
    return (
        <>
            {deployment.dockerImages.slice(0, 3).map((dockerImage) => {
                return (
                    <div key={dockerImage} className="dc__app-commit__hash ml-10">
                        <Tippy arrow className="default-tt" content={dockerImage}>
                            <span className="flex">
                                <DockerIcon className="commit-hash__icon grayscale" />
                                <span className="pl-3" data-testid="docker-version-deployment-history">
                                    {dockerImage.split(':')[1] || dockerImage}
                                </span>
                            </span>
                        </Tippy>
                    </div>
                )
            })}
            {deployment.dockerImages.length > 3 && (
                <button type="button" onClick={handleOnClick} className="cursor anchor ml-10">
                    <span>
                        <span>{deployment.dockerImages.length - 3}</span>
                        <span className="pl-3">more</span>
                    </span>
                </button>
            )}
        </>
    )
}

export default DockerImageDetails
