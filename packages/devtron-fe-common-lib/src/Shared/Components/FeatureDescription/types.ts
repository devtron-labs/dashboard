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

import React, { ReactNode } from 'react'
import { ImageType } from '../../../Common'
import { Breadcrumb } from '../../../Common/BreadCrumb/Types'

export interface FeatureDescriptionModalProps {
    title: string
    renderDescriptionContent?: () => ReactNode
    closeModalText?: string
    docLink?: string
    closeModal?: () => void
    imageVariant?: ImageType
    SVGImage?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    imageStyles?: React.CSSProperties
}

export interface DescriptorProps extends FeatureDescriptionModalProps {
    breadCrumbs?: Breadcrumb[]
    additionalContainerClasses?: string
    iconClassName?: string
    children?: React.ReactNode
    showInfoIconTippy?: boolean
    docLinkText?: string
    dataTestId?: string
    additionalContent?: ReactNode
    /**
     * If true, the info icon is displayed which when clicked shows the feature description modal
     *
     * @default false
     */
    showInfoIcon?: boolean
}
