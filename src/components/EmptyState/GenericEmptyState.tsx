import React, { CSSProperties, ReactNode } from 'react'
import './emptyState.scss'
import AppNotDeployed from '../../assets/img/app-not-deployed.png'

interface GenericEmptyStateType {
    title: ReactNode
    image?
    classname?: string
    subTitle?: ReactNode
    isButtonAvailable?: boolean
    // iconSize?: number // E.g. 16, 20, etc.. Currently, there are around 12 sizes supported. Check `icons.css` or `base.scss` for supported sizes or add new size (class names starts with `icon-dim-`).
    styles?: CSSProperties
    heightToDeduct?: number
    imageType?: string
    renderButton?: () => JSX.Element
}

enum ImageType {
    Large = 'large',
    Medium = 'medium',
}

function GenericEmptyState({
    title,
    image,
    subTitle,
    isButtonAvailable,
    classname,
    styles,
    heightToDeduct,
    imageType,
    renderButton,
}: GenericEmptyStateType): JSX.Element {
    return (
        <div
            className={`flex column empty-state ${classname ? classname : ''}`}
            style={styles}
            {...(heightToDeduct >= 0 && { style: { ...styles, height: `calc(100vh - ${heightToDeduct}px)` } })}
        >
            <img
                src={image || AppNotDeployed}
                width={imageType === ImageType.Medium ? '200' : '250'}
                height={imageType === ImageType.Medium ? '160' : '200'}
                alt="empty-state"
            />
            <h4 className="title fw-6 cn-9 mb-8">{title}</h4>
            {subTitle && <p className="subtitle">{subTitle}</p>}
            {/* {isPostIcon && <Icon classname={`icon-dim-${iconSize ? iconSize : '16'}`} />} */}
            {isButtonAvailable && renderButton()}
        </div>
    )
}

export default GenericEmptyState
