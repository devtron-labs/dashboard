import React from 'react'
import { NavLink } from 'react-router-dom'
import { ReactComponent as ArrowRight } from '../../../assets/icons/ic-arrow-right.svg'
import './ContentCard.scss'

interface ContentCardProps {
    redirectTo: string
    onClick: (e) => void
    imgSrc: string
    title: string
    linkText: string
}

/**
 * Note: This component is created to be used at some places for a specific use case where a clickable card is required
 * which contains an image, a card title & an internal link. So it can be updated further according to an use case.
 */
export default function ContentCard({ redirectTo, onClick, imgSrc, title, linkText }: ContentCardProps) {
    return (
        <div className="content-card-container bcn-0 w-300 br-4 en-2 bw-1 cursor">
            <NavLink
                to={redirectTo}
                className="dc__no-decor fw-6 cursor cn-9"
                activeClassName="active"
                onClick={onClick}
            >
                <img className="content-card-img dc__top-radius-4" src={imgSrc} alt={title} />
                <div className="fw-6 fs-16 cn-9 pt-24 pb-12 pl-24 pr-24 dc__break-word">{title}</div>
                <div className="flex dc__content-space pb-24 pl-24 pr-24">
                    <span className="fs-14 fw-6 lh-20 cb-5">{linkText}</span>
                    <ArrowRight className="icon-dim-20 scb-5" />
                </div>
            </NavLink>
        </div>
    )
}
