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

import { ReactNode } from 'react'
import { ImageTaggingContainerType } from '../../../Common'
import { RegistryType } from '../..'

export interface ArtifactInfoProps {
    imagePath: string
    registryName: string
    registryType: RegistryType
    image: string
    deployedTime: string
    deployedBy: string
    isRollbackTrigger: boolean
    excludedImagePathNode: ReactNode
    approvalChecksNode?: ReactNode
    approvalInfoTippy?: ReactNode
}

export interface SequentialCDCardTitleProps {
    isLatest: boolean
    isRunningOnParentCD: boolean
    artifactStatus: string
    stageType: string
    showLatestTag: boolean
    isVirtualEnvironment: boolean
    deployedOn?: string[]
    environmentName?: string
    parentEnvironmentName?: string
    additionalInfo?: ReactNode
}

export interface ImageCardProps {
    testIdLocator: string
    sequentialCDCardTitleProps: SequentialCDCardTitleProps
    cta: ReactNode
    artifactInfoProps: ArtifactInfoProps
    imageTagContainerProps: ImageTaggingContainerType
    /**
     * Meant for ImageCardAccordion
     */
    children?: ReactNode
    rootClassName?: string
    materialInfoRootClassName?: string
}
