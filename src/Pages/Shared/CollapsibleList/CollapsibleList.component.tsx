/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { Fragment, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Tippy, { TippyProps } from '@tippyjs/react'

import { ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICExpand } from '../../../assets/icons/ic-expand.svg'

import { CollapsibleListProps } from './CollapsibleList.types'
import './CollapsibleList.scss'

const renderWithTippy = (tippyProps: TippyProps) => (children: React.ReactElement) => (
    <Tippy {...tippyProps}>
        <div className="dc__align-self-start">{children}</div>
    </Tippy>
)

export const CollapsibleList = ({ config, expandedIds }: CollapsibleListProps) => {
    const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({})

    useEffect(() => {
        // Expand the collapsible list items whenever the `expandedIds` is modified.
        setIsExpanded((prevState) => ({
            ...prevState,
            ...expandedIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}),
        }))
    }, [expandedIds])

    const handleCollapseBtnClick = (id: string) => () =>
        setIsExpanded((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))

    return (
        <div className="collapsible-list">
            {config.map(
                ({
                    id,
                    header,
                    headerIcon: HeaderIcon,
                    headerIconProps,
                    headerIconTooltipProps,
                    items,
                    noItemsText,
                }) => (
                    <Fragment key={id}>
                        <div className="flexbox dc__align-items-center dc__gap-4 py-6 px-8">
                            <button
                                type="button"
                                className="dc__unset-button-styles collapsible-list__header-button"
                                onClick={handleCollapseBtnClick(id)}
                            >
                                <ICExpand
                                    className="collapsible-list__icon rotate"
                                    style={{ ['--rotateBy' as string]: isExpanded[id] ? '90deg' : '0deg' }}
                                />
                                <span className="flex-grow-1 dc__align-left dc__ellipsis-right">{header}</span>
                            </button>
                            {HeaderIcon && (
                                <ConditionalWrap
                                    condition={!!headerIconTooltipProps}
                                    wrap={renderWithTippy(headerIconTooltipProps)}
                                >
                                    <HeaderIcon
                                        {...headerIconProps}
                                        className={`collapsible-list__icon ${headerIconProps?.className || ''}`}
                                    />
                                </ConditionalWrap>
                            )}
                        </div>
                        {isExpanded[id] && (
                            <div className="collapsible">
                                {!items.length ? (
                                    <div className="collapsible__item">
                                        <span className="dc__ellipsis-right collapsible__item__title">
                                            {noItemsText || 'No items found.'}
                                        </span>
                                    </div>
                                ) : (
                                    items.map(({ title, href, icon: Icon, iconProps, iconTooltipProps, subtitle }) => (
                                        <NavLink to={href} className="collapsible__item cursor">
                                            <div className="flexbox-col flex-grow-1 mw-none">
                                                <span className="dc__ellipsis-right collapsible__item__title">
                                                    {title}
                                                </span>
                                                {subtitle && (
                                                    <span className="dc__ellipsis-right collapsible__item__subtitle">
                                                        {subtitle}
                                                    </span>
                                                )}
                                            </div>
                                            {Icon && (
                                                <ConditionalWrap
                                                    condition={!!iconTooltipProps}
                                                    wrap={renderWithTippy(iconTooltipProps)}
                                                >
                                                    <Icon
                                                        {...iconProps}
                                                        className={`collapsible-list__icon ${iconProps?.className || ''}`}
                                                    />
                                                </ConditionalWrap>
                                            )}
                                        </NavLink>
                                    ))
                                )}
                            </div>
                        )}
                    </Fragment>
                ),
            )}
        </div>
    )
}
