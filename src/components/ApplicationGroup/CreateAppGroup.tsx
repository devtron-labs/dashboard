import React, { useEffect, useRef, useState } from 'react'
import { Drawer, Progressing, showError, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { CreateGroupType } from './AppGroup.types'
import SearchBar from './SearchBar'
import { CreateGroupTabs, CREATE_GROUP_TABS } from './Constants'
import { toast } from 'react-toastify'
import { createEnvGroup } from './AppGroup.service'
import { useParams } from 'react-router-dom'

export default function CreateAppGroup({ appList, selectedAppGroup, closePopup }: CreateGroupType) {
    const { envId } = useParams<{ envId: string }>()
    const CreateGroupRef = useRef<HTMLDivElement>(null)
    const [isLoading, setLoading] = useState(false)
    const [showErrorMsg, setShowErrorMsg] = useState(false)
    const [appGroupName, setAppGroupName] = useState<string>(selectedAppGroup?.label ?? '')
    const [appGroupDescription, setAppGroupDescription] = useState<string>(selectedAppGroup?.description ?? '')
    const [selectedTab, setSelectedTab] = useState<CreateGroupTabs>(CreateGroupTabs.SELECTED_APPS)
    const [allAppSearchText, setAllAppSearchText] = useState('')
    const [allAppSearchApplied, setAllAppSearchApplied] = useState(false)
    const [selectedAppSearchText, setSelectedAppSearchText] = useState('')
    const [selectedAppSearchApplied, setSelectedAppSearchApplied] = useState(false)
    const [selectedAppsMap, setSelectedAppsMap] = useState<Record<string, boolean>>({})
    const [selectedAppsCount, setSelectedAppsCount] = useState<number>(0)

    const outsideClickHandler = (evt): void => {
        if (
            CreateGroupRef.current &&
            !CreateGroupRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closePopup(evt)
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
            setSelectedAppsCount(_selectedAppsCount)
        }
    }, [appList])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-17 pr-20 pb-17 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Save filter</h2>
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
            setSelectedAppsCount(selectedAppsCount - 1)
        }
    }

    const addApp = (e): void => {
        stopPropagation(e)
        const _selectedAppsMap = { ...selectedAppsMap }
        if (!_selectedAppsMap[e.currentTarget.dataset.appId]) {
            _selectedAppsMap[e.currentTarget.dataset.appId] = true
            setSelectedAppsMap(_selectedAppsMap)
            setSelectedAppsCount(selectedAppsCount + 1)
        }
    }

    const renderSelectedApps = (): JSX.Element => {
        return (
            <div>
                <SearchBar
                    placeholder="Search applications"
                    searchText={selectedAppSearchText}
                    setSearchText={setSelectedAppSearchText}
                    searchApplied={selectedAppSearchApplied}
                    setSearchApplied={setSelectedAppSearchApplied}
                />
                <div>
                    {appList
                        .filter(
                            (app) =>
                                selectedAppsMap[app.id] &&
                                (!selectedAppSearchText || app.appName.indexOf(selectedAppSearchText) >= 0),
                        )
                        .map((app) => (
                            <div
                                key={`selected-app-${app.id}`}
                                className="flex dc__content-space dc__hover-n50 p-8 fs-13 fw-4 cn-9"
                            >
                                <span>{app.appName}</span>
                                <Close
                                    className="icon-dim-16 cursor"
                                    data-app-id={app.id}
                                    onClick={removeAppSelection}
                                />
                            </div>
                        ))}
                </div>
            </div>
        )
    }

    const renderAllApps = (): JSX.Element => {
        return (
            <div>
                <SearchBar
                    placeholder="Search applications"
                    searchText={allAppSearchText}
                    setSearchText={setAllAppSearchText}
                    searchApplied={allAppSearchApplied}
                    setSearchApplied={setAllAppSearchApplied}
                />
                <div>
                    {appList
                        .filter((app) => !allAppSearchText || app.appName.indexOf(allAppSearchText) >= 0)
                        .map((app) => (
                            <div
                                key={`app-${app.id}`}
                                className={`flex dc__content-space dc__hover-n50 p-8 fs-13 fw-4 ${
                                    selectedAppsMap[app.id] ? 'bcb-1 cb-5' : 'cn-9'
                                }`}
                                data-app-id={app.id}
                                onClick={addApp}
                            >
                                <span>{app.appName}</span>
                                {selectedAppsMap[app.id] && (
                                    <Close
                                        className="icon-dim-16 cursor"
                                        data-app-id={app.id}
                                        onClick={removeAppSelection}
                                    />
                                )}
                            </div>
                        ))}
                </div>
            </div>
        )
    }

    const onTabChange = (e): void => {
        setSelectedTab(e.currentTarget.dataset.tabName)
    }

    const renderTabItem = (tabName: CreateGroupTabs, appCount: number): JSX.Element => {
        return (
            <li className="tab-list__tab pointer" data-tab-name={tabName} onClick={onTabChange}>
                <div className={`mb-6 fs-13 tab-hover${selectedTab === tabName ? ' fw-6 active' : ' fw-4'}`}>
                    <span className="mr-6">{CREATE_GROUP_TABS[tabName]} </span>
                    {appCount > 0 && (
                        <span className={`br-10 pl-5 pr-5 ${selectedTab === tabName ? 'bcb-5 cn-0' : 'bcn-1 cn-7'}`}>
                            {appCount}
                        </span>
                    )}
                </div>
                {selectedTab === tabName && <div className="apps-tab__active-tab" />}
            </li>
        )
    }

    const nameErrorMessage = (): string => {
        if (!appGroupName) {
            return 'Group name is required field'
        } else {
            return 'Max 30 char is allowed in name'
        }
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="p-20 bcn-0 dc__overflow-auto" style={{ height: 'calc(100vh - 145px)' }}>
                <div className="form__row mb-16">
                    <span className="form__label dc__required-field">Name</span>
                    <input
                        tabIndex={0}
                        className="form__input"
                        autoComplete="off"
                        placeholder="Enter filter name"
                        type="text"
                        value={appGroupName}
                        name="name"
                        onChange={onInputChange}
                        disabled={selectedAppGroup && !!selectedAppGroup.value}
                    />

                    {showErrorMsg && !(appGroupName?.length <= 30) && (
                        <span className="form__error">
                            <Error className="form__icon form__icon--error" />
                            {nameErrorMessage()}
                        </span>
                    )}
                </div>
                <div className="form__row mb-16">
                    <span className="form__label">Description (Max 50 characters)</span>
                    <textarea
                        tabIndex={1}
                        placeholder="Write a description for this filter"
                        className="form__textarea"
                        value={appGroupDescription}
                        name="description"
                        onChange={onInputChange}
                    />
                    {showErrorMsg && appGroupDescription?.length > 50 && (
                        <span className="form__error">
                            <Error className="form__icon form__icon--error" />
                            Max 50 char is allowed in description
                        </span>
                    )}
                </div>
                <div>
                    <ul role="tablist" className="tab-list mb-8">
                        {renderTabItem(CreateGroupTabs.SELECTED_APPS, selectedAppsCount)}
                        {renderTabItem(CreateGroupTabs.ALL_APPS, appList.length)}
                    </ul>
                    {selectedTab === CreateGroupTabs.SELECTED_APPS ? renderSelectedApps() : renderAllApps()}
                </div>
            </div>
        )
    }

    const handleSave = async (e): Promise<void> => {
        e.preventDefault()
        setShowErrorMsg(true)
        if (!appGroupName || appGroupDescription?.length > 50) {
            return
        }
        if (selectedAppsCount === 0) {
            toast.error('Please select apps to create group')
            return
        }
        setLoading(true)
        const _selectedAppIds = []
        for (const _appId in selectedAppsMap) {
            _selectedAppIds.push(+_appId)
        }

        const payload = {
            id: selectedAppGroup ? +selectedAppGroup.value : null,
            name: appGroupName,
            description: appGroupDescription,
            appIds: _selectedAppIds,
        }

        try {
            const { result } = await createEnvGroup(envId, payload, !!selectedAppGroup?.value)
            toast.success('Successfully saved')
            closePopup(e, result.id)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="dc__border-top flex right bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 w-800">
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
            <div className="dc__window-bg h-100 create-group-container" ref={CreateGroupRef}>
                {renderHeaderSection()}
                {renderBodySection()}
                {renderFooterSection()}
            </div>
        </Drawer>
    )
}
