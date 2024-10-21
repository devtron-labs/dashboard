/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { ConditionalWrap, noop } from '@devtron-labs/devtron-fe-common-lib'
import { CardContentDirection, CardLinkIconPlacement, ContentCardProps } from './ContentCard.types'
import './ContentCard.scss'

/**
 * Note: This component is created to be used at some places for a specific use case where a clickable card is required
 * which contains an image, a card title & an internal link. So it can be updated further according to an use case.
 */
export default function ContentCard({
    redirectTo,
    rootClassName,
    isExternalRedirect,
    direction,
    onClick,
    imgSrc,
    title,
    linkText,
    LinkIcon,
    linkIconClass,
    linkIconPlacement,
    datatestid,
}: ContentCardProps) {
    const getContent = () => {
        return (
            <>
                <img
                    className="content-card-img dc__top-radius-4"
                    src={imgSrc}
                    alt={title}
                    data-testid={`${datatestid}-image`}
                />
                <ConditionalWrap
                    condition={direction === CardContentDirection.Horizontal}
                    wrap={(children) => <div className="flex column left">{children}</div>}
                >
                    <>
                        <div
                            className={`fw-6 fs-16 cn-9 ${
                                direction === CardContentDirection.Horizontal ? '' : 'pt-24'
                            } pb-12 pl-24 pr-24 dc__break-word`}
                            data-testid={`${datatestid}-heading`}
                        >
                            {title}
                        </div>
                        <div
                            className={`flex ${
                                linkIconPlacement === CardLinkIconPlacement.AfterLinkApart ||
                                linkIconPlacement === CardLinkIconPlacement.BeforeLinkApart
                                    ? 'dc__content-space'
                                    : 'left'
                            } w-100 ${direction === CardContentDirection.Horizontal ? '' : 'pb-24'} pl-24 pr-24`}
                            data-testid={`${datatestid}-link`}
                        >
                            {LinkIcon &&
                                (linkIconPlacement === CardLinkIconPlacement.BeforeLink ||
                                    linkIconPlacement === CardLinkIconPlacement.BeforeLinkApart) && (
                                    <LinkIcon className={`icon-dim-20 ${linkIconClass || ''}`} />
                                )}
                            <span className="fs-14 fw-6 lh-20 cb-5">{linkText}</span>
                            {LinkIcon &&
                                (linkIconPlacement === CardLinkIconPlacement.AfterLink ||
                                    linkIconPlacement === CardLinkIconPlacement.AfterLinkApart) && (
                                    <LinkIcon className={`icon-dim-20 ${linkIconClass || ''}`} />
                                )}
                        </div>
                    </>
                </ConditionalWrap>
            </>
        )
    }
    return (
        <div className={`content-card-container bcn-0 br-4 en-2 bw-1 cursor ${rootClassName || ''}`}>
            {isExternalRedirect ? (
                <a
                    href={redirectTo}
                    className={`dc__no-decor fw-6 cursor cn-9 ${direction || CardContentDirection.Vertical}`}
                    onClick={onClick || noop}
                    rel="noreferrer noopener"
                    target="_blank"
                >
                    {getContent()}
                </a>
            ) : (
                <NavLink
                    to={redirectTo}
                    className={`dc__no-decor fw-6 cursor cn-9 ${direction || CardContentDirection.Vertical}`}
                    activeClassName="active"
                    onClick={onClick || noop}
                >
                    {getContent()}
                </NavLink>
            )}
        </div>
    )
}
