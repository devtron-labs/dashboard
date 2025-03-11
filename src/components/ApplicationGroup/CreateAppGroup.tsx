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

import { useEffect, useRef, useState } from 'react'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ConditionalWrap,
    CustomInput,
    Drawer,
    GenericEmptyState,
    Progressing,
    SearchBar,
    showError,
    stopPropagation,
    TabGroup,
    TabProps,
    Textarea,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as CheckIcon } from '../../assets/icons/ic-check.svg'
import { ReactComponent as Abort } from '../../assets/icons/ic-abort.svg'
import Info from '../../assets/icons/ic-info-outline-grey.svg'
import { CreateGroupType, CreateTypeOfAppListType, FilterParentType } from './AppGroup.types'
import { CreateGroupTabs, CREATE_GROUP_TABS, FILTER_NAME_REGEX } from './Constants'
import { createEnvGroup } from './AppGroup.service'

export default function CreateAppGroup({
    appList,
    selectedAppGroup,
    closePopup,
    unAuthorizedApps,
    filterParentType,
}: CreateGroupType) {
    const { appId, envId } = useParams<{ appId: string; envId: string }>()
    const CreateGroupRef = useRef<HTMLDivElement>(null)
    const [isLoading, setLoading] = useState(false)
    const [showErrorMsg, setShowErrorMsg] = useState(false)
    const [appGroupName, setAppGroupName] = useState<string>(selectedAppGroup?.label ?? '')
    const [appGroupDescription, setAppGroupDescription] = useState<string>(selectedAppGroup?.description ?? '')
    const [selectedTab, setSelectedTab] = useState<CreateGroupTabs>(
        filterParentType === FilterParentType.app ? CreateGroupTabs.SELECTED_ENV : CreateGroupTabs.SELECTED_APPS,
    )
    const [allAppSearchText, setAllAppSearchText] = useState('')
    const [selectedAppSearchText, setSelectedAppSearchText] = useState('')
    const [selectedAppsMap, setSelectedAppsMap] = useState<Record<string, boolean>>({})
    const [selectedAppsCount, setSelectedAppsCount] = useState<number>(0)
    const [unauthorizedAppList, setUnauthorizedAppList] = useState<CreateTypeOfAppListType[]>([])
    const [authorizedAppList, setAuthorizedAppList] = useState<CreateTypeOfAppListType[]>([])

    const filterParentTypeMsg = filterParentType === FilterParentType.app ? 'environment' : 'application'
    const outsideClickHandler = (evt): void => {
        if (
            CreateGroupRef.current &&
            !CreateGroupRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closePopup(evt)
        }
    }

    const validateName = (name: string) => {
        if (!name) {
            return
        }
        if (!FILTER_NAME_REGEX.test(name) || name.length > 30) {
            // regex doesn't check of max length = 30
            setShowErrorMsg(true)
        } else {
            setShowErrorMsg(false)
        }
    }

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    useEffect(() => {
        if (appList?.length) {
            let _selectedAppsCount = 0
            const _selectedAppsMap: Record<string, boolean> = {}
            for (const app of appList) {
                if (app.isSelected) {
                    _selectedAppsMap[app.id] = true
                    _selectedAppsCount++
                }
            }
            setSelectedAppsMap(_selectedAppsMap)
            appFilterList()
            setSelectedAppsCount(_selectedAppsCount)
        }
    }, [appList])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bg__primary py-12 px-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Save filter</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    disabled={isLoading}
                    onClick={closePopup}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const onInputChange = (event): void => {
        if (event.target.name === 'name') {
            validateName(event.target.value)
            setAppGroupName(event.target.value)
        } else {
            setAppGroupDescription(event.target.value)
        }
    }

    const removeAppSelection = (e): void => {
        stopPropagation(e)
        const _selectedAppsMap = { ...selectedAppsMap }
        if (_selectedAppsMap[e.currentTarget.dataset.appId]) {
            delete _selectedAppsMap[e.currentTarget.dataset.appId]
            setSelectedAppsMap(_selectedAppsMap)
            appFilterAuthorizedList()
            setSelectedAppsCount(selectedAppsCount - 1)
        }
    }

    const appFilterAuthorizedList = () => {
        const _authorizedApp = []
        appList.forEach((app) => {
            if (!unAuthorizedApps.get(app.appName)) {
                _authorizedApp.push({ id: app.id, appName: app.appName })
            }
        })
        setAuthorizedAppList(_authorizedApp)
    }

    const toggleAppSelection = (appId: string): void => {
        const _selectedAppsMap = { ...selectedAppsMap }
        let _selectedAppsCount = selectedAppsCount
        if (!_selectedAppsMap[appId]) {
            _selectedAppsMap[appId] = true
            _selectedAppsCount += 1
        } else {
            delete _selectedAppsMap[appId]
            _selectedAppsCount -= 1
        }
        setSelectedAppsMap(_selectedAppsMap)
        appFilterAuthorizedList()
        setSelectedAppsCount(_selectedAppsCount)
    }

    const appFilterList = () => {
        const _authorizedAppList = []
        const _unauthorizedAppList = []
        appList.forEach((app) => {
            unAuthorizedApps.get(app.appName)
                ? _unauthorizedAppList.push({ id: app.id, appName: app.appName })
                : _authorizedAppList.push({ id: app.id, appName: app.appName })
        })
        setUnauthorizedAppList(_unauthorizedAppList)
        setAuthorizedAppList(_authorizedAppList)
    }

    const renderEmptyState = (): JSX.Element => {
        return (
            <div className="flex-grow-1">
                <GenericEmptyState title="No matching results" image={Info} imageClassName="h-20 scn-6" />
            </div>
        )
    }

    const renderSelectedApps = (): JSX.Element => {
        const filteredAuthList = authorizedAppList.filter(
            (app) =>
                selectedAppsMap[app.id] && (!selectedAppSearchText || app.appName.indexOf(selectedAppSearchText) >= 0),
        )
        const filteredUnAuthList = unauthorizedAppList.filter(
            (app) =>
                selectedAppsMap[app.id] && (!selectedAppSearchText || app.appName.indexOf(selectedAppSearchText) >= 0),
        )

        const handleAppSearchEnterChange = (_searchText: string): void => {
            setSelectedAppSearchText(_searchText)
        }

        return (
            <div className='flexbox-col flex-grow-1'>
                <SearchBar
                    inputProps={{
                        placeholder: `Search ${filterParentTypeMsg}'s`,
                        autoFocus: true,
                    }}
                    initialSearchText={selectedAppSearchText}
                    handleEnter={handleAppSearchEnterChange}
                    dataTestId="create-app-group"
                />
                <div className='flexbox-col flex-grow-1'>
                    {filteredAuthList.length <= 0 && filteredUnAuthList.length <= 0
                        ? renderEmptyState()
                        : filteredAuthList.map((app) => {
                              return (
                                  <div
                                      key={`selected-app-${app.id}`}
                                      className="flex left dc__hover-n50 p-8 fs-13 fw-4 cn-9 selected-app-row cursor"
                                      data-app-id={app.id}
                                      onClick={removeAppSelection}
                                  >
                                      <CheckIcon className="icon-dim-16 cursor check-icon scn-6 mr-8" />
                                      <Close className="icon-dim-16 cursor delete-icon mr-8" />
                                      <span>{app.appName}</span>
                                  </div>
                              )
                          })}
                    {filteredUnAuthList.length > 0 && (
                        <div className="dc__bold ml-4">
                            {`You don't have admin/manager permission for the following ${filterParentTypeMsg}.`}
                        </div>
                    )}
                    {filteredUnAuthList.map((app) => {
                        return (
                            <Tippy
                                key={`selected-app-${app.id}`}
                                className="default-tt w-200"
                                arrow={false}
                                placement="bottom-start"
                                content={`You don't have admin/manager permission for this ${filterParentTypeMsg}.`}
                            >
                                <div>
                                    <div className="flex left dc__hover-n50 p-8 fs-13 fw-4 cn-9 selected-app-row cursor">
                                        <Abort className="mr-8" />
                                        <span>{app.appName}</span>
                                    </div>
                                </div>
                            </Tippy>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderAllApps = (): JSX.Element => {
        const filteredAllApps = appList.filter((app) => !allAppSearchText || app.appName.indexOf(allAppSearchText) >= 0)

        const handleAllAppSearchEnterChange = (_searchText: string): void => {
            setAllAppSearchText(_searchText)
        }

        return (
            <div className='flexbox-col flex-grow-1'>
                <SearchBar
                    inputProps={{
                        placeholder: `Search ${filterParentTypeMsg}'s`,
                        autoFocus: true,
                    }}
                    initialSearchText={allAppSearchText}
                    handleEnter={handleAllAppSearchEnterChange}
                />
                <div className='flexbox-col flex-grow-1'>
                    {filteredAllApps.length <= 0
                        ? renderEmptyState()
                        : filteredAllApps.map((app) => (
                              <ConditionalWrap
                                  condition={unAuthorizedApps.get(app.appName) === true}
                                  wrap={(children) => (
                                      <Tippy
                                          key={`selected-app-${app.id}`}
                                          data-testid="env-tippy"
                                          className="default-tt w-200"
                                          arrow={false}
                                          placement="bottom-start"
                                          content={`You don't have admin/manager permission for this ${filterParentTypeMsg}.`}
                                      >
                                          <div>{children}</div>
                                      </Tippy>
                                  )}
                              >
                                  <Checkbox
                                      key={`app-${app.id}`}
                                      rootClassName="fs-13 pt-8 pr-8 pb-8 mb-0-imp dc__hover-n50"
                                      isChecked={unAuthorizedApps.get(app.appName) ? false : selectedAppsMap[app.id]}
                                      value={CHECKBOX_VALUE.CHECKED}
                                      onChange={() => toggleAppSelection(app.id)}
                                      disabled={!!unAuthorizedApps.get(app.appName)}
                                  >
                                      {app.appName}
                                  </Checkbox>
                              </ConditionalWrap>
                          ))}
                </div>
            </div>
        )
    }

    const onTabChange = (e): void => {
        setSelectedTab(e.currentTarget.dataset.tabName)
    }

    const renderTabItem = (tabName: CreateGroupTabs, appCount: number): TabProps => {
        return {
            id: `${tabName}-tab`,
            label: CREATE_GROUP_TABS[tabName],
            tabType: 'button',
            active: selectedTab === tabName,
            badge: appCount > 0 ? appCount : null,
            props: {
                onClick: onTabChange,
                'data-tab-name': tabName,
            },
        }
    }

    // called when showErrorMsg is true
    const nameErrorMessage = (): string => {
        if (!appGroupName) {
            return 'Group name is required field'
        }
        if (appGroupName.length > 30) {
            return 'Max 30 char is allowed in name'
        }
        if (!FILTER_NAME_REGEX.test(appGroupName)) {
            return 'Min 3 chars; Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-); Do not use spaces'
        }
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="flexbox-col p-20 bg__primary dc__overflow-auto flex-grow-1">
                <div className="form__row mb-16">
                    <CustomInput
                        label="Name"
                        placeholder="Enter filter name"
                        value={appGroupName}
                        name="name"
                        onChange={onInputChange}
                        disabled={selectedAppGroup && !!selectedAppGroup.value}
                        required
                        error={showErrorMsg && nameErrorMessage()}
                    />
                </div>
                <div className="mb-16">
                    <Textarea
                        label="Description (Max 50 characters)"
                        placeholder="Write a description for this filter"
                        value={appGroupDescription}
                        name="description"
                        onChange={onInputChange}
                        error={
                            showErrorMsg && appGroupDescription?.length > 50 && 'Max 50 char is allowed in description'
                        }
                    />
                </div>
                <div className='flexbox-col flex-grow-1'>
                    <div className="dc__border-bottom mb-8">
                        <TabGroup
                            tabs={[
                                renderTabItem(
                                    filterParentType === FilterParentType.app
                                        ? CreateGroupTabs.SELECTED_ENV
                                        : CreateGroupTabs.SELECTED_APPS,
                                    selectedAppsCount,
                                ),
                                renderTabItem(
                                    filterParentType === FilterParentType.app
                                        ? CreateGroupTabs.ALL_ENV
                                        : CreateGroupTabs.ALL_APPS,
                                    appList.length,
                                ),
                            ]}
                            hideTopPadding
                            alignActiveBorderWithContainer
                        />
                    </div>
                    {selectedTab === CreateGroupTabs.SELECTED_APPS || selectedTab === CreateGroupTabs.SELECTED_ENV
                        ? renderSelectedApps()
                        : renderAllApps()}
                </div>
            </div>
        )
    }

    const handleSave = async (e): Promise<void> => {
        e.preventDefault()
        if (showErrorMsg) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please fix the errors',
            })
            return
        }
        if (!appGroupName || appGroupDescription?.length > 50) {
            setShowErrorMsg(true)
            return
        }
        if (selectedAppsCount === 0) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `Please select ${filterParentTypeMsg} to create group`,
            })
            return
        }
        setLoading(true)
        const _selectedAppIds = []
        for (const _appId in selectedAppsMap) {
            _selectedAppIds.push(+_appId)
        }

        const appListIds = []
        appList.forEach((element) => {
            if (!unAuthorizedApps.get(element.appName)) {
                appListIds.push(+element.id)
            }
        })
        const payloadAppIds = _selectedAppIds.filter((app) => {
            if (appListIds.includes(app)) {
                return true
            }
            return false
        })

        const payload = {
            id: selectedAppGroup ? +selectedAppGroup.value : null,
            name: appGroupName,
            description: appGroupDescription,
            resourceIds: payloadAppIds,
            groupType: filterParentType,
        }

        try {
            const id = filterParentType === FilterParentType.app ? appId : envId
            const { result } = await createEnvGroup(id, payload, !!selectedAppGroup?.value)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully saved',
            })
            closePopup(e, result.id)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="dc__border-top flex right bg__primary py-16 px-20 w-800">
                <button className="cta cancel flex h-36 mr-12" onClick={closePopup}>
                    Cancel
                </button>
                <button className="cta flex h-36" onClick={handleSave}>
                    {selectedAppGroup?.value ? 'Update' : 'Save'}
                </button>
            </div>
        )
    }

    return (
        <Drawer position="right" width="800px" onEscape={closePopup}>
            <div className="bg__tertiary h-100 flexbox-col" ref={CreateGroupRef}>
                {renderHeaderSection()}
                {renderBodySection()}
                {renderFooterSection()}
            </div>
        </Drawer>
    )
}
