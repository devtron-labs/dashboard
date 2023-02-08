import React, { ReactNode, useEffect, useRef } from 'react'
import Tippy from '@tippyjs/react'
import { Placement } from 'tippy.js'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-cross.svg'
import 'tippy.js/animations/shift-toward-subtle.css'

export enum TippyTheme {
    black = 'black',
    white = 'white',
}

interface TippyCustomizedProps {
    theme: TippyTheme
    visible?: boolean
    heading?: string
    infoTextHeading?: string
    placement: Placement
    className?: string
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    iconPath?: string
    iconClass?: string
    iconSize?: number // E.g. 16, 20, etc.. Currently, there are around 12 sizes supported. Check `icons.css` or `base.scss` for supported sizes or add new size (class names starts with `icon-dim-`).
    onImageLoadError?: (e) => void
    onClose?: () => void
    infoText?: string
    showCloseButton?: boolean
    arrow?: boolean
    interactive?: boolean
    showOnCreate?: boolean
    trigger?: string
    animation?: string
    duration?: number
    additionalContent?: ReactNode
    documentationLink?: string
    documentationLinkText?: string
    children: React.ReactElement<any>
}

// This component will handle some of the new tippy designs and interactions
// So this can be updated to support further for new features or interactions
export default function TippyCustomized(props: TippyCustomizedProps) {
    const tippyRef = useRef(null)
    const isWhiteTheme = props.theme === TippyTheme.white

    const onTippyMount = (tippyInstance) => {
        tippyRef.current = tippyInstance
        document.addEventListener('keydown', closeOnEsc)
    }

    const closeTippy = () => {
        if (tippyRef.current?.hide) {
            tippyRef.current.hide()
            tippyRef.current = null

            if (props.onClose) {
                props.onClose()
            }
        }
    }

    const closeOnEsc = (e) => {
        if (e.keyCode === 27) {
            closeTippy()
        }
    }

    const getTippyContent = () => {
        const {
            Icon,
            iconPath,
            iconClass,
            iconSize,
            onImageLoadError,
            heading,
            infoTextHeading,
            infoText,
            showCloseButton,
            additionalContent,
            documentationLink,
            documentationLinkText,
        } = props
        return (
            <>
                <div
                    className={`dc__word-break dc__hyphens-auto flex left ${
                        isWhiteTheme ? 'p-12 dc__border-bottom-n1 cn-9' : 'pt-20 pb-12 pr-20 pl-20 cn-0'
                    }`}
                >
                    {iconPath ? (
                        <img
                            className={`icon-dim-${iconSize || 20} mr-6 ${iconClass || ''}`}
                            src={iconPath}
                            alt={heading}
                            onError={onImageLoadError}
                        />
                    ) : (
                        Icon && (
                            <div className={`icon-dim-${iconSize || 20} mr-6`}>
                                <Icon className={`icon-dim-${iconSize || 20} ${iconClass || ''}`} />
                            </div>
                        )
                    )}
                    {heading && <span className={`fs-14 fw-6 lh-20 ${showCloseButton ? 'mr-6' : ''}`}>{heading}</span>}
                    {showCloseButton && (
                        <div className="icon-dim-16 ml-auto">
                            <CloseIcon
                                className={`icon-dim-16 cursor ${isWhiteTheme ? 'fcn-9' : 'fcn-0'}`}
                                onClick={closeTippy}
                            />
                        </div>
                    )}
                </div>
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
                            className="fs-13 cb-5"
                            onClick={closeTippy}
                        >
                            {documentationLinkText || 'Learn more'}
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
            onClickOutside={closeTippy}
            showOnCreate={showOnCreate || false}
            animation={animation || 'fade'}
            duration={duration || 300}
            visible={props.visible}
        >
            {children}
        </Tippy>
    )
}
