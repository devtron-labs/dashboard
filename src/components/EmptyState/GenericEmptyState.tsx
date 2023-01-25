import React, { CSSProperties, ReactNode } from 'react'
import './emptyState.scss'
import AppNotDeployed from '../../assets/img/app-not-deployed.png'

interface GenericEmptyStateType {
    title: ReactNode
    image?
    classname?: string
    subTitle?: ReactNode
    isButtonAvailable?: boolean
    styles?: CSSProperties
    heightToDeduct?: number
    imageType?: string
    renderButton?: () => JSX.Element
    imageClassName?: string
    children?: ReactNode
    noImage?: boolean
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
    imageClassName,
    children,
    noImage
}: GenericEmptyStateType): JSX.Element {
    return (
        <div
            className={`flex column empty-state ${classname ? classname : ''}`}
            style={styles}
            {...(heightToDeduct >= 0 && { style: { ...styles, height: `calc(100vh - ${heightToDeduct}px)` } })}
        >
            {!noImage && <img className={imageClassName ? imageClassName : ''}
                src={image || AppNotDeployed}
                width={imageType === ImageType.Medium ? '200' : '250'}
                height={imageType === ImageType.Medium ? '160' : '200'}
                alt="empty-state"
            />}
            <h4 className="title fw-6 cn-9 mb-8">{title}</h4>
            {subTitle && <p className="subtitle">{subTitle}</p>}
            {isButtonAvailable && renderButton()}
              {children}
        </div>
    )
}

export default GenericEmptyState
