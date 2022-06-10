import React from 'react'
import './infoColourBar.scss'

interface InfoColourBarType {
    message: string
    classname: string
    Icon
    iconClass: string
}

function InfoColourBar({ message, classname, Icon, iconClass }: InfoColourBarType) {
    return (
        <div className={`${classname} info-bar flex left pt-10 pb-10 pl-16 pr-16 en-2 bw-1 br-4`}>
            <Icon className={`${iconClass} icon-dim-20 mr-8`} /> {message}
        </div>
    )
}

export default InfoColourBar
