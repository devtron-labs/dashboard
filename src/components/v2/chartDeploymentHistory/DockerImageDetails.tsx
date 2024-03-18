import React from 'react'
import Tippy from '@tippyjs/react'
import { ChartDeploymentDetail } from './chartDeploymentHistory.service'
import docker from '../../../assets/icons/misc/docker.svg'

const DockerImageDetails = ({
    deployment,
    setShowDockerInfo,
}: {
    deployment: ChartDeploymentDetail
    setShowDockerInfo: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    return (
        <div>
            {deployment.dockerImages.slice(0, 3).map((dockerImage, index) => {
                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className="dc__app-commit__hash ml-10">
                        <Tippy arrow className="default-tt" content={dockerImage}>
                            <span>
                                <img src={docker} className="commit-hash__icon grayscale" alt="" />
                                <span className="ml-3" data-testid="docker-version-deployment-history">
                                    {dockerImage.split(':')[1] || dockerImage}
                                </span>
                            </span>
                        </Tippy>
                    </div>
                )
            })}
            {deployment.dockerImages.length > 3 && (
                <div onClick={() => setShowDockerInfo(true)} className="cursor anchor ml-10">
                    <span>
                        <span className="">{deployment.dockerImages.length - 3}</span>
                        <span className="ml-3">more</span>
                    </span>
                </div>
            )}
        </div>
    )
}

export default DockerImageDetails
