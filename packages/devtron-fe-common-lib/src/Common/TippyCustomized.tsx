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

import React, { useRef, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as CloseIcon } from '../Assets/Icon/ic-cross.svg'
import { ReactComponent as Help } from '../Assets/Icon/ic-help.svg'
import { ReactComponent as ICHelpOutline } from '../Assets/Icon/ic-help-outline.svg'
import { ReactComponent as ICOpenInNew } from '../Assets/Icon/ic-open-in-new.svg'
import 'tippy.js/animations/shift-toward-subtle.css'
import { TippyCustomizedProps, TippyTheme } from './Types'
import { not, stopPropagation } from './Helper'

// This component will handle some of the new tippy designs and interactions
// So this can be updated to support further for new features or interactions
export const TippyCustomized = (props: TippyCustomizedProps) => {
    const tippyRef = useRef(null)
    const [showHeadingInfo, setShowHeadingInfo] = useState(false)
    const isWhiteTheme = props.theme === TippyTheme.white

    const onTippyMount = (tippyInstance) => {
        tippyRef.current = tippyInstance
        document.addEventListener('keydown', closeOnEsc)
    }

    const closeTippy = (e) => {
        stopPropagation(e)
        if (tippyRef.current?.hide) {
            tippyRef.current.hide()
            tippyRef.current = null

            if (props.onClose) {
                props.onClose()
            }
        }
        setShowHeadingInfo(false)
    }

    const closeOnEsc = (e) => {
        if (e.keyCode === 27) {
            closeTippy(e)
        }
    }

    const toggleHeadingInfo = (e) => {
        setShowHeadingInfo(not)
    }

    const getTippyContent = () => {
        const {
            Icon,
            iconPath,
            iconClass,
            iconSize,
            onImageLoadError,
            heading,
            headingInfo,
            infoTextHeading,
            hideHeading,
            infoText,
            showCloseButton,
            additionalContent,
            documentationLink,
            documentationLinkText,
        } = props
        return (
            <>
                {!hideHeading && (
                    <div
                        className={`dc__word-break dc__hyphens-auto flex dc__align-start left ${
                            isWhiteTheme
                                ? `p-12 cn-9 ${props.noHeadingBorder ? '' : 'dc__border-bottom-n1'}`
                                : 'pt-20 pb-12 pr-20 pl-20 cn-0 top'
                        }`}
                    >
                        {iconPath ? (
                            <img
                                className={`icon-dim-${iconSize || 20} mr-6 ${iconClass || ''}`}
                                src={iconPath}
                                alt="Heading"
                                onError={onImageLoadError}
                            />
                        ) : (
                            Icon && (
                                <div className={`icon-dim-${iconSize || 20} mr-6`}>
                                    <Icon className={`icon-dim-${iconSize || 20} ${iconClass || ''}`} />
                                </div>
                            )
                        )}
                        {heading && (
                            <span className={`fs-14 fw-6 lh-20 ${showCloseButton ? 'mr-12' : ''}`}>{heading}</span>
                        )}
                        {headingInfo && (
                            <div className="icon-dim-20 cursor" onClick={toggleHeadingInfo}>
                                <ICHelpOutline className="icon-dim-20" />
                            </div>
                        )}
                        {showCloseButton && (
                            <div className="icon-dim-16 ml-auto">
                                <CloseIcon
                                    className={`icon-dim-16 cursor ${isWhiteTheme ? 'fcn-9' : 'fcn-0'}`}
                                    onClick={closeTippy}
                                />
                            </div>
                        )}
                    </div>
                )}
                {showHeadingInfo && (
                    <div
                        className={`flex left top bcv-1 fs-13 fw-4 lh-20 pt-8 pb-8 ${
                            isWhiteTheme ? 'pl-12 pr-12' : 'pl-20 pr-20'
                        }`}
                    >
                        <div className="icon-dim-20 mr-8">
                            <Help className="icon-dim-20 fcv-5" />
                        </div>
                        <div className="dc__word-break dc__hyphens-auto">{headingInfo}</div>
                    </div>
                )}
                {infoTextHeading && (
                    <div
                        className={`dc__word-break dc__hyphens-auto fs-14 fw-6 lh-20 ${
                            isWhiteTheme ? 'pl-12 pr-12' : 'pl-20 pr-20'
                        }`}
                    >
                        {infoTextHeading}
                    </div>
                )}
                {infoText && (
                    <div
                        className={`dc__word-break dc__hyphens-auto fs-13 fw-4 lh-20 ${
                            isWhiteTheme
                                ? 'p-12'
                                : `pl-20 pr-20 pt-4 ${additionalContent && documentationLink ? 'pb-12' : 'pb-20'}`
                        }`}
                    >
                        {infoText}
                    </div>
                )}
                {additionalContent}
                {documentationLink && (
                    <div className="pl-12 pb-12">
                        <a
                            href={documentationLink}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="fs-13 cb-5 flex left"
                            onClick={closeTippy}
                        >
                            {documentationLinkText || 'Learn more'}
                            <ICOpenInNew className="icon-dim-14 ml-4" />
                        </a>
                    </div>
                )}
            </>
        )
    }

    const { className, placement, arrow, interactive, showOnCreate, trigger, animation, duration, children } = props

    return (
        <Tippy
            className={`${
                isWhiteTheme ? 'tippy-white-container default-white' : 'tippy-black-container default-black'
            } no-content-padding tippy-shadow ${className}`}
            arrow={arrow || false}
            interactive={interactive || false}
            placement={placement || 'top'}
            content={getTippyContent()}
            trigger={trigger || 'mouseenter'}
            onMount={onTippyMount}
            onClickOutside={(tippyInstance, e) => closeTippy(e)}
            showOnCreate={showOnCreate || false}
            animation={animation || 'fade'}
            duration={duration || 300}
            visible={props.visible}
        >
            {children}
        </Tippy>
    )
}
