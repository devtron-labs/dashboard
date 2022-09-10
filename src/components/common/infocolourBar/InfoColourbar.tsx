import React from 'react'
import './infoColourBar.scss'

interface InfoColourBarType {
    message: React.ReactNode
    classname: string
    Icon
    iconClass?: string
    iconSize?: number // E.g. 16, 20, etc.. Currently, there are around 12 sizes supported. Check `icons.css` or `base.scss` for supported sizes or add new size (class names starts with `icon-dim-`).
    renderActionButton?: () => JSX.Element
    linkText?: string
    redirectToLink?: () => void
}

function InfoColourBar({
    message,
    classname,
    Icon,
    iconClass,
    iconSize,
    renderActionButton,
    redirectToLink,
    linkText,
}: InfoColourBarType) {
    return (
        <div className="info-bar-container">
            <div className={`${classname} info_text flex content-space pt-10 pb-10 pl-16 pr-16 br-4 top fs-13 fw-4`}>
                <span className="flex top">
                    <div className={`icon-dim-${iconSize ?? '20'} mr-10`}>
                        <Icon className={`icon-dim-${iconSize ?? '20'} ${iconClass} mr-8`} />
                    </div>
                    <div>
                        <span>{message}</span>
                        {linkText && (
                            <div>
                                <a target="_blank" onClick={redirectToLink} className="cursor onlink">
                                    {linkText}
                                </a>
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
