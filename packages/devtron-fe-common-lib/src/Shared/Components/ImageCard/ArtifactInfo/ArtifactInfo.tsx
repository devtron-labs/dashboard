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
import { DefaultUserKey } from '../../../types'
import { ImagePathTippyContentProps } from './types'
import { ArtifactInfoProps } from '../types'
import { ConditionalWrap, getRandomColor } from '../../../../Common/Helper'
import { ReactComponent as DeployIcon } from '../../../../Assets/Icon/ic-nav-rocket.svg'
import { ReactComponent as ICBot } from '../../../../Assets/Icon/ic-bot.svg'

const ImagePathTippyContent = ({ imagePath, registryName }: ImagePathTippyContentProps) => (
    <div>
        <div className="fw-6">{registryName}</div>
        <div>{imagePath}</div>
    </div>
)

const ArtifactInfo = ({
    imagePath,
    registryName,
    registryType,
    image,
    deployedTime,
    deployedBy,
    isRollbackTrigger,
    excludedImagePathNode,
    approvalChecksNode,
    approvalInfoTippy,
}: ArtifactInfoProps) => {
    const renderImagePathTippy = (children) => {
        const content = <ImagePathTippyContent imagePath={imagePath} registryName={registryName} />

        return (
            <Tippy className="default-tt dc__mxw-500" arrow={false} placement="top-start" content={content}>
                {children}
            </Tippy>
        )
    }

    const renderDeployedTime = () => {
        if (!deployedTime) {
            return null
        }

        return (
            <div className="material-history__info flex left fs-13">
                <DeployIcon className="icon-dim-16 scn-6 mr-8" />
                <span className="fs-13 fw-4">{deployedTime}</span>
            </div>
        )
    }

    const renderDeployedBy = () => {
        if (!deployedBy || !isRollbackTrigger) {
            return null
        }

        if (deployedBy === DefaultUserKey.system) {
            return (
                <div className="material-history__deployed-by flex left">
                    <ICBot className="icon-dim-16 mr-6" />
                    <span className="fs-13 fw-4">Auto triggered</span>
                </div>
            )
        }

        return (
            <div className="material-history__deployed-by flex left">
                <span
                    className="flex fs-13 fw-6 lh-18 icon-dim-20 mr-6 cn-0 m-auto dc__border-transparent dc__uppercase dc__border-radius-50-per"
                    style={{
                        backgroundColor: getRandomColor(deployedBy),
                    }}
                >
                    {deployedBy[0]}
                </span>
                <span className="fs-13 fw-4">{deployedBy}</span>
            </div>
        )
    }

    return (
        <>
            <div className="flex left column">
                {excludedImagePathNode ?? (
                    <ConditionalWrap condition={!!imagePath} wrap={renderImagePathTippy}>
                        <div className="commit-hash commit-hash--docker" data-testid="cd-trigger-modal-image-value">
                            <div className={`dc__registry-icon ${registryType} mr-8`} />
                            {image}
                        </div>
                    </ConditionalWrap>
                )}
            </div>

            {approvalInfoTippy}

            {renderDeployedBy()}

            {approvalChecksNode ?? renderDeployedTime()}
        </>
    )
}

export default ArtifactInfo
