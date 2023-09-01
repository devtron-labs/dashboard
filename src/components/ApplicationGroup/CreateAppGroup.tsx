import React, { useEffect, useRef, useState } from 'react'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ConditionalWrap,
    Drawer,
    Progressing,
    showError,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as CheckIcon } from '../../assets/icons/ic-check.svg'
import { ReactComponent as Abort } from '../../assets/icons/ic-abort.svg'
import { CreateGroupType, CreateTypeOfAppListType } from './AppGroup.types'
import SearchBar from './SearchBar'
import { CreateGroupTabs, CREATE_GROUP_TABS } from './Constants'
import { toast } from 'react-toastify'
import { createEnvGroup } from './AppGroup.service'
import { useParams } from 'react-router-dom'
import Tippy from '@tippyjs/react'

export default function CreateAppGroup({ appList, selectedAppGroup, closePopup, unAuthorizedApps }: CreateGroupType) {
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
    const [unauthorizedAppList, setUnauthorizedAppList] = useState<CreateTypeOfAppListType[]>([])
    const [authorizedAppList, setAuthorizedAppList] = useState<CreateTypeOfAppListType[]>([])

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
            appFilterList()
            setSelectedAppsCount(_selectedAppsCount)
        }
    }, [appList])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-16 pr-20 pb-16 pl-20">
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
        setShowErrorMsg(true)
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
            appFilterAuthorizedList()
            setSelectedAppsCount(selectedAppsCount - 1)
        }
    }

    const appFilterAuthorizedList = () => {
        let _authorizedApp = []
        appList.forEach((app) => {
            if(!unAuthorizedApps.get(app.appName)) {
                _authorizedApp.push({id: app.id, appName: app.appName})
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
        let _authorizedAppList = []
        let _unauthorizedAppList = []
        appList.forEach((app) =>{
                unAuthorizedApps.get(app.appName) ?
                _unauthorizedAppList.push({id: app.id, appName: app.appName})
             : _authorizedAppList.push({id: app.id, appName: app.appName})
            })
        setUnauthorizedAppList(_unauthorizedAppList)
        setAuthorizedAppList(_authorizedAppList)
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
                    {authorizedAppList
                        .filter(
                            (app) =>
                                selectedAppsMap[app.id] &&
                                (!selectedAppSearchText || app.appName.indexOf(selectedAppSearchText) >= 0),
                        )
                        .map((app) => {
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
                    {unauthorizedAppList.length > 0 && (
                        <div className="dc__bold ml-4">
                            You don't have admin/manager pemission for the following Application.
                        </div>
                    )}
                    {unauthorizedAppList
                        .filter(
                            (app) =>
                                selectedAppsMap[app.id] &&
                                (!selectedAppSearchText || app.appName.indexOf(selectedAppSearchText) >= 0),
                        )
                        .map((app) => {
                            return (
                                <Tippy
                                    key={`selected-app-${app.id}`}
                                    className="default-tt w-200"
                                    arrow={false}
                                    placement="bottom-start"
                                    content="You don't have admin/manager pemission for this app."
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
                            <ConditionalWrap
                                condition={unAuthorizedApps.get(app.appName) === true}
                                wrap={(children) => (
                                    <Tippy
                                        key={`selected-app-${app.id}`}
                                        data-testid="env-tippy"
                                        className="default-tt w-200"
                                        arrow={false}
                                        placement="bottom-start"
                                        content="You don't have admin/manager pemission for this app."
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
                                    disabled={unAuthorizedApps.get(app.appName) ? true : false}
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
            <div className="p-20 bcn-0 dc__overflow-auto" style={{ height: 'calc(100vh - 128px)' }}>
                <div className="form__row mb-16">
                    <span className="form__label dc__required-field">Name</span>
                    <input
                        tabIndex={1}
                        className="form__input"
                        autoComplete="off"
                        placeholder="Enter filter name"
                        type="text"
                        value={appGroupName}
                        name="name"
                        onChange={onInputChange}
                        disabled={selectedAppGroup && !!selectedAppGroup.value}
                    />

                    {showErrorMsg && (!appGroupName || appGroupName.length > 30) && (
                        <span className="form__error">
                            <Error className="form__icon form__icon--error" />
                            {nameErrorMessage()}
                        </span>
                    )}
                </div>
                <div className="form__row mb-16">
                    <span className="form__label">Description (Max 50 characters)</span>
                    <textarea
                        tabIndex={2}
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
                    <ul role="tablist" className="tab-list dc__border-bottom mb-8">
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
        
        let appListIds = []
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
            appIds: payloadAppIds,
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
