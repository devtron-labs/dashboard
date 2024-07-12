import React, { Fragment } from 'react'
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

export const CollapsibleList = ({ config, onCollapseBtnClick }: CollapsibleListProps) => {
    return (
        <div className="mw-none bcn-0">
            {config.map(({ id, header, headerIconConfig, items, noItemsText, isExpanded }) => (
                <Fragment key={id}>
                    <div className="flexbox dc__align-items-center dc__gap-4 py-6 px-8">
                        <button
                            type="button"
                            className="dc__unset-button-styles mw-none flexbox dc__align-items-center flex-grow-1 p-0 cn-9 fs-12 lh-1-5 fw-6 dc__gap-4"
                            onClick={(e) => onCollapseBtnClick(id, e)}
                        >
                            <ICExpand
                                className="icon-dim-16 fcn-6 dc__no-shrink cursor rotate"
                                style={{ ['--rotateBy' as string]: isExpanded ? '90deg' : '0deg' }}
                            />
                            <span className="flex-grow-1 dc__align-left dc__ellipsis-right">{header}</span>
                        </button>
                        {headerIconConfig && (
                            <button
                                {...headerIconConfig.btnProps}
                                type="button"
                                className={`dc__unset-button-styles dc__no-shrink cursor ${headerIconConfig.btnProps?.className || ''}`}
                            >
                                <headerIconConfig.Icon
                                    {...headerIconConfig.props}
                                    className={`icon-dim-16 ${headerIconConfig.props?.className || ''}`}
                                />
                            </button>
                        )}
                    </div>
                    {isExpanded && (
                        <div className="collapsible ml-16 pl-4 dc__border-left">
                            {!items.length ? (
                                <div className="collapsible__item flexbox dc__gap-8 cn-7 dc__no-decor br-4 py-6 px-8">
                                    <span className="collapsible__item__title dc__ellipsis-right fs-13 lh-20">
                                        {noItemsText || 'No items found.'}
                                    </span>
                                </div>
                            ) : (
                                items.map(({ title, href, iconConfig, subtitle }) => (
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
                                                <span className="dc__ellipsis-right fw-4 lh-1-5 cn-7">{subtitle}</span>
                                            )}
                                        </div>
                                        {iconConfig && (
                                            <ConditionalWrap
                                                condition={!!iconConfig.tooltipProps}
                                                wrap={renderWithTippy(iconConfig.tooltipProps)}
                                            >
                                                <iconConfig.Icon
                                                    {...iconConfig.props}
                                                    className={`icon-dim-16 dc__no-shrink cursor ${iconConfig.props?.className || ''}`}
                                                />
                                            </ConditionalWrap>
                                        )}
                                    </NavLink>
                                ))
                            )}
                        </div>
                    )}
                </Fragment>
            ))}
        </div>
    )
}
