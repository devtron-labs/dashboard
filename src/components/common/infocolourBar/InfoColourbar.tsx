import React, { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import './infoColourBar.scss'

interface InfoColourBarType {
    message: React.ReactNode
    
    classname: string
    Icon
    iconClass?: string
    iconSize?: number // E.g. 16, 20, etc.. Currently, there are around 12 sizes supported. Check `icons.css` or `base.scss` for supported sizes or add new size (class names starts with `icon-dim-`).
    renderActionButton?: () => JSX.Element
    linkText?: React.ReactNode
    redirectLink?: string
    linkOnClick?: () => void
    linkClass?: string
    internalLink?: boolean
    styles?: CSSProperties
}

function InfoColourBar({
    
    message,
    classname,
    Icon,
    iconClass,
    iconSize,
    renderActionButton,
    linkText,
    redirectLink,
    linkOnClick,
    linkClass,
    internalLink,
    styles,
}: InfoColourBarType) {
    const renderLink = () => {
        if (!linkText) {
            return null
        } else if (redirectLink) {
            if (internalLink) {
                return (
                    <Link
                        to={redirectLink}
                        onClick={linkOnClick}
                        className="cursor dc__link dc__underline-onhover mr-5"
                    >
                        {linkText}
                    </Link>
                )
            }

            return (
                <a
                    href={redirectLink}
                    target="_blank"
                    onClick={linkOnClick}
                    className="cursor dc__link dc__underline-onhover mr-5"
                >
                    {linkText}
                </a>
            )
        }

        return (
            linkOnClick && (
                <div onClick={linkOnClick} className="cursor dc__link dc__underline-onhover">
                    {linkText}
                </div>
            )
        )
    }

    return (
        <div className="info-bar-container">
            <div
                className={`${classname} info_text flex dc__content-space pt-8 pb-8 pl-16 pr-16 br-4 top fs-13 fw-4`}
                style={styles}
            >
                <div className={`flex top ${typeof renderActionButton === 'function' ? 'mr-5' : ''}`}>
                    <div className={`icon-dim-${iconSize ?? '20'} mr-10`}>
                        <Icon className={`icon-dim-${iconSize ?? '20'} ${iconClass || ''} mr-8`} />
                    </div>
                    <div className={`info-bar-message-wrapper ${linkClass || ''}`}>
                       
                        <span className={linkText && redirectLink ? 'mr-5' : ''}>{message}</span>
                        {renderLink()}
                    </div>
                </div>
                {typeof renderActionButton === 'function' && renderActionButton()}
            </div>
        </div>
    )
}

export default InfoColourBar
