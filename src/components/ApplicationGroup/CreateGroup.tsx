import React, { useEffect, useRef, useState } from 'react'
import { Drawer, Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { CreateGroupType } from './AppGroup.types'
import SearchBar from './SearchBar'
import { CreateGroupTabs } from './Constants'
import { toast } from 'react-toastify'
import { createEnvGroup } from './AppGroup.service'
import { useParams } from 'react-router-dom'

export default function CreateGroup({ appList, selectedAppList, closePopup }: CreateGroupType) {
    const { envId } = useParams<{ envId: string }>()
    const CreateGroupRef = useRef<HTMLDivElement>(null)
    const [isLoading, setLoading] = useState(false)
    const [appGroupName, setAppGroupName] = useState<string>()
    const [appGroupDescription, setAppGroupDescription] = useState<string>()
    const [selectedTab, setSelectedTab] = useState<CreateGroupTabs>(CreateGroupTabs.SELECTED_APPS)
    const [allAppSearchText, setAllAppSearchText] = useState('')
    const [allAppSearchApplied, setAllAppSearchApplied] = useState(false)
    const [selectedAppSearchText, setSelectedAppSearchText] = useState('')
    const [selectedAppSearchApplied, setSelectedAppSearchApplied] = useState(false)
    const [allAppsList, setAllAppsList] = useState<{ id: string; appName: string; isSelected: boolean }[]>([])

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
        const selectedAppsMap: Record<string, boolean> = {}
        const _allAppList: { id: string; appName: string; isSelected: boolean }[] = []
        for (const selectedApp of selectedAppList) {
            selectedAppsMap[selectedApp.value] = true
        }
        for (const app of appList) {
            _allAppList.push({ id: app.value, appName: app.label, isSelected: selectedAppsMap[app.value] })
        }
        setAllAppsList(_allAppList)
    }, [])

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

    const handleFilterChanges = (_searchText: string): void => {
        const _filteredData = appList.filter((app) => app.label.indexOf(_searchText) >= 0)
        //setFilteredAppList(_filteredData)
    }

    const renderSelectedApps = (): JSX.Element => {
        return (
            <div>
                <SearchBar
                    placeholder="Search applications"
                    handleFilterChanges={handleFilterChanges}
                    searchText={selectedAppSearchText}
                    setSearchText={setSelectedAppSearchText}
                    searchApplied={selectedAppSearchApplied}
                    setSearchApplied={setSelectedAppSearchApplied}
                />
                <div>
                    {allAppsList
                        .filter(
                            (app) =>
                                app.isSelected &&
                                (!selectedAppSearchText || app.appName.indexOf(selectedAppSearchText) >= 0),
                        )
                        .map((app) => (
                            <div className="flex dc__content-space dc__hover-n50 p-8 fs-13 fw-4 cn-9">
                                <span>{app.appName}</span>
                                <Close className="icon-dim-16 cursor" />
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
                    handleFilterChanges={handleFilterChanges}
                    searchText={allAppSearchText}
                    setSearchText={setAllAppSearchText}
                    searchApplied={allAppSearchApplied}
                    setSearchApplied={setAllAppSearchApplied}
                />
                <div>
                    {allAppsList
                        .filter((app) => !allAppSearchText || app.appName.indexOf(allAppSearchText) >= 0)
                        .map((app) => (
                            <div
                                className={`flex dc__content-space dc__hover-n50 p-8 fs-13 fw-4 ${
                                    app.isSelected ? 'bcb-1 cb-5' : 'cn-9'
                                }`}
                            >
                                <span>{app.appName}</span>
                                {app.isSelected && <Close className="icon-dim-16 cursor" />}
                            </div>
                        ))}
                </div>
            </div>
        )
    }

    const onTabChange = (e): void => {
        setSelectedTab(e.currentTarget.dataset.tabName)
    }

    const renderTabItem = (): JSX.Element => {
        return (
            <li className="tab-list__tab pointer" data-tab-name={CreateGroupTabs.SELECTED_APPS} onClick={onTabChange}>
                <div
                    className={`mb-6 fs-13 tab-hover${
                        selectedTab === CreateGroupTabs.SELECTED_APPS ? ' fw-6 active' : ' fw-4'
                    }`}
                >
                    <span className="mr-6">Selected applications </span>
                    {selectedAppList.length > 0 && (
                        <span
                            className={`br-10 pl-5 pr-5 ${
                                selectedTab === CreateGroupTabs.SELECTED_APPS ? 'bcb-5 cn-0' : 'bcn-1 cn-7'
                            }`}
                        >
                            {selectedAppList.length}
                        </span>
                    )}
                </div>
                {selectedTab === CreateGroupTabs.SELECTED_APPS && <div className="apps-tab__active-tab" />}
            </li>
        )
    }

    const renderAppListTabs = (): JSX.Element => {
        return (
            <ul role="tablist" className="tab-list mb-8">
                <li
                    className="tab-list__tab pointer"
                    data-tab-name={CreateGroupTabs.SELECTED_APPS}
                    onClick={onTabChange}
                >
                    <div
                        className={`mb-6 fs-13 tab-hover${
                            selectedTab === CreateGroupTabs.SELECTED_APPS ? ' fw-6 active' : ' fw-4'
                        }`}
                    >
                        <span className="mr-6">Selected applications </span>
                        {selectedAppList.length > 0 && (
                            <span
                                className={`br-10 pl-5 pr-5 ${
                                    selectedTab === CreateGroupTabs.SELECTED_APPS ? 'bcb-5 cn-0' : 'bcn-1 cn-7'
                                }`}
                            >
                                {selectedAppList.length}
                            </span>
                        )}
                    </div>
                    {selectedTab === CreateGroupTabs.SELECTED_APPS && <div className="apps-tab__active-tab" />}
                </li>
                <li className="tab-list__tab pointer" data-tab-name={CreateGroupTabs.ALL_APPS} onClick={onTabChange}>
                    <div
                        className={`mb-6 flexbox fs-13 tab-hover${
                            selectedTab === CreateGroupTabs.ALL_APPS ? ' fw-6 active' : ' fw-4'
                        }`}
                    >
                        <span className="mr-6">Add/Remove applications </span>
                        {appList.length > 0 && (
                            <span
                                className={`br-10 pl-5 pr-5 ${
                                    selectedTab === CreateGroupTabs.ALL_APPS ? 'bcb-5 cn-0' : 'bcn-1 cn-7'
                                }`}
                            >
                                {appList.length}
                            </span>
                        )}
                    </div>
                    {selectedTab === CreateGroupTabs.ALL_APPS && <div className="apps-tab__active-tab" />}
                </li>
            </ul>
        )
    }

    const renderBodySection = (): JSX.Element => {
        if (isLoading) {
            return <Progressing pageLoader />
        }
        return (
            <div className="p-20 bcn-0 dc__overflow-auto" style={{ height: 'calc(100vh - 128px)' }}>
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
                    />
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
                </div>
                <div>
                    {renderAppListTabs()}
                    {selectedTab === CreateGroupTabs.SELECTED_APPS ? renderSelectedApps() : renderAllApps()}
                </div>
            </div>
        )
    }

    const isCreateGroupDisabled = (): boolean => {
        return false
    }

    const handleSave = async (e): Promise<void> => {
        e.preventDefault()
        // let  = false

        // if () {
        //     toast.error('Some required fields are missing or invalid')
        //     return
        // }
        setLoading(true)

        const payload = {
            id: null,
            name: appGroupName,
            description: appGroupDescription,
            appIds: selectedAppList.map((app) => +app.value),
        }

        try {
            await createEnvGroup(envId, payload)
            toast.success('Successfully saved')
            closePopup(e)
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
                <button className="cta flex h-36" onClick={handleSave} disabled={isCreateGroupDisabled()}>
                    Save
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
