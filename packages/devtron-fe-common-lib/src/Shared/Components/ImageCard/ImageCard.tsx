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

import { ImageTagsContainer } from '../../../Common'
import { ArtifactInfo } from './ArtifactInfo'
import { SequentialCDCardTitle } from './SequentialCDCardTitle'
import { ImageCardProps } from './types'

const ImageCard = ({
    testIdLocator,
    cta,
    sequentialCDCardTitleProps,
    artifactInfoProps,
    imageTagContainerProps,
    children,
    rootClassName = '',
    materialInfoRootClassName = '',
}: ImageCardProps) => (
    <div className={`material-history material-history--cd image-tag-parent-card ${rootClassName || ''}`}>
        <div className="p-12 bcn-0 br-4">
            <div className="dc__content-space flexbox dc__align-start">
                <div className="flexbox-col dc__content-start dc__align-start">
                    <SequentialCDCardTitle {...sequentialCDCardTitleProps} />

                    <div
                        data-testid={`cd-material-history-image-${testIdLocator}`}
                        className={`material-history__top cursor-default ${materialInfoRootClassName || ''}`}
                    >
                        <ArtifactInfo {...artifactInfoProps} />
                    </div>
                </div>

                <div className="material-history__select-text fs-13 w-auto dc__no-text-transform flex right cursor-default">
                    {cta}
                </div>
            </div>

            <div data-testid={`image-tags-container-${testIdLocator}`}>
                <ImageTagsContainer {...imageTagContainerProps} />
            </div>
        </div>

        {children}
    </div>
)

export default ImageCard
