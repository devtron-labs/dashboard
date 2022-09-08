import React from 'react'
import './infoColourBar.scss'

interface InfoColourBarType {
    message: string
    classname: string
    Icon
    iconClass?: string
    renderActionButton?: () => JSX.Element
    linkText?: string
    redirectToLink?:() => void;
}

function InfoColourBar({ message, classname, Icon, iconClass, renderActionButton, redirectToLink, linkText }: InfoColourBarType) {
    return (
        <div className="info-bar-container">
            <div className={`${classname} info_text flex content-space pt-10 pb-10 pl-16 pr-16 br-4 top fs-13 fw-4`}>
                <span className="flex top">
                    <div className="icon-dim-20 mr-10">
                        <Icon className={`${iconClass} icon-dim-20 mr-8`} />
                    </div>
                    <div>
                        <span>{message}</span>
                        <div>
                            {linkText && (
                                <a target="_blank" onClick={redirectToLink} className="cursor onlink">
                                    {linkText}
                                </a>
                            )}
                        </div>
                    </div>
                </span>
                &nbsp;
                {typeof renderActionButton === 'function' && renderActionButton()}
            </div>
        </div>
    )
}

export default InfoColourBar
