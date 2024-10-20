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

import { VisibleModal, stopPropagation } from '../../../Common'
import { BUTTON_TEXT } from './constant'
import { FeatureDescriptionModalProps } from './types'
import './featureDescription.scss'
import { ReactComponent as ArrowOutSquare } from '../../../Assets/Icon/ic-arrow-square-out.svg'
import { getImageSize } from './utils'

export const FeatureDescriptionModal = ({
    title,
    renderDescriptionContent,
    closeModalText = BUTTON_TEXT.GOT_IT,
    docLink = '',
    closeModal,
    imageVariant,
    SVGImage,
    imageStyles = {},
}: FeatureDescriptionModalProps) => {
    const renderImage = () => {
        if (!SVGImage) {
            return null
        }
        return (
            <div className="flexbox dc__align-center dc__justify-center mt-16 mb-12">
                <SVGImage
                    style={{
                        ...imageStyles,
                        width: `${getImageSize(imageVariant).width}`,
                        height: `${getImageSize(imageVariant).height}`,
                    }}
                />
            </div>
        )
    }
    const renderDescriptionBody = () => (
        <div className="pl-20 pr-20 pt-16 pb-16 dc__gap-16">
            <div className="flex left w-100 fs-16 fw-6">{title}</div>
            {renderImage()}
            {typeof renderDescriptionContent === 'function' && renderDescriptionContent()}
        </div>
    )

    const renderFooter = () => (
        <div
            className={`flex right w-100 dc__align-right dc__border-top-n1 px-20 py-16 ${docLink ? 'dc__content-space' : 'right'}`}
        >
            {docLink.length > 0 && (
                <a
                    className="flex dc__link en-2 bw-1 dc__gap-6 br-4 fw-6 lh-20 px-8 py-6 h-32 anchor dc__hover-n50"
                    href={docLink}
                    target="_blank"
                    rel="noreferrer"
                >
                    {BUTTON_TEXT.VIEW_DOCUMENTATION}
                    <ArrowOutSquare className="icon-dim-16 scb-5" />
                </a>
            )}
            <button className="cta flex small" type="submit" onClick={closeModal}>
                {closeModalText}
            </button>
        </div>
    )

    return (
        <VisibleModal className="" close={closeModal}>
            <div
                className="feature-description modal__body w-600 mt-40 flex column p-0 fs-13 dc__overflow-hidden"
                onClick={stopPropagation}
            >
                {renderDescriptionBody()}
                {renderFooter()}
            </div>
        </VisibleModal>
    )
}
