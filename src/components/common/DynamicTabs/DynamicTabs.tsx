import React, { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { withShortcut, IWithShortcut } from 'react-keybind'
import { stopPropagation, ConditionalWrap, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Cross } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as SearchIcon } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as RefreshIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import Tippy from '@tippyjs/react'
import ReactSelect, { components, GroupBase, InputActionMeta, OptionProps } from 'react-select'
import { getCustomOptionSelectionStyle } from '../../v2/common/ReactSelect.utils'
import { COMMON_TABS_SELECT_STYLES, EMPTY_TABS_DATA, initTabsData } from './Utils'
import { DynamicTabsProps, DynamicTabType, TabsDataType } from './Types'
import { MoreButtonWrapper, noMatchingTabs, TabsMenu } from './DynamicTabs.component'
import Select from 'react-select/dist/declarations/src/Select'
import { AppDetailsTabs } from '../../../components/v2/appDetails/appDetails.store'
import './DynamicTabs.scss'
import moment from 'moment'
import { handleUTCTime,getTimeElapsed } from '../helpers/time'
import {checkIfDataIsStale
} from '../../ResourceBrowser/Utils'
let interval

/**
 * This component enables a way to display dynamic tabs with the following functionalities,
 * - Can make certain tabs fixed
 * - Takes the parent's width as init reference to identify stop width
 * - Shows more options CTA when there's no available width to display all tabs
 * - Scrollable tabs section by default
 *
 * Note: To be used with useTabs hook
 */
function DynamicTabs({
    tabs,
    removeTabByIdentifier,
    stopTabByIdentifier,
    enableShortCut,
    shortcut,
    refreshData,
    loader,
    isOverview,
    lastDataSync,
    setLastDataSyncTimeString,
    isStaleDataRef
}: DynamicTabsProps & IWithShortcut) {
    const { push } = useHistory()
    const tabsSectionRef = useRef<HTMLDivElement>(null)
    const fixedContainerRef = useRef<HTMLDivElement>(null)
    const dynamicWrapperRef = useRef<HTMLUListElement>(null)
    const moreButtonRef = useRef<Select<DynamicTabType, false, GroupBase<DynamicTabType>>>(null)
    const tabRef = useRef<HTMLAnchorElement>(null)
    const [tabsData, setTabsData] = useState<TabsDataType>(EMPTY_TABS_DATA)
    const [selectedTab, setSelectedTab] = useState<DynamicTabType>(null)
    const [tabSearchText, setTabSearchText] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const tabPopupMenuRef = useRef(null)
    const CLUSTER_TERMINAL_TAB = 'cluster_terminal-Terminal'
    const [timeElapsedLastSync, setTimeElapsedLastSync] = useState('')


    useEffect(() => {
        const _lastDataSyncTime = Date()
        const _staleDataCheckTime = moment()
        isStaleDataRef.current = false
        setLastDataSyncTimeString(` ${handleUTCTime(_lastDataSyncTime, true)}`)
        interval = setInterval(() => {
            checkIfDataIsStale(isStaleDataRef, _staleDataCheckTime)
            setLastDataSyncTimeString(` ${handleUTCTime(_lastDataSyncTime, true)}`)
            setTimeElapsedLastSync(getTimeElapsed(_lastDataSyncTime, moment()))
        }, 1000)
        return () => {
            setTimeElapsedLastSync('')
            clearInterval(interval)
        }
    }, [lastDataSync])

    useEffect(() => {
        initTabsData(tabs, setTabsData, setSelectedTab, closeMenu)
    }, [tabs])

    const updateRef = (_node: HTMLAnchorElement) => {
        if (_node?.dataset?.selected === 'true' && _node !== tabRef.current) {
            _node.focus()
            tabRef.current = _node
        }
    }

    const getTabNavLink = (tab: DynamicTabType, isFixed: boolean) => {
        const { name, url, isDeleted, isSelected, iconPath, dynamicTitle, showNameOnSelect } = tab
        const _showNameOnSelect = showNameOnSelect ? !!url.split('?')[1] : true
        let tabName = dynamicTitle || name

        return (
            <NavLink
                to={url}
                ref={updateRef}
                className={`dynamic-tab__resource cursor cn-9 dc__no-decor dc__outline-none-imp dc__ellipsis-right pl-12 pt-8 pb-8 ${
                    isFixed ? 'pr-12' : 'pr-8'
                } w-100`}
                data-selected={isSelected}
            >
                <div
                    className={`flex left ${isSelected ? 'cn-9' : ''} ${isDeleted ? 'dynamic-tab__deleted cr-5' : ''}`}
                >
                    {iconPath && <img className="icon-dim-16" src={iconPath} alt={name} />}
                    {_showNameOnSelect && (
                        <span
                            className={`fs-12 fw-6 lh-20 dc__ellipsis-right ${iconPath ? 'ml-8' : ''} `}
                            data-testid={name}
                        >
                            {tabName}
                        </span>
                    )}
                </div>
            </NavLink>
        )
    }

    const handleTabCloseAction = (e) => {
        e.stopPropagation()
        const pushURL = removeTabByIdentifier(e.currentTarget.dataset.id)
        setTimeout(() => {
            if (pushURL) {
                push(pushURL)
            }
        }, 1)
    }

    const handleTabStopAction = (e) => {
        e.stopPropagation()
        const pushURL = stopTabByIdentifier(e.currentTarget.dataset.title)
        setTimeout(() => {
            if (pushURL) {
                push(pushURL)
            }
        }, 1)
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
        const _showNameOnSelect = (tab.isSelected || !!tab.url.split('?')[1]) && isFixed && tab.showNameOnSelect

        return (
            <Fragment key={`${idx}-tab`}>
                <li
                    id={tab.name}
                    className={`${isFixed ? 'fixed-tab' : 'dynamic-tab'}  flex left flex-grow-1 ${
                        tab.isSelected ? 'dynamic-tab__item-selected' : ''
                    }`}
                >
                    <ConditionalWrap
                        condition={!isFixed}
                        wrap={(children) => (
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
                        )}
                    >
                        <div className="flex w-100">
                            <div
                                className={`w-100 ${
                                    tab.isSelected ? 'dynamic-tab-selected bcn-0 cn-9' : ''
                                } flex left ${isFixed && !_showNameOnSelect ? '' : 'pr-12'} h-36`}
                            >
                                {getTabNavLink(tab, isFixed)}
                                {_showNameOnSelect && (
                                    <div
                                        className="dynamic-tab__close icon-dim-16 flex br-5 ml-auto"
                                        data-title={tab.title}
                                        onClick={handleTabStopAction}
                                    >
                                        <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                                    </div>
                                )}
                                {!isFixed && (
                                    <div
                                        className="dynamic-tab__close icon-dim-16 flex br-5 ml-auto"
                                        data-id={tab.id}
                                        onClick={handleTabCloseAction}
                                    >
                                        <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </ConditionalWrap>
                </li>
                <div className={` ${!tab.isSelected || !(tab.isSelected && idx - 1) ? 'dynamic-tab__border' : ''}`} />
            </Fragment>
        )
    }

    const highLightText = (highlighted) => `<mark>${highlighted}</mark>`

    const tabsOption = (props: OptionProps<any, false, any>) => {
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
                            dangerouslySetInnerHTML={{
                                __html: splittedLabel[0].replace(regex, highLightText),
                            }}
                        />
                        {splittedLabel[1] && (
                            <div
                                className="w-100 dc__ellipsis-right"
                                dangerouslySetInnerHTML={{
                                    __html: splittedLabel[1].replace(regex, highLightText),
                                }}
                            />
                        )}
                    </div>
                    <div
                        className="dynamic-tab__close icon-dim-20 flex br-5 ml-8"
                        data-id={data.id}
                        onClick={handleTabCloseAction}
                    >
                        <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                    </div>
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
            push(option.url)
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen((isOpen) => !isOpen)
        setTabSearchText('')
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
        setTabSearchText('')
    }

    const escHandler = (e: any) => {
        if (e.keyCode === 27 || e.key === 'Escape') {
            closeMenu()
        }
    }
    
    const timerForSync = () => {
        if (loader || !timeElapsedLastSync) {
            return (
                <div className="ml-12 mr-4 flex">
                    <Progressing size={18} />
                    <div className="fs-13 ml-8">Syncing...</div>
                </div>
            )
        } else {
            return (
                <>
                    <Tippy className="default-tt" arrow={false} placement="top" content="Sync Now">
                        <div>
                            <RefreshIcon
                                className="icon-dim-16 scn-6 flexbox mr-6 cursor ml-12"
                                onClick={() => {
                                    clearInterval(interval)
                                    setTimeElapsedLastSync('')
                                    refreshData()
                                }}
                            />
                        </div>
                    </Tippy>
                    {selectedTab?.name === AppDetailsTabs.k8s_Resources && (
                        <div className="flex">{timeElapsedLastSync} ago </div>
                    )}
                </>
            )
        }
    }
    return (
        <div ref={tabsSectionRef} className="dynamic-tabs-section flex left pl-12 pr-12 w-100 dc__outline-none-imp">
            {tabsData.fixedTabs.length > 0 && (
                <div ref={fixedContainerRef} className="fixed-tabs-container">
                    <ul className="fixed-tabs-wrapper flex left p-0 m-0">
                        {tabsData.fixedTabs.map((tab, idx) => renderTab(tab, idx, true))}
                    </ul>
                </div>
            )}
            {tabsData.dynamicTabs.length > 0 && (
                <div className="dynamic-tabs-container dc__border-left">
                    <ul ref={dynamicWrapperRef} className="dynamic-tabs-wrapper flex left p-0 m-0">
                        {tabsData.dynamicTabs.map((tab, idx) => renderTab(tab, idx))}
                    </ul>
                </div>
            )}
            <div className="ml-auto flexbox dc__no-shrink dc__align-self-stretch dc__border-left">
                {!isOverview && selectedTab?.id !== CLUSTER_TERMINAL_TAB && (
                    <div className="flexbox fw-6 cn-7 dc__align-items-center">{timerForSync()}</div>
                )}

                {tabsData.dynamicTabs.length > 0 && (
                    <MoreButtonWrapper
                        tabPopupMenuRef={tabPopupMenuRef}
                        isMenuOpen={isMenuOpen}
                        onClose={closeMenu}
                        toggleMenu={toggleMenu}
                    >
                        <div className="more-tabs__search-icon icon-dim-16 cursor-text" onClick={focusSearchTabInput}>
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
                                <ClearIcon className="clear-tab-search-icon icon-dim-16" onClick={clearSearchInput} />
                            )}
                        </div>
                    </MoreButtonWrapper>
                )}
            </div>
        </div>
    )
}

export default withShortcut(DynamicTabs)
