import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { ReactComponent as Cross } from '../../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import '../../v2/appDetails/k8Resource/NodeTreeTabList.tsx'
import { ConditionalWrap } from '../helpers/Helpers'
import './DynamicTabs.scss'

export function DynamicTabs({ tabs, removeTabByIdentifier, showTitleTippyKey, preventCloseKey }) {
    const { push } = useHistory()
    const containerRef = useRef<HTMLDivElement>(null)
    const tabRef = useRef<HTMLAnchorElement>(null)
    const [tabsData, setTabsData] = useState<{
        fixedTabs: any[]
        dynamicTabs: any[]
    }>({
        fixedTabs: [],
        dynamicTabs: [],
    })

    useEffect(() => {
        initTabsData()
    }, [tabs])

    const initTabsData = (): void => {
        const fixedTabs = []
        const dynamicTabs = []
        for (const tab of tabs) {
            if (tab.positionFixed) {
                fixedTabs.push(tab)
            } else {
                dynamicTabs.push(tab)
            }
        }

        setTabsData({
            fixedTabs,
            dynamicTabs,
        })
    }

    const handleCloseTab = (e: any, tabIdentifier: string) => {
        e.stopPropagation()
        const pushURL = removeTabByIdentifier(tabIdentifier)
        setTimeout(() => {
            if (pushURL) {
                push(pushURL)
            }
        }, 1)
    }

    const updateRef = (_node: HTMLAnchorElement) => {
        if (_node?.dataset?.selected === 'true') {
            tabRef.current = _node
        }
    }

    const getTabNavLink = (tab) => {
        return (
            <NavLink
                to={tab.url}
                ref={updateRef}
                className="dynamic-tab__resource cursor cn-9 dc__no-decor m-0-imp dc__ellipsis-right"
                data-selected={tab.isSelected}
            >
                <div
                    className={`flex left ${tab.isSelected ? 'cn-9' : ''} ${
                        tab.isDeleted ? 'dynamic-tab__deleted cr-5' : ''
                    }`}
                >
                    <span className="fs-12 fw-6 lh-20 dc__ellipsis-right">{tab.name}</span>
                </div>
            </NavLink>
        )
    }

    const handleTabCloseAction = (e) => {
        handleCloseTab(e, e.currentTarget.dataset.title)
    }

    const renderTab = (tab, idx) => {
        return (
            <div className="flex">
                <div
                    className={`dynamic-tab ${
                        tab.isSelected ? 'dynamic-tab-selected bcn-0 cn-9' : ''
                    } flex left pl-12 pt-8 pb-8 pr-12`}
                >
                    {getTabNavLink(tab)}
                    {tab.name !== preventCloseKey && (
                        <div className="dynamic-tab__close flex br-5  ml-8">
                            <Cross
                                data-title={tab.title}
                                onClick={handleTabCloseAction}
                                className="icon-dim-16 cursor"
                            />
                        </div>
                    )}
                </div>
                <div className={` ${!tab.isSelected || !(tab.isSelected && idx - 1) ? 'dynamic-tab__border' : ''}`} />
            </div>
        )
    }

    const getTabTippyContent = (title: string) => {
        const _titleSplit = title.split('/')

        return (
            <div className="w-200">
                <h2 className="fs-12 fw-6 lh-18 m-0 dc__word-break">{_titleSplit[0]}</h2>
                {_titleSplit[1] && <p className="fs-12 fw-4 lh-18 mt-4 mb-0 dc__word-break">{_titleSplit[1]}</p>}
            </div>
        )
    }

    return (
        <div ref={containerRef} className="dynamic-tabs-section flexbox pl-20 pr-20" style={{ outline: 'none' }}>
            <div className="fixed-tabs-container">
                <ul className="fixed-tabs-wrapper flexbox p-0 m-0">
                    {tabsData.fixedTabs.map((tab, idx) => renderTab(tab, idx))}
                </ul>
            </div>
            <div className="dynamic-tabs-container">
                <ul className="dynamic-tabs-wrapper flexbox p-0 m-0">
                    {tabsData.dynamicTabs.map((tab, idx) => {
                        return (
                            <li key={`${idx}-tab`} id={tab.name} className="flex left flex-grow-1">
                                {tab.name !== showTitleTippyKey ? (
                                    <Tippy
                                        className="default-tt dc_max-width__max-content"
                                        arrow={false}
                                        placement="top"
                                        content={getTabTippyContent(tab.title)}
                                    >
                                        {renderTab(tab, idx)}
                                    </Tippy>
                                ) : (
                                    renderTab(tab, idx)
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
