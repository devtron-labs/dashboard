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

import AppNotDeployed from '../../Assets/Img/app-not-deployed.png'
import { GenericEmptyStateType, ImageType } from '../Types'

import './emptyState.scss'

const GenericEmptyState = ({
    title,
    image,
    subTitle,
    isButtonAvailable,
    classname,
    styles,
    heightToDeduct,
    imageType,
    renderButton,
    imageClassName,
    children,
    SvgImage,
    noImage,
    layout = 'column',
    contentClassName = '',
    imageStyles = {},
}: GenericEmptyStateType): JSX.Element => {
    const isRowLayout = layout === 'row'

    const getImageSize = () => {
        switch (imageType) {
            case ImageType.Large:
                return { width: '250px', height: '200px' }
            default:
                return { width: '200px', height: '160px' }
        }
    }

    return (
        <div
            className={`flex ${isRowLayout ? 'dc__gap-32' : 'column dc__gap-20'} empty-state ${classname || ''}`}
            style={styles}
            data-testid="generic-empty-state"
            {...(heightToDeduct >= 0 && { style: { ...styles, height: `calc(100vh - ${heightToDeduct}px)` } })}
        >
            {!SvgImage ? (
                !noImage && (
                    <img
                        className={imageClassName || ''}
                        src={image || AppNotDeployed}
                        style={{
                            ...imageStyles,
                            width: `${getImageSize().width}`,
                            height: `${getImageSize().height}`,
                        }}
                        alt="empty-state"
                    />
                )
            ) : (
                <SvgImage
                    style={{
                        ...imageStyles,
                        width: `${getImageSize().width}`,
                        height: `${getImageSize().height}`,
                    }}
                />
            )}
            <div
                className={`flex column dc__gap-20 dc__mxw-300 ${
                    isRowLayout ? 'dc__align-start' : ''
                } ${contentClassName}`}
            >
                <div className="flex column dc__gap-8">
                    <h4 className="title fw-6 cn-9 mt-0 mb-0 lh-24 dc__align-center">{title}</h4>
                    {subTitle && <p className={`subtitle ${isRowLayout ? 'subtitle--text-start' : ''}`}>{subTitle}</p>}
                </div>
                {isButtonAvailable && renderButton()}
                {children}
            </div>
        </div>
    )
}

export default GenericEmptyState
