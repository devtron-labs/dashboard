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

import React, { cloneElement, RefCallback, useMemo, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { Dayjs } from 'dayjs'
import {
    ConditionalWrap,
    noop,
    DynamicTabType,
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ButtonStyleType,
    logExceptionToSentry,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICCross } from '@Icons/ic-cross.svg'
import { ReactComponent as ICArrowClockwise } from '@Icons/ic-arrow-clockwise.svg'
import { checkIfDataIsStale, getClassNameForVariant } from './utils'
import { DynamicTabsProps } from './types'
import { timerTransition } from './DynamicTabs.component'
import Timer from './DynamicTabs.timer'
import DynamicTabsSelect from './DynamicTabsSelect'
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
    tabs = [],
    variant,
    removeTabByIdentifier,
    markTabActiveById,
    stopTabByIdentifier,
    setIsDataStale = noop,
    timerConfig,
    iconsConfig = {},
}: DynamicTabsProps) => {
    const { push } = useHistory()

    const dynamicTabsContainerRef = useRef<HTMLDivElement>(null)

    const { fixedTabs, dynamicTabs, selectedTab } = useMemo(
        () => ({
            fixedTabs: tabs.filter((tab) => tab.type === 'fixed'),
            dynamicTabs: tabs.filter((tab) => tab.type === 'dynamic'),
            selectedTab: tabs.find((tab) => tab.isSelected) ?? null,
        }),
        [tabs],
    )
    const selectedTabTimerConfig = selectedTab && timerConfig ? timerConfig[selectedTab.id] : null

    const getMarkTabActiveHandler = (tab: DynamicTabType) => () => {
        markTabActiveById(tab.id)
            .then((isFound) => {
                if (isFound) {
                    push(tab.url)
                    return
                }

                logExceptionToSentry('Tried to mark a tab active which was not found!')
            })
            .catch(noop)
    }

    const getTabNavLink = (tab: DynamicTabType) => {
        const { name, isSelected, dynamicTitle, title, showNameOnSelect, isAlive, hideName } = tab
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
                <div className={`px-12 dc__ellipsis-right flex dc__gap-8 ${!shouldRenderTitle ? 'py-10' : 'py-8'}`}>
                    {iconsConfig[tab.id] &&
                        cloneElement(iconsConfig[tab.id], {
                            className: `icon-dim-16 ${iconsConfig[tab.id].props.className}`,
                        })}
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

    const selectedTabRefCallback: RefCallback<HTMLDivElement> = (node) => {
        if (!node || node.dataset.isSelected !== 'true' || !dynamicTabsContainerRef.current) {
            return
        }

        // NOTE: we can't use scrollIntoView since that will also scroll it vertically
        // therefore we need to conditionally scroll and that too in the horizontal direction only
        const { right, left } = node.getBoundingClientRect()
        const { right: parentRight, left: parentLeft } = dynamicTabsContainerRef.current.getBoundingClientRect()

        // NOTE: please look into https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
        // for more information what left and right pertain to
        if (left < parentLeft) {
            dynamicTabsContainerRef.current.scrollLeft += left - parentLeft
        }

        if (right > parentRight) {
            dynamicTabsContainerRef.current.scrollLeft += right - parentRight
        }
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

    const getTippyFromConfig = (tippyConfig) => (
        <div className="flexbox-col dc__gap-8 w-200">
            <div className="fs-12 fw-6 lh-18">{tippyConfig.title}</div>
            {tippyConfig.descriptions.map((description) => (
                <div className="fw-4" key={`${description.info}-${description.value}`}>
                    <div className="fs-11 lh-16">{description.info}</div>
                    <div className="fs-12 lh-18">{description.value}</div>
                </div>
            ))}
        </div>
    )

    const renderTab = (tab: DynamicTabType, tippyConfig?: any) => {
        const _showNameOnSelect = tab.showNameOnSelect && tab.isAlive && !tab.hideName
        const isFixed = tab.type === 'fixed'

        const renderWithTippy: (children: JSX.Element) => React.ReactNode = (children) => (
            <Tippy
                className="default-tt dc__mxw-300 dc__mnw-100"
                arrow={false}
                placement="top"
                duration={[600, 0]}
                moveTransition="transform 0.1s ease-out"
                content={tippyConfig ? getTippyFromConfig(tippyConfig) : getTabTippyContent(tab.title)}
            >
                {children}
            </Tippy>
        )

        return (
            <ConditionalWrap key={tab.id} condition={!isFixed} wrap={renderWithTippy}>
                <div
                    ref={selectedTabRefCallback}
                    data-is-selected={tab.isSelected}
                    id={tab.name}
                    className={`${isFixed ? 'fixed-tab' : 'dynamic-tab'} flex dc__gap-5 cn-9 ${tab.isSelected ? 'dynamic-tab-selected bg__primary' : ''}`}
                >
                    {getTabNavLink(tab)}
                    {_showNameOnSelect && (
                        <button
                            type="button"
                            // NOTE: need dc__zi-2 because the before pseudo class renders
                            // the rounded corners and it has a z-index of 1
                            className="dc__unset-button-styles pr-12 dc__zi-2"
                            aria-label={`Stop tab ${tab.name}`}
                            onClick={handleTabStopAction}
                            data-id={tab.id}
                        >
                            <div className="dynamic-tab__close flex br-4">
                                <ICCross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                            </div>
                        </button>
                    )}
                    {!isFixed && (
                        <button
                            type="button"
                            // NOTE: need dc__zi-2 because the before pseudo class renders
                            // the rounded corners and it has a z-index of 1
                            className="dc__unset-button-styles pr-12 dc__zi-2"
                            aria-label={`Close tab ${tab.name}`}
                            onClick={handleTabCloseAction}
                            data-id={tab.id}
                        >
                            <div className="dynamic-tab__close flex br-4">
                                <ICCross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                            </div>
                        </button>
                    )}
                </div>
            </ConditionalWrap>
        )
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
        <div className="flexbox dc__gap-6 dc__align-items-center dc__no-shrink">
            {selectedTabTimerConfig.reload && (
                <Button
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.xs}
                    style={ButtonStyleType.neutral}
                    isLoading={selectedTabTimerConfig.isLoading ?? false}
                    icon={<ICArrowClockwise />}
                    dataTestId="refresh-icon"
                    onClick={selectedTabTimerConfig.reload}
                    ariaLabel="Sync now"
                />
            )}
            {selectedTabTimerConfig.showTimeSinceLastSync && <span>{output}&nbsp;ago</span>}
        </div>
    )

    return (
        <div
            className={`dynamic-tabs-section ${getClassNameForVariant(variant)} flexbox pl-12 pr-12 w-100 dc__outline-none-imp h-36 w-100 dc__box-shadow`}
        >
            <div
                className={`dc__separated-flexbox dc__separated-flexbox--tight ${dynamicTabs.length ? 'separator separator-right' : ''}`}
            >
                {fixedTabs.map((tab) => renderTab(tab, fixedTabs.length))}
            </div>
            <div
                className="flex-grow-1 dynamic-tabs-container dc__separated-flexbox dc__separated-flexbox--tight"
                ref={dynamicTabsContainerRef}
            >
                {dynamicTabs.map((tab) => renderTab(tab, tab.tippyConfig))}
            </div>
            {(dynamicTabs.length > 0 || selectedTabTimerConfig) && (
                <div className="flexbox dc__no-shrink dc__gap-12 pl-12 separator-left separator dc__align-items-center">
                    {selectedTabTimerConfig && (
                        <Timer
                            key={selectedTab.componentKey}
                            start={selectedTab.lastSyncMoment}
                            callback={updateOnStaleData}
                            transition={timerTransition}
                            transpose={timerTranspose}
                        />
                    )}

                    {dynamicTabs.length > 0 && (
                        <DynamicTabsSelect
                            tabs={dynamicTabs}
                            getMarkTabActiveHandler={getMarkTabActiveHandler}
                            selectedTab={selectedTab}
                            handleTabCloseAction={handleTabCloseAction}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

export default DynamicTabs
