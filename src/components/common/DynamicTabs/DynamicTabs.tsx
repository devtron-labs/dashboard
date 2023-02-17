import React, { useEffect, useRef } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { ReactComponent as Cross } from '../../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import '../../v2/appDetails/k8Resource/NodeTreeTabList.tsx'
import { ConditionalWrap } from '../helpers/Helpers'

export function DynamicTabs({ tabs, removeTabByIdentifier, showTitleTippyKey, preventCloseKey }) {
    const { push } = useHistory()
    const containerRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)

    const handleCloseTab = (e: any, tabIdentifier: string) => {
        e.stopPropagation()
        const pushURL = removeTabByIdentifier(tabIdentifier)
        setTimeout(() => {
            if (pushURL) {
                push(pushURL)
            }
        }, 1)
    }

    const getTabNavLink = (tab) => {
        return (
            <NavLink
                to={tab.url}
                className="resource-tree__tab-hover tab-list__tab resource-tab__node cursor cn-9 fw-6 dc__no-decor m-0-imp"
            >
                <div
                    className={`flex left ${tab.isSelected ? 'cn-9' : ''} ${
                        tab.isDeleted ? 'tab-list__deleted cr-5' : ''
                    }`}
                >
                    <span className="mr-8 fs-12">{tab.name}</span>
                </div>
            </NavLink>
        )
    }

    const handleTabCloseAction = (e) => {
        handleCloseTab(e, e.currentTarget.dataset.title)
    }

    return (
        <div ref={containerRef} className="resource-tree-wrapper flexbox pl-20 pr-20" style={{ outline: 'none' }}>
            <ul ref={listRef} className="tab-list">
                {tabs.map((tab, idx) => {
                    return (
                        <li key={`${idx}-tab`} id={tab.name} className="flex left dc__ellipsis-right">
                            <ConditionalWrap
                                condition={tab.name !== showTitleTippyKey}
                                wrap={(children) => {
                                    return (
                                        <Tippy
                                            className="default-tt dc_max-width__max-content"
                                            arrow={false}
                                            placement="top"
                                            content={tab.title}
                                        >
                                            {children}
                                        </Tippy>
                                    )
                                }}
                            >
                                <div className="flex">
                                    <div
                                        className={`${
                                            tab.isSelected ? 'resource-tree-tab bcn-0 cn-9' : ''
                                        } flex left pl-12 pt-8 pb-8 pr-12`}
                                    >
                                        {getTabNavLink(tab)}
                                        {tab.name !== preventCloseKey && (
                                            <div className="resource-tab__close-wrapper flex br-5">
                                                <Cross
                                                    data-title={tab.title}
                                                    onClick={handleTabCloseAction}
                                                    className="icon-dim-16 cursor"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={` ${
                                            !tab.isSelected || !(tab.isSelected && idx - 1)
                                                ? 'resource-tree-tab__border'
                                                : ''
                                        }`}
                                    />
                                </div>
                            </ConditionalWrap>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
