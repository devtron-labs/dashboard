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

import Tippy from '@tippyjs/react'

import { ReactComponent as DockerIcon } from '../../../assets/icons/misc/docker.svg'
import { DockerImageDetailsProps } from './chartDeploymentHistory.service'

const DockerImageDetails = ({ deployment, setShowDockerInfo }: DockerImageDetailsProps) => {
    const handleOnClick = () => {
        setShowDockerInfo(true)
    }
    return (
        <>
            {deployment.dockerImages.slice(0, 3).map((dockerImage) => (
                <div key={dockerImage} className="dc__app-commit__hash">
                    <Tippy arrow className="default-tt" content={dockerImage}>
                        <span className="flex">
                            <DockerIcon className="commit-hash__icon grayscale" />
                            <span className="pl-3" data-testid="docker-version-deployment-history">
                                {dockerImage.split(':')[1] || dockerImage}
                            </span>
                        </span>
                    </Tippy>
                </div>
            ))}
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
