import React, { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink, useHistory, useParams } from 'react-router-dom'
import { stopPropagation, ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Cross } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as SearchIcon } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-error.svg'
import Tippy from '@tippyjs/react'
import ReactSelect, { components, GroupBase, InputActionMeta, OptionProps } from 'react-select'
import { getCustomOptionSelectionStyle } from '../../v2/common/ReactSelect.utils'
import { COMMON_TABS_SELECT_STYLES, EMPTY_TABS_DATA, initTabsData } from './Utils'
import { DynamicTabsProps, DynamicTabType, TabsDataType } from './Types'
import { MoreButtonWrapper, noMatchingTabs, TabsMenu } from './DynamicTabs.component'
import Select from 'react-select/dist/declarations/src/Select'
import './DynamicTabs.scss'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'

/**
 * This component enables a way to display dynamic tabs with the following functionalities,
 * - Can make certain tabs fixed
 * - Takes the parent's width as init reference to identify stop width
 * - Shows more options CTA when there's no available width to display all tabs
 * - Scrollable tabs section by default
 *
 * Note: To be used with useTabs hook
 */
export function DynamicTabs({ tabs, removeTabByIdentifier, stopTabByIdentifier }: DynamicTabsProps) {
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
                    {iconPath && <img className="icon-dim-16 mr-8" src={iconPath} alt={name} />}
                    {_showNameOnSelect && <span className="fs-12 fw-6 lh-20 dc__ellipsis-right" data-testid={name}>
                        {tabName}
                    </span>}
                </div>
            </NavLink>
        )
    }

    const handleTabCloseAction = (e) => {
        e.stopPropagation()
        const pushURL = removeTabByIdentifier(e.currentTarget.dataset.title)
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
        const _showNameOnSelect = (tab.isSelected || !!tab.url.split('?')[1] ) && isFixed && tab.showNameOnSelect
        
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
                                        data-title={tab.title}
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
                        data-title={data.title}
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
                <>
                    <div
                        className="dynamic-tabs-container dc__border-left dc__border-right"
                        style={{
                            width: fixedContainerRef.current
                                ? `calc(100% - ${fixedContainerRef.current.offsetWidth + 32}px)`
                                : 'calc(100% - 32px)',
                        }}
                    >
                        <ul ref={dynamicWrapperRef} className="dynamic-tabs-wrapper flex left p-0 m-0">
                            {tabsData.dynamicTabs.map((tab, idx) => renderTab(tab, idx))}
                        </ul>
                    </div>
                    <MoreButtonWrapper isMenuOpen={isMenuOpen} onClose={closeMenu} toggleMenu={toggleMenu}>
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
                </>
            )}
        </div>
    )
}
