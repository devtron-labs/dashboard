import React, { ReactNode, useRef } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-cross.svg'

interface TippyWhiteProps {
    className?: string
    placement: 'top' | 'bottom' | 'right' | 'left'
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    iconPath?: string
    iconClass?: string
    onImageLoadError?: (e) => void
    heading: string
    infoText?: string
    showCloseButton?: boolean
    interactive?: boolean
    trigger?: string
    additionalContent?: ReactNode
    documentationLink?: string
    documentationLinkText?: string
    children: React.ReactElement<any>
}

// This component will handle some of the new tippy designs and interactions
// So this can be updated to support further for new features or interactions
export default function TippyWhite({
    className,
    placement,
    Icon,
    iconPath,
    iconClass,
    onImageLoadError,
    heading,
    infoText,
    showCloseButton,
    interactive,
    trigger,
    additionalContent,
    documentationLink,
    documentationLinkText,
    children,
}: TippyWhiteProps) {
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
                <div className="tippy-white-heading dc__word-break-all dc__hyphens-auto flex left p-12 dc__border-bottom-n1">
                    {iconPath ? (
                        <img
                            className={`icon-dim-20 mr-6 ${iconClass || ''}`}
                            src={iconPath}
                            alt={heading}
                            onError={onImageLoadError}
                        />
                    ) : (
                        <div className="icon-dim-20 mr-6">
                            <Icon className={`icon-dim-20 ${iconClass || ''}`} />
                        </div>
                    )}
                    <span className={`fs-14 fw-6 cn-9 ${showCloseButton ? 'mr-6' : ''}`}>{heading}</span>
                    {showCloseButton && (
                        <div className="icon-dim-16 ml-auto">
                            <CloseIcon className="icon-dim-16 fcn-9 cursor" onClick={closeTippy} />
                        </div>
                    )}
                </div>
                {infoText && (
                    <div className="tippy-white-info dc__word-break-all dc__hyphens-auto fs-13 fw-4 cn-9 p-12">
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
            className={`tippy-white-container default-white no-content-padding tippy-shadow ${className}`}
            arrow={false}
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
