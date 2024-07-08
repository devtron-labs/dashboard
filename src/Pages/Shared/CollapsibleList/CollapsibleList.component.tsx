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
        <div className="mw-none bcn-0">
            {config.map(
                ({ id, header, headerIcon: HeaderIcon, headerIconProps, headerIconBtnProps, items, noItemsText }) => (
                    <Fragment key={id}>
                        <div className="flexbox dc__align-items-center dc__gap-4 py-6 px-8">
                            <button
                                type="button"
                                className="dc__unset-button-styles mw-none flexbox dc__align-items-center flex-grow-1 p-0 cn-9 fs-12 lh-1-5 fw-6 dc__gap-4"
                                onClick={handleCollapseBtnClick(id)}
                            >
                                <ICExpand
                                    className="icon-dim-16 fcn-6 dc__no-shrink cursor rotate"
                                    style={{ ['--rotateBy' as string]: isExpanded[id] ? '90deg' : '0deg' }}
                                />
                                <span className="flex-grow-1 dc__align-left dc__ellipsis-right">{header}</span>
                            </button>
                            {HeaderIcon && (
                                <button
                                    {...headerIconBtnProps}
                                    type="button"
                                    className={`dc__unset-button-styles dc__no-shrink cursor ${headerIconBtnProps?.className || ''}`}
                                >
                                    <HeaderIcon
                                        {...headerIconProps}
                                        className={`icon-dim-16 ${headerIconProps?.className || ''}`}
                                    />
                                </button>
                            )}
                        </div>
                        {isExpanded[id] && (
                            <div className="collapsible ml-16 pl-4 dc__border-left">
                                {!items.length ? (
                                    <div className="collapsible__item flexbox dc__gap-8 cn-7 dc__no-decor br-4 py-6 px-8">
                                        <span className="collapsible__item__title dc__ellipsis-right fs-13 lh-20">
                                            {noItemsText || 'No items found.'}
                                        </span>
                                    </div>
                                ) : (
                                    items.map(({ title, href, icon: Icon, iconProps, iconTooltipProps, subtitle }) => (
                                        <NavLink
                                            key={title}
                                            to={href}
                                            className="collapsible__item flexbox dc__gap-8 cn-7 dc__no-decor br-4 py-6 px-8 cursor"
                                        >
                                            <div className="flexbox-col flex-grow-1 mw-none">
                                                <span className="collapsible__item__title dc__ellipsis-right fs-13 lh-20">
                                                    {title}
                                                </span>
                                                {subtitle && (
                                                    <span className="dc__ellipsis-right fw-4 lh-1-5 cn-7">
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
                                                        className={`icon-dim-16 dc__no-shrink cursor ${iconProps?.className || ''}`}
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
