import React, { ReactNode, useRef } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-cross.svg'

interface TippyWhiteProps {
    className?: string
    placement: 'top' | 'bottom' | 'right' | 'left'
    Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    iconClass?: string
    heading: string
    infoText?: string | JSX.Element
    showCloseButton?: boolean
    interactive?: boolean
    trigger?: string
    additionalContent?: ReactNode
    children: React.ReactElement<any>
}

// This component will handle some of the new tippy designs and interactions
// So this can be updated to support further for new features or interactions
export default function TippyWhite({
    className,
    placement,
    Icon,
    iconClass,
    heading,
    infoText,
    showCloseButton,
    interactive,
    trigger,
    additionalContent,
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
                <div className="flex p-12 dc__border-bottom-n1">
                    <Icon className={`icon-dim-20 mr-6 ${iconClass}`} />
                    <span className="fs-14 fw-6 cn-9">{heading}</span>
                    {showCloseButton && <CloseIcon className="icon-dim-16 fcn-9 ml-auto cursor" onClick={closeTippy} />}
                </div>
                {infoText && <div className="fs-13 fw-4 cn-9 p-12">{infoText}</div>}
                {additionalContent}
            </>
        )
    }

    return (
        <Tippy
            className={`default-white no-content-padding tippy-shadow ${className}`}
            arrow={false}
            interactive={interactive || false}
            placement={placement}
            content={getTippyContent()}
            trigger={trigger || 'mouseover'}
            onMount={onTippyMount}
        >
            {children}
        </Tippy>
    )
}
