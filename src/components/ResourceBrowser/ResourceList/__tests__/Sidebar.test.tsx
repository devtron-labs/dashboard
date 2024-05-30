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
import {
    AppSelectedResource,
    handleGroupHeadingClick,
    K8SObjectMap,
    PodSelectedResource,
} from '../__mocks__/Sidebar.mock'
import Sidebar from '../Sidebar'
import { IWithShortcut, ShortcutProvider, withShortcut } from 'react-keybind'
import { BrowserRouter } from 'react-router-dom'
import { K8SObjectMapType, SidebarType } from '../../Types'

describe('Sidebar component', () => {
    const SidebarComponentWithShortcut = withShortcut((props: SidebarType & IWithShortcut) => <Sidebar {...props} />)
    const SidebarComponentWithProvider = (props: SidebarType & IWithShortcut) => {
        return (
            <ShortcutProvider>
                <SidebarComponentWithShortcut {...props} />
            </ShortcutProvider>
        )
    }

    it('Component renders properly', () => {
        const { container, getByText } = render(
            <SidebarComponentWithProvider
                k8SObjectMap={K8SObjectMap}
                selectedResource={PodSelectedResource}
                handleGroupHeadingClick={jest.fn}
                setSelectedResource={jest.fn}
                updateResourceSelectionData={jest.fn}
                isCreateModalOpen={false}
            />,
            {
                wrapper: BrowserRouter,
            },
        )

        const sideBarContainer = container.querySelector('.k8s-object-container')
        expect(sideBarContainer).toBeInTheDocument()

        const kindSearchWrapper = sideBarContainer?.querySelector('.k8s-object-kind-search')
        expect(kindSearchWrapper).toBeInTheDocument()

        const sideBarWrapper = sideBarContainer?.querySelector('.k8s-object-wrapper')
        expect(sideBarWrapper).toBeInTheDocument()
        expect(getByText('Workloads')).toHaveClass('fs-14 fw-6 pointer w-100 pt-6 pb-6')
    })

    it('Parent kind group render & click action', () => {
        const _k8SObjectMap = new Map<string, K8SObjectMapType>(K8SObjectMap)
        const Component = (
            <SidebarComponentWithProvider
                k8SObjectMap={_k8SObjectMap}
                selectedResource={PodSelectedResource}
                handleGroupHeadingClick={(e) => handleGroupHeadingClick(e, _k8SObjectMap)}
                setSelectedResource={jest.fn()}
                updateResourceSelectionData={jest.fn()}
                isCreateModalOpen={false}
            />
        )
        const { container, rerender } = render(Component, {
            wrapper: BrowserRouter,
        })
        const k8sObjectWrapper = container.querySelector('.k8s-object-wrapper')
        const workloadsGroup = k8sObjectWrapper?.querySelector('[data-group-name="Workloads"]')
        if (workloadsGroup) {
            expect(handleGroupHeadingClick).not.toHaveBeenCalled()
            expect(k8sObjectWrapper?.querySelector('[data-kind="Pod"]')).toBeInTheDocument()

            // Click on `Workloads` & collapse the parent group
            fireEvent.click(workloadsGroup)
            expect(handleGroupHeadingClick).toHaveBeenCalled()

            rerender(Component)
            expect(k8sObjectWrapper?.querySelector('[data-kind="Pod"]')).not.toBeInTheDocument()
        }
    })

    it('Child kind group render & click action', () => {
        const _k8SObjectMap = new Map<string, K8SObjectMapType>(K8SObjectMap)
        const Component = (
            <SidebarComponentWithProvider
                k8SObjectMap={_k8SObjectMap}
                selectedResource={AppSelectedResource}
                handleGroupHeadingClick={(e) => handleGroupHeadingClick(e, _k8SObjectMap)}
                setSelectedResource={jest.fn()}
                updateResourceSelectionData={jest.fn()}
                isCreateModalOpen={false}
            />
        )
        const { container, getByText, rerender } = render(Component, {
            wrapper: BrowserRouter,
        })
        const k8sObjectWrapper = container.querySelector('.k8s-object-wrapper')
        const customResourceGroup = k8sObjectWrapper?.querySelector('[data-group-name="Custom Resource"]')

        if (customResourceGroup) {
            // Click on `Custom Resource` & expand the parent group
            fireEvent.click(customResourceGroup)
            expect(handleGroupHeadingClick).toHaveBeenCalled()

            rerender(Component)
            const appKindGroup = k8sObjectWrapper?.querySelector('[data-group-name="Custom Resource/App"]')

            if (appKindGroup) {
                // Click on `Custom Resource > App` & expand the child group
                fireEvent.click(appKindGroup)

                rerender(Component)
                expect(getByText('catalog.cattle.io')).toBeInTheDocument()
            }
        }
    })

    it('Kind search input actions', () => {
        const { container } = render(
            <SidebarComponentWithProvider
                k8SObjectMap={K8SObjectMap}
                selectedResource={PodSelectedResource}
                handleGroupHeadingClick={jest.fn}
                setSelectedResource={jest.fn}
                updateResourceSelectionData={jest.fn}
                isCreateModalOpen={false}
            />,
            {
                wrapper: BrowserRouter,
            },
        )

        const kindSearchWrapper = container.getElementsByClassName('k8s-object-kind-search')[0]
        const searchKindInput = kindSearchWrapper.getElementsByClassName('kind-search-select__input')[0]

        // Search for term `Po`
        fireEvent.input(searchKindInput, { target: { value: 'Po' } })
        expect(searchKindInput.getAttribute('value')).toEqual('Po')
        const matchedOptionA = kindSearchWrapper.getElementsByClassName('kind-search-select__option')[0]
        expect(matchedOptionA).toBeDefined()
        expect(matchedOptionA.getElementsByTagName('mark')[0]).toHaveTextContent('Po')

        // Search for term `Pod`
        fireEvent.input(searchKindInput, { target: { value: 'Pod' } })
        expect(searchKindInput.getAttribute('value')).toEqual('Pod')
        const matchedOptionB = kindSearchWrapper.getElementsByClassName('kind-search-select__option')[0]
        expect(matchedOptionB).toBeDefined()
        expect(matchedOptionB.getElementsByTagName('mark')[0]).toHaveTextContent('Pod')

        // Search for term `Pods`
        fireEvent.input(searchKindInput, { target: { value: 'Pods' } })
        expect(searchKindInput.getAttribute('value')).toEqual('Pods')
        const matchedOptionC = kindSearchWrapper.getElementsByClassName('kind-search-select__option')[0]
        expect(matchedOptionC).toBeUndefined()

        // Clear input value on blur
        fireEvent.blur(searchKindInput)
        expect(searchKindInput.getAttribute('value')).toEqual('')
    })
})
