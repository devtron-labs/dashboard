import React, { ReactNode, useRef } from 'react'
import Tippy from '@tippyjs/react'
import { Placement } from 'tippy.js'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-cross.svg'

export enum TippyTheme {
    black = 'black',
    white = 'white',
}

interface TippyCustomizedProps {
    theme: TippyTheme
    heading?: string
    infoTextHeading?: string
    placement: Placement
    className?: string
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    iconPath?: string
    iconClass?: string
    iconSize?: number // E.g. 16, 20, etc.. Currently, there are around 12 sizes supported. Check `icons.css` or `base.scss` for supported sizes or add new size (class names starts with `icon-dim-`).
    onImageLoadError?: (e) => void
    infoText?: string
    showCloseButton?: boolean
    arrow?: boolean
    interactive?: boolean
    trigger?: string
    additionalContent?: ReactNode
    documentationLink?: string
    documentationLinkText?: string
    children: React.ReactElement<any>
}

// This component will handle some of the new tippy designs and interactions
// So this can be updated to support further for new features or interactions
export default function TippyCustomized({
    theme,
    className,
    placement,
    Icon,
    iconPath,
    iconClass,
    iconSize,
    onImageLoadError,
    heading,
    infoTextHeading,
    infoText,
    showCloseButton,
    arrow,
    interactive,
    trigger,
    additionalContent,
    documentationLink,
    documentationLinkText,
    children,
}: TippyCustomizedProps) {
    const tippyRef = useRef(null)

    const onTippyMount = (tippyInstance) => {
        tippyRef.current = tippyInstance
        document.addEventListener('keydown', closeOnEsc)
    }

    const closeTippy = () => {
        if (tippyRef.current?.hide) {
            tippyRef.current.hide()
        }
    }

    const closeOnEsc = (e) => {
        if (e.keyCode === 27) {
            closeTippy()
        }
    }

    const getTippyContent = () => {
        return (
            <>
                <div
                    className={`dc__word-break dc__hyphens-auto flex left p-12 dc__border-bottom-n1 ${
                        theme === TippyTheme.white ? 'cn-9' : 'cn-0'
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
                    {heading && <span className={`fs-14 fw-6 ${showCloseButton ? 'mr-6' : ''}`}>{heading}</span>}
                    {showCloseButton && (
                        <div className="icon-dim-16 ml-auto">
                            <CloseIcon
                                className={`icon-dim-16 cursor ${theme === TippyTheme.white ? 'fcn-9' : 'fcn-0'}`}
                                onClick={closeTippy}
                            />
                        </div>
                    )}
                </div>
                {infoTextHeading && (
                    <div className="dc__word-break dc__hyphens-auto fs-14 fw-6 p-12">{infoTextHeading}</div>
                )}
                {infoText && <div className="dc__word-break dc__hyphens-auto fs-13 fw-4 p-12">{infoText}</div>}
                {additionalContent}
                {documentationLink && (
                    <div className="pl-12 pb-12">
                        <a
                            href={documentationLink}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="cb-5"
                            onClick={closeTippy}
                        >
                            {documentationLinkText || 'Learn more'}
                        </a>
                    </div>
                )}
            </>
        )
    }

    return (
        <Tippy
            className={`${
                theme === TippyTheme.white
                    ? 'tippy-white-container default-white'
                    : 'tippy-black-container default-black'
            } no-content-padding tippy-shadow ${className}`}
            arrow={arrow || false}
            interactive={interactive || false}
            placement={placement}
            content={getTippyContent()}
            trigger={trigger || 'mouseenter'}
            onMount={onTippyMount}
        >
            {children}
        </Tippy>
    )
}
