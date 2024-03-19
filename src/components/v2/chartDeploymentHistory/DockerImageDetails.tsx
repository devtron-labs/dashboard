import React from 'react'
import Tippy from '@tippyjs/react'
import { dockerImageDetailsProps } from './chartDeploymentHistory.service'
import { ReactComponent as DockerIcon } from '../../../assets/icons/misc/docker.svg'

const DockerImageDetails = ({ deployment, setShowDockerInfo }: dockerImageDetailsProps) => {
    const handleOnClick = () => {
        setShowDockerInfo(true)
    }
    return (
        <div>
            {deployment.dockerImages.slice(0, 3).map((dockerImage, index) => {
                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className="dc__app-commit__hash ml-10">
                        <Tippy arrow className="default-tt" content={dockerImage}>
                            <span>
                                <DockerIcon className="commit-hash__icon grayscale" />
                                <span className="ml-3" data-testid="docker-version-deployment-history">
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
                        <span className="ml-3">more</span>
                    </span>
                </button>
            )}
        </div>
    )
}

export default DockerImageDetails
