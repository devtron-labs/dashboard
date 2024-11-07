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

import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { Dayjs } from 'dayjs'
import { stopPropagation, ConditionalWrap, noop, OptionType, DynamicTabType } from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect, { components, InputActionMeta, OptionProps } from 'react-select'
import { getCustomOptionSelectionStyle } from '../../v2/common/ReactSelect.utils'
import { COMMON_TABS_SELECT_STYLES, EMPTY_TABS_DATA, initTabsData, checkIfDataIsStale } from './Utils'
import { DynamicTabsProps, TabsDataType } from './Types'
import { MoreButtonWrapper, noMatchingTabs, TabsMenu, timerTransition } from './DynamicTabs.component'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import Timer from './DynamicTabs.timer'
import { ReactComponent as Cross } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as SearchIcon } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as RefreshIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import './DynamicTabs.scss'

/**
 * This component enables a way to display dynamic tabs with the following functionalities,
 * - Can make certain tabs fixed
 * - Takes the parent's width as init reference to identify stop width
 * - Shows more options CTA when there's no available width to display all tabs
 * - Scrollable tabs section by default
 *
 * Note: To be used with useTabs hook
 */
const DynamicTabs = ({
    tabs,
    removeTabByIdentifier,
    markTabActiveById,
    stopTabByIdentifier,
    refreshData,
    setIsDataStale,
    hideTimer,
}: DynamicTabsProps) => {
    const { push } = useHistory()
    const tabsSectionRef = useRef<HTMLDivElement>(null)
    const fixedContainerRef = useRef<HTMLDivElement>(null)
    const moreButtonRef = useRef(null)
    const [tabsData, setTabsData] = useState<TabsDataType>(EMPTY_TABS_DATA)
    const [selectedTab, setSelectedTab] = useState<DynamicTabType>(null)
    const [tabSearchText, setTabSearchText] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const tabPopupMenuRef = useRef(null)
    const CLUSTER_TERMINAL_TAB = 'cluster_terminal-Terminal'

    const closeMenu = () => {
        setIsMenuOpen(false)
        setTabSearchText('')
    }

    useEffect(() => {
        initTabsData(tabs, setTabsData, setSelectedTab, closeMenu)
    }, [tabs])

    const getMarkTabActiveHandler = (tab: DynamicTabType) => () => {
        markTabActiveById(tab.id)
        push(tab.url)
    }

    const getTabNavLink = (tab: DynamicTabType) => {
        const { name, isDeleted, isSelected, iconPath, dynamicTitle, title, showNameOnSelect, isAlive, hideName } = tab
        const shouldRenderTitle = (!showNameOnSelect || isAlive || isSelected) && !hideName

        const _title = dynamicTitle || title

        return (
            <button
                type="button"
                className="dc__unset-button-styles dc__mxw-250"
                data-testid={isSelected}
                onClick={getMarkTabActiveHandler(tab)}
                aria-label={`Select tab ${_title}`}
            >
                <div
                    className={`dynamic-tab__resource dc__ellipsis-right flex dc__gap-8 ${isDeleted ? 'dynamic-tab__deleted cr-5' : ''} ${!shouldRenderTitle ? 'dynamic-tab__resource--no-title' : ''}`}
                >
                    {iconPath && <img className="icon-dim-16" src={iconPath} alt={name} />}
                    {shouldRenderTitle && (
                        <span className="fs-12 fw-6 lh-20 dc__ellipsis-right" data-testid={name}>
                            {_title}
                        </span>
                    )}
                </div>
            </button>
        )
    }

    const handleTabCloseAction: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation()
        removeTabByIdentifier(event.currentTarget.dataset.id)
            .then((url) => url && push(url))
            .catch(noop)
    }

    const handleTabStopAction = (e) => {
        e.stopPropagation()
        stopTabByIdentifier(e.currentTarget.dataset.id)
            .then((url) => url && push(url))
            .catch(noop)
    }

    const getTabTippyContent = (title: string) => {
        const _titleSplit = title.split('/')

        return (
            <div className="w-100">
                <h2 className="fs-12 fw-6 lh-18 m-0 dc__word-break">{_titleSplit[0]}</h2>
                {_titleSplit[1] && <p className="fs-12 fw-4 lh-18 mt-4 mb-0 dc__word-break">{_titleSplit[1]}</p>}
            </div>
        )
    }

    const renderTab = (tab: DynamicTabType, idx: number, isFixed?: boolean) => {
        const _showNameOnSelect = tab.showNameOnSelect && tab.isAlive && !tab.hideName

        const renderWithTippy: (children: JSX.Element) => React.ReactNode = (children) => (
            <Tippy
                className="default-tt dc__mxw-300 dc__mnw-100"
                arrow={false}
                placement="top"
                duration={[600, 0]}
                moveTransition="transform 0.1s ease-out"
                content={getTabTippyContent(tab.title)}
            >
                {children}
            </Tippy>
        )
        return (
            <Fragment key={`${idx}-tab`}>
                <div className={!tab.isSelected ? 'dynamic-tab__border' : ''} />
                <ConditionalWrap condition={!isFixed} wrap={renderWithTippy}>
                    <div
                        id={tab.name}
                        className={`${isFixed ? 'fixed-tab' : 'dynamic-tab'} flex dc__gap-5 cn-9 ${
                            tab.isSelected ? 'dynamic-tab-selected' : ''
                        }`}
                    >
                        {getTabNavLink(tab)}
                        {_showNameOnSelect && (
                            <button
                                type="button"
                                className="dc__unset-button-styles pr-12"
                                aria-label={`Stop tab ${tab.name}`}
                                onClick={handleTabStopAction}
                                data-id={tab.id}
                            >
                                <div className="dynamic-tab__close flex br-4">
                                    <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                                </div>
                            </button>
                        )}
                        {!isFixed && (
                            <button
                                type="button"
                                className="dc__unset-button-styles pr-12"
                                aria-label={`Close tab ${tab.name}`}
                                onClick={handleTabCloseAction}
                                data-id={tab.id}
                            >
                                <div className="dynamic-tab__close flex br-4">
                                    <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                                </div>
                            </button>
                        )}
                    </div>
                </ConditionalWrap>
            </Fragment>
        )
    }

    const highLightText = (highlighted: string) => `<mark>${highlighted}</mark>`

    const tabsOption = (props: OptionProps<OptionType & DynamicTabType>) => {
        const { selectProps, data } = props
        selectProps.styles.option = getCustomOptionSelectionStyle({
            display: 'flex',
            alignItems: 'center',
        })

        const splittedLabel = data.label.split('/')
        const regex = new RegExp(tabSearchText, 'gi')

        return (
            <div onClick={stopPropagation}>
                <components.Option {...props}>
                    <div className="tab-option__select dc__highlight-text">
                        <small
                            className="cn-7"
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                                __html: splittedLabel[0].replace(regex, highLightText),
                            }}
                        />
                        {splittedLabel[1] && (
                            <div
                                className="w-100 dc__ellipsis-right"
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{
                                    __html: splittedLabel[1].replace(regex, highLightText),
                                }}
                            />
                        )}
                    </div>
                    <button
                        type="button"
                        className="dc__unset-button-styles"
                        aria-label={`Close tab ${data.name}`}
                        onClick={handleTabCloseAction}
                        data-id={data.id}
                    >
                        <div className="dynamic-tab__close icon-dim-16 flex br-5 ml-auto">
                            <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                        </div>
                    </button>
                </components.Option>
            </div>
        )
    }

    const handleOnChangeSearchText = (newValue: string, actionMeta: InputActionMeta) => {
        if ((actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') && actionMeta.prevInputValue) {
            setTabSearchText(actionMeta.prevInputValue)
        } else {
            setTabSearchText(newValue)
        }
    }

    const focusSearchTabInput = () => {
        moreButtonRef.current?.inputRef?.focus()
    }

    const clearSearchInput = () => {
        setTabSearchText('')
        focusSearchTabInput()
    }

    const onChangeTab = (option: DynamicTabType): void => {
        if (option) {
            setSelectedTab(option)
            setIsMenuOpen(false)
            markTabActiveById(option.id)
            push(option.url)
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen((isOpen) => !isOpen)
        setTabSearchText('')
    }

    const escHandler = (e: React.KeyboardEvent) => {
        if (e.key !== 'Escape') {
            return
        }
        closeMenu()
    }

    const updateOnStaleData = (now: Dayjs) => {
        if (!now || !checkIfDataIsStale(selectedTab.lastSyncMoment, now)) {
            /* NOTE: if new state value is same as old state value setState is a noop */
            setIsDataStale(false)
            return
        }
        setIsDataStale(true)
    }

    const timerTranspose = (output: string) => (
        <>
            <Tippy className="default-tt" arrow={false} placement="top" content="Sync Now">
                <span>
                    <RefreshIcon
                        data-testid="refresh-icon"
                        className="icon-dim-16 scn-6 flexbox mr-6 cursor ml-12"
                        onClick={refreshData}
                    />
                </span>
            </Tippy>
            {selectedTab?.name === AppDetailsTabs.k8s_Resources && (
                <div className="flex">
                    {output}
                    <span className="ml-2">ago</span>
                </div>
            )}
        </>
    )

    const timerForSync = () =>
        selectedTab && (
            <Timer
                key={selectedTab.componentKey}
                start={selectedTab.lastSyncMoment}
                callback={updateOnStaleData}
                transition={timerTransition}
                transpose={timerTranspose}
            />
        )

    return (
        <div ref={tabsSectionRef} className="dynamic-tabs-section flexbox pl-12 pr-12 w-100 dc__outline-none-imp">
            {tabsData.fixedTabs.length > 0 && (
                <div ref={fixedContainerRef} className="fixed-tabs-container">
                    {tabsData.fixedTabs.map((tab, idx) => renderTab(tab, idx, true))}
                </div>
            )}
            {tabsData.dynamicTabs.length > 0 && (
                <div
                    className={`dynamic-tabs-container ${tabsData.dynamicTabs[0].isSelected || tabsData.fixedTabs[tabsData.fixedTabs.length - 1].isSelected ? '' : 'dc__border-left'}`}
                >
                    {tabsData.dynamicTabs.map((tab, idx) => renderTab(tab, idx))}
                </div>
            )}
            {(tabsData.dynamicTabs.length > 0 || (!hideTimer && selectedTab?.id !== CLUSTER_TERMINAL_TAB)) && (
                <div
                    className={`ml-auto flexbox dc__no-shrink dc__align-self-stretch ${tabsData.dynamicTabs[(tabsData.dynamicTabs?.length || 0) - 1]?.isSelected ? '' : 'dc__border-left'}`}
                >
                    {!hideTimer && selectedTab?.id !== CLUSTER_TERMINAL_TAB && (
                        <div className="flexbox fw-6 cn-7 dc__align-items-center">{timerForSync()}</div>
                    )}

                    {tabsData.dynamicTabs.length > 0 && (
                        <MoreButtonWrapper
                            tabPopupMenuRef={tabPopupMenuRef}
                            isMenuOpen={isMenuOpen}
                            onClose={closeMenu}
                            toggleMenu={toggleMenu}
                        >
                            <div
                                className="more-tabs__search-icon icon-dim-16 cursor-text"
                                onClick={focusSearchTabInput}
                            >
                                <SearchIcon className="icon-dim-16" />
                            </div>
                            <ReactSelect
                                ref={moreButtonRef}
                                placeholder="Search tabs"
                                classNamePrefix="tab-search-select"
                                options={tabsData.dynamicTabs}
                                value={selectedTab}
                                inputValue={tabSearchText}
                                onChange={onChangeTab}
                                onKeyDown={escHandler}
                                onInputChange={handleOnChangeSearchText}
                                tabSelectsValue={false}
                                backspaceRemovesValue={false}
                                controlShouldRenderValue={false}
                                hideSelectedOptions={false}
                                menuIsOpen
                                autoFocus
                                noOptionsMessage={noMatchingTabs}
                                components={{
                                    IndicatorSeparator: null,
                                    DropdownIndicator: null,
                                    Option: tabsOption,
                                    Menu: TabsMenu,
                                }}
                                styles={COMMON_TABS_SELECT_STYLES}
                            />
                            <div className="more-tabs__clear-tab-search icon-dim-16 cursor">
                                {tabSearchText && (
                                    <ClearIcon
                                        className="clear-tab-search-icon icon-dim-16"
                                        onClick={clearSearchInput}
                                    />
                                )}
                            </div>
                        </MoreButtonWrapper>
                    )}
                </div>
            )}
        </div>
    )
}

export default DynamicTabs
