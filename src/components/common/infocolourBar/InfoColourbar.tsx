import React, { CSSProperties } from 'react'
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
    styles,
}: InfoColourBarType) {
    return (
        <div className="info-bar-container">
            <div
                className={`${classname} info_text flex dc__content-space pt-8 pb-8 pl-16 pr-16 br-4 top fs-13 fw-4`}
                style={styles}
            >
                <span className="flex top">
                    <div className={`icon-dim-${iconSize ?? '20'} mr-10`}>
                        <Icon className={`icon-dim-${iconSize ?? '20'} ${iconClass} mr-8`} />
                    </div>
                    <div className={`info-bar-message-wrapper ${linkClass || ''}`}>
                        <span>{message}</span>&nbsp;
                        {linkText && redirectLink && (
                            <a
                                href={redirectLink}
                                target="_blank"
                                onClick={linkOnClick}
                                className="cursor dc__link dc__underline-onhover"
                            >
                                {linkText}
                            </a>
                        )}
                        {linkText && !redirectLink && linkOnClick && (
                            <div onClick={linkOnClick} className="cursor dc__link dc__underline-onhover">
                                {linkText}
                            </div>
                        )}
                    </div>
                </span>
                &nbsp;
                {typeof renderActionButton === 'function' && renderActionButton()}
            </div>
        </div>
    )
}

export default InfoColourBar
