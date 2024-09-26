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
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import { DynamicTabs } from '..'
import {
    dynamicTabsData,
    fixedTabsData,
    mockedRemoveTabByIdentifier,
    tabsData,
} from '../__mocks__/DynamicTabs.mock'

describe('DynamicTabs component', () => {
    it('Component renders properly', () => {
        const { container } = render(
            <DynamicTabs tabs={[]} removeTabByIdentifier={jest.fn()} stopTabByIdentifier={jest.fn()} />,
            {
                wrapper: BrowserRouter,
            },
        )

        expect(container.querySelector('.dynamic-tabs-section')).toBeInTheDocument()
        expect(container.querySelector('.fixed-tabs-container')).not.toBeInTheDocument()
        expect(container.querySelector('.dynamic-tabs-container')).not.toBeInTheDocument()
        expect(container.querySelector('.more-tabs-wrapper')).not.toBeInTheDocument()
    })

    it('Fixed tabs are rendered but no dynamic tabs', () => {
        const { container, getByText } = render(
            <DynamicTabs tabs={fixedTabsData} removeTabByIdentifier={jest.fn()} stopTabByIdentifier={jest.fn()} />,
            {
                wrapper: BrowserRouter,
            },
        )

        expect(container.querySelector('.fixed-tabs-container')).toBeInTheDocument()
        expect(container.querySelector('.fixed-tabs-wrapper')?.children).toHaveLength(2) // 1 tab + 1 border
        expect(container.querySelector('.fixed-tab')).toBeInTheDocument()
        expect(getByText('K8s Resources')).toBeInTheDocument()
        expect(container.querySelector('.dynamic-tabs-container')).not.toBeInTheDocument()
        expect(container.querySelector('.more-tabs-wrapper')).not.toBeInTheDocument()
    })

    it('Dynamic tabs are rendered but no fixed tabs', () => {
        const { container, getByText } = render(
            <DynamicTabs tabs={dynamicTabsData} removeTabByIdentifier={jest.fn()} stopTabByIdentifier={jest.fn()} />,
            {
                wrapper: BrowserRouter,
            },
        )

        expect(container.querySelector('.fixed-tabs-container')).not.toBeInTheDocument()
        expect(container.querySelector('.dynamic-tabs-container')).toBeInTheDocument()
        expect(container.querySelector('.more-tabs-wrapper')).toBeInTheDocument()
        expect(container.querySelector('.dynamic-tabs-wrapper')?.children).toHaveLength(6) // 3 tabs + 3 borders
        expect(container.querySelector('.dynamic-tab')).toBeInTheDocument()
        expect(getByText('pod/devtron-nats-0')).toBeInTheDocument()
        expect(getByText('pod/git-sensor-0')).toBeInTheDocument()
        expect(getByText('statefulset/my-release-mariadb')).toBeInTheDocument()
    })

    it('Fixed & Dynamic tabs are rendered properly', () => {
        const { container, getByText } = render(
            <DynamicTabs tabs={tabsData} removeTabByIdentifier={jest.fn()} stopTabByIdentifier={jest.fn()} />,
            {
                wrapper: BrowserRouter,
            },
        )

        expect(container.querySelector('.fixed-tabs-container')).toBeInTheDocument()

        const fixedTabsWrapper = container.querySelector('.fixed-tabs-wrapper') as HTMLElement
        expect(fixedTabsWrapper.children).toHaveLength(2) // 1 tab + 1 border

        // fixedTabsWrapper should contain fixed-tab - `K8s Resources`
        // & should be in selected state
        const fixedTab = fixedTabsWrapper.querySelector('.fixed-tab')
        expect(fixedTab).toBeInTheDocument()
        expect(fixedTab).toHaveClass('dynamic-tab__item-selected')
        expect(getByText('K8s Resources')).toBeInTheDocument()

        expect(container.querySelector('.dynamic-tabs-container')).toBeInTheDocument()
        expect(container.querySelector('.more-tabs-wrapper')).toBeInTheDocument()
        expect(container.querySelector('.dynamic-tabs-wrapper')?.children).toHaveLength(6) // 3 tabs + 3 borders
        expect(container.querySelector('.dynamic-tab')).toBeInTheDocument()
        expect(getByText('pod/devtron-nats-0')).toBeInTheDocument()
        expect(getByText('pod/git-sensor-0')).toBeInTheDocument()
        expect(getByText('statefulset/my-release-mariadb')).toBeInTheDocument()
    })

    it('More tabs option works properly', () => {
        const { container, getByText } = render(
            <DynamicTabs tabs={tabsData} removeTabByIdentifier={jest.fn()} stopTabByIdentifier={jest.fn()} />,
            {
                wrapper: BrowserRouter,
            },
        )

        expect(container.querySelector('.more-tabs-wrapper')).toBeInTheDocument()
        expect(container.querySelector('.more-tabs__menu-wrapper')).not.toBeInTheDocument()
        expect(container.querySelector('.more-tabs__blanket')).not.toBeInTheDocument()

        const moreTabsButton = container.querySelector('.more-tabs-option') as HTMLElement
        expect(moreTabsButton).toBeInTheDocument()
        fireEvent.click(moreTabsButton)

        // After clicking on more tabs button expect the menu to be in open state
        // & related children are rendered
        expect(container.querySelector('.more-tabs__menu-wrapper')).toBeInTheDocument()
        expect(container.querySelector('.more-tabs__blanket')).toBeInTheDocument()

        // Different actions on more tabs select
        const selectControl = container.querySelector('.tab-search-select__control') as HTMLElement
        const selectMenu = container.querySelector('.tab-search-select__menu') as HTMLElement
        const searchTabInput = selectControl.querySelector('.tab-search-select__input') as HTMLElement
        expect(selectControl).toBeInTheDocument()
        expect(searchTabInput).toBeInTheDocument()
        expect(selectMenu).toBeInTheDocument()
        expect(selectMenu.querySelectorAll('.tab-search-select__option')).toHaveLength(3)

        // Search for complete term `pod`. It should highlight term `pod` from pod tab option.
        fireEvent.input(searchTabInput, { target: { value: 'pod' } })
        expect(searchTabInput.getAttribute('value')).toEqual('pod')
        const matchedOptionA = selectMenu.getElementsByClassName('tab-search-select__option')[0]
        expect(matchedOptionA).toBeDefined()
        expect(matchedOptionA.getElementsByTagName('mark')[0]).toHaveTextContent('pod')

        // Search for partial term `state`. It should highlight term `state` from statefulset tab option.
        fireEvent.input(searchTabInput, { target: { value: 'state' } })
        expect(searchTabInput.getAttribute('value')).toEqual('state')
        const matchedOptionB = selectMenu.getElementsByClassName('tab-search-select__option')[0]
        expect(matchedOptionB).toBeDefined()
        expect(matchedOptionB.getElementsByTagName('mark')[0]).toHaveTextContent('state')

        // Search for term `git-sensor-1` which is not present in options &
        // select should show noMatchingTabs message
        fireEvent.input(searchTabInput, { target: { value: 'git-sensor-1' } })
        expect(searchTabInput.getAttribute('value')).toEqual('git-sensor-1')
        const matchedOptionC = selectMenu.getElementsByClassName('tab-search-select__option')[0]
        expect(matchedOptionC).toBeUndefined()
        expect(getByText('No matching tabs')).toBeInTheDocument()

        // After clicking outside expect the menu to be in closed state
        // & related children are not rendered
        fireEvent.click(container.querySelector('.more-tabs__blanket') as HTMLElement)
        expect(container.querySelector('.more-tabs__menu-wrapper')).not.toBeInTheDocument()
        expect(container.querySelector('.more-tabs__blanket')).not.toBeInTheDocument()
    })

    it('Dynamic tab close action works properly', () => {
        let _tabsData = [...tabsData]
        const _removeTabByIdentifier = (title) => {
            const { pushURL, updatedTabsData } = mockedRemoveTabByIdentifier(title, tabsData)
            _tabsData = updatedTabsData
            return pushURL
        }

        const { container, rerender } = render(
            <DynamicTabs
                tabs={_tabsData}
                removeTabByIdentifier={_removeTabByIdentifier}
                stopTabByIdentifier={jest.fn()}
            />,
            {
                wrapper: BrowserRouter,
            },
        )

        expect(_tabsData).toHaveLength(4) // 1 fixed tab & 3 dynamic tabs
        expect(container.querySelector('.dynamic-tabs-container')).toBeInTheDocument()

        const dynamicTabsWrapper = container.querySelector('.dynamic-tabs-wrapper') as HTMLElement
        expect(dynamicTabsWrapper.children).toHaveLength(6) // 3 tabs + 3 borders
        const dynamicTabA = dynamicTabsWrapper.querySelectorAll('.dynamic-tab')[0]
        expect(dynamicTabA).toBeInTheDocument()
        fireEvent.click(dynamicTabA.querySelector('.dynamic-tab__close') as HTMLElement)

        // Re-render component with updated tabs data
        rerender(
            <DynamicTabs
                tabs={_tabsData}
                removeTabByIdentifier={_removeTabByIdentifier}
                stopTabByIdentifier={jest.fn()}
            />,
        )
        expect(_tabsData).toHaveLength(3) // 1 fixed tab & 2 dynamic tabs
        expect((container.querySelector('.dynamic-tabs-wrapper') as HTMLElement).children).toHaveLength(4) // 2 tabs + 2 borders
    })
})
