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

import { MouseEvent, useEffect, useState, type JSX } from 'react'
import { generatePath, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import Tippy from '@tippyjs/react'

import {
    ActionMenu,
    ActionMenuProps,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    CommonNodeAttr,
    ComponentSizeType,
    DeploymentNodeType,
    ErrorScreenManager,
    Progressing,
    ServerErrors,
    showError,
    sortCallback,
    ToastManager,
    ToastVariantType,
    usePrompt,
    WorkflowNodeType,
    WorkflowType,
    ROUTER_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { BuildImageModal, BulkBuildImageModal } from '@Components/app/details/triggerView/BuildImageModal'
import CDMaterial from '@Components/app/details/triggerView/CDMaterial'
import { BulkDeployModal } from '@Components/app/details/triggerView/DeployImageModal'
import { shouldRenderWebhookAddImageModal } from '@Components/app/details/triggerView/TriggerView.utils'
import { getExternalCIConfig } from '@Components/ciPipeline/Webhook/webhook.service'

import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as Pencil } from '../../../../assets/icons/ic-pencil.svg'
import { ViewType } from '../../../../config'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import { AppNotConfigured } from '../../../app/details/appDetails/AppDetails'
import { TRIGGER_VIEW_PARAMS } from '../../../app/details/triggerView/Constants'
import { MATERIAL_TYPE } from '../../../app/details/triggerView/types'
import { Workflow } from '../../../app/details/triggerView/workflow/Workflow'
import { triggerBranchChange } from '../../../app/service'
import { importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../../../common'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { getWorkflows, getWorkflowStatus } from '../../AppGroup.service'
import {
    AppGroupDetailDefaultType,
    ProcessWorkFlowStatusType,
    ResponseRowType,
    WorkflowAppSelectionType,
} from '../../AppGroup.types'
import { processWorkflowStatuses } from '../../AppGroup.utils'
import {
    BulkResponseStatus,
    GetBranchChangeStatus,
    SKIPPED_RESOURCES_MESSAGE,
    SKIPPED_RESOURCES_STATUS_TEXT,
} from '../../Constants'
import BulkSourceChange from './BulkSourceChange'
import { getSelectedNodeAndAppId } from './utils'

import './EnvTriggerView.scss'
import { EnvTriggerViewActionKey } from './types'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const processDeploymentWindowStateAppGroup = importComponentFromFELibrary(
    'processDeploymentWindowStateAppGroup',
    null,
    'function',
)
const ChangeImageSource = importComponentFromFELibrary('ChangeImageSource', null, 'function')
const WebhookAddImageModal = importComponentFromFELibrary('WebhookAddImageModal', null, 'function')

let inprogressStatusTimer
const EnvTriggerView = ({ filteredAppIds, isVirtualEnv }: AppGroupDetailDefaultType) => {
    const { envId } = useParams<{ envId: string }>()
    const navigate = useNavigate()
    const location = useLocation()

    const [pageViewType, setPageViewType] = useState<string>(ViewType.LOADING)
    const [isBranchChangeLoading, setIsBranchChangeLoading] = useState(false)
    const [showPreDeployment, setShowPreDeployment] = useState(false)
    const [showPostDeployment, setShowPostDeployment] = useState(false)
    const [errorCode, setErrorCode] = useState(0)
    const [showBulkCDModal, setShowBulkCDModal] = useState(false)
    const [showBulkCIModal, setShowBulkCIModal] = useState(false)
    const [showBulkSourceChangeModal, setShowBulkSourceChangeModal] = useState(false)
    const [selectedAppList, setSelectedAppList] = useState<WorkflowAppSelectionType[]>([])
    const [workflows, setWorkflows] = useState<WorkflowType[]>([])
    const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowType[]>([])
    const [filteredCIPipelines, setFilteredCIPipelines] = useState(null)
    const [bulkTriggerType, setBulkTriggerType] = useState<DeploymentNodeType>(null)
    const [responseList, setResponseList] = useState<ResponseRowType[]>([])
    const [isSelectAll, setSelectAll] = useState(false)
    const [selectAllValue, setSelectAllValue] = useState<CHECKBOX_VALUE>(CHECKBOX_VALUE.CHECKED)
    const [selectedWebhookNode, setSelectedWebhookNode] = useState<{ appId: number; id: number }>(null)

    const enableRoutePrompt = isBranchChangeLoading
    usePrompt({ shouldPrompt: enableRoutePrompt })

    useEffect(() => {
        if (envId) {
            setPageViewType(ViewType.LOADING)
            setSelectedAppList([])
            getWorkflowsData()
        }
        return () => {
            inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
        }
    }, [filteredAppIds])

    const reloadTriggerView = () => {
        setPageViewType(ViewType.LOADING)
        inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
        getWorkflowsData()
    }

    const preserveSelection = (_workflows: WorkflowType[]) => {
        if (!workflows || !_workflows) {
            return
        }
        const workflowMap = new Map()
        workflows.forEach((wf) => {
            workflowMap.set(wf.id, wf.isSelected)
        })
        _workflows.forEach((wf) => {
            wf.isSelected = workflowMap.get(wf.id)
        })
    }

    const getWorkflowsData = async (): Promise<WorkflowType[]> => {
        try {
            const { workflows: _workflows, filteredCIPipelines } = await getWorkflows(envId, filteredAppIds)
            if (processDeploymentWindowStateAppGroup && _workflows.length) {
                await processDeploymentWindowStateAppGroup(_workflows)
            }
            preserveSelection(_workflows)
            setWorkflows(_workflows)
            setFilteredCIPipelines(filteredCIPipelines)
            setErrorCode(0)
            setPageViewType(ViewType.FORM)
            getWorkflowStatusData(_workflows)
            processFilteredData(_workflows)

            return _workflows
        } catch (error) {
            showError(error)
            setErrorCode(error.code)
            setPageViewType(ViewType.ERROR)
        }
    }

    const processFilteredData = (_filteredWorkflows: WorkflowType[]): void => {
        const _selectedAppList = []
        let _preNodeExist
        let _postNodeExist
        _filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
                const _currentAppDetail = {
                    id: wf.appId,
                    name: wf.name,
                    preNodeAvailable: false,
                    postNodeAvailable: false,
                }
                for (const node of wf.nodes) {
                    if (node.environmentId === +envId && node.type === WorkflowNodeType.CD) {
                        _preNodeExist = _preNodeExist || !!node.preNode
                        _postNodeExist = _postNodeExist || !!node.postNode
                        _currentAppDetail.preNodeAvailable = !!node.preNode
                        _currentAppDetail.postNodeAvailable = !!node.postNode
                        break
                    }
                }
                _selectedAppList.push(_currentAppDetail)
            }
        })
        setShowPreDeployment(_preNodeExist)
        setShowPostDeployment(_postNodeExist)
        setSelectedAppList(_selectedAppList)
        setSelectAll(_selectedAppList.length !== 0)
        setSelectAllValue(
            _filteredWorkflows.length === _selectedAppList.length
                ? CHECKBOX_VALUE.CHECKED
                : CHECKBOX_VALUE.INTERMEDIATE,
        )
        _filteredWorkflows.sort((a, b) => sortCallback('name', a, b))
        setFilteredWorkflows(_filteredWorkflows)
    }

    const pollWorkflowStatus = (_processedWorkflowsData: ProcessWorkFlowStatusType) => {
        inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
        inprogressStatusTimer = setTimeout(
            () => {
                getWorkflowStatusData(_processedWorkflowsData.workflows)
            },
            _processedWorkflowsData.cicdInProgress ? 10000 : 30000,
        )
    }

    const getWorkflowStatusData = (workflowsList: WorkflowType[] = workflows) => {
        getWorkflowStatus(envId, filteredAppIds)
            .then((response) => {
                const _processedWorkflowsData = processWorkflowStatuses(
                    response?.result?.ciWorkflowStatus ?? [],
                    response?.result?.cdWorkflowStatus ?? [],
                    workflowsList,
                )
                pollWorkflowStatus(_processedWorkflowsData)
                setWorkflows(_processedWorkflowsData.workflows)
                processFilteredData(_processedWorkflowsData.workflows)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                // If ci cd is in progress then call the api after every 10sec
                pollWorkflowStatus({ cicdInProgress: true, workflows: workflowsList })
            })
    }

    const clearAppList = (): void => {
        setSelectedAppList([])
        const _workflows = filteredWorkflows.map((wf) => {
            wf.isSelected = false
            return wf
        })
        setSelectAll(false)
        setFilteredWorkflows(_workflows)
    }

    const handleSelectAll = (): void => {
        const _selectedAppList = []
        let _preNodeExist = false
        let _postNodeExist = false
        const _workflows = filteredWorkflows.map((wf) => {
            if (!isSelectAll) {
                const _currentAppDetail = {
                    id: wf.appId,
                    name: wf.name,
                    preNodeAvailable: false,
                    postNodeAvailable: false,
                    appReleaseTags: wf.appReleaseTags,
                    tagsEditable: wf.tagsEditable,
                }
                for (const node of wf.nodes) {
                    if (node.environmentId === +envId && node.type === WorkflowNodeType.CD) {
                        _preNodeExist = _preNodeExist || !!node.preNode
                        _postNodeExist = _postNodeExist || !!node.postNode
                        _currentAppDetail.preNodeAvailable = !!node.preNode
                        _currentAppDetail.postNodeAvailable = !!node.postNode
                        break
                    }
                }
                _selectedAppList.push(_currentAppDetail)
            }
            wf.isSelected = !isSelectAll
            return wf
        })
        setSelectAll(!isSelectAll)
        setSelectAllValue(CHECKBOX_VALUE.CHECKED)
        setShowPreDeployment(_preNodeExist)
        setShowPostDeployment(_postNodeExist)
        setFilteredWorkflows(_workflows)
        setSelectedAppList(_selectedAppList)
    }

    const handleSelectionChange = (_appId: number): void => {
        const _selectedAppList = [...selectedAppList]
        let _preNodeExist
        let _postNodeExist
        const _workflows = filteredWorkflows.map((wf) => {
            if (_appId === wf.appId) {
                const selectedAppIndex = selectedAppList.findIndex((app) => app.id === _appId)
                if (wf.isSelected) {
                    _selectedAppList.splice(selectedAppIndex, 1)
                    wf.isSelected = false
                    for (const app of _selectedAppList) {
                        if (!_preNodeExist && app.preNodeAvailable) {
                            _preNodeExist = true
                        }
                        if (!_postNodeExist && app.postNodeAvailable) {
                            _postNodeExist = true
                        }
                        if (_preNodeExist && _postNodeExist) {
                            break
                        }
                    }
                } else {
                    const _currentAppDetail = {
                        id: _appId,
                        name: wf.name,
                        preNodeAvailable: false,
                        postNodeAvailable: false,
                    }
                    for (const node of wf.nodes) {
                        if (node.environmentId === +envId && node.type === WorkflowNodeType.CD) {
                            _preNodeExist = showPreDeployment || !!node.preNode
                            _postNodeExist = showPostDeployment || !!node.postNode
                            _currentAppDetail.preNodeAvailable = !!node.preNode
                            _currentAppDetail.postNodeAvailable = !!node.postNode
                            break
                        }
                    }
                    _selectedAppList.push(_currentAppDetail)
                    wf.isSelected = true
                }
            }
            return wf
        })
        setShowPreDeployment(_preNodeExist)
        setShowPostDeployment(_postNodeExist)
        setFilteredWorkflows(_workflows)
        setSelectedAppList(_selectedAppList)
        setSelectAll(_selectedAppList.length !== 0)
        setSelectAllValue(
            _workflows.length === _selectedAppList.length ? CHECKBOX_VALUE.CHECKED : CHECKBOX_VALUE.INTERMEDIATE,
        )
    }

    const isBuildAndBranchTriggerAllowed = (node: CommonNodeAttr): boolean =>
        !node.isLinkedCI && !node.isLinkedCD && node.type !== WorkflowNodeType.WEBHOOK

    const changeBranch = (value): void => {
        const appIds = []
        const skippedResources = []
        const appNameMap = new Map()

        filteredWorkflows.forEach((wf) => {
            if (wf.isSelected) {
                const _ciNode = wf.nodes.find(
                    (node) => node.type === WorkflowNodeType.CI || node.type === WorkflowNodeType.WEBHOOK,
                )
                if (_ciNode) {
                    if (isBuildAndBranchTriggerAllowed(_ciNode)) {
                        appIds.push(wf.appId)
                        appNameMap.set(wf.appId, wf.name)
                    } else {
                        skippedResources.push({
                            appId: wf.appId,
                            appName: wf.name,
                            statusText: SKIPPED_RESOURCES_STATUS_TEXT,
                            status: BulkResponseStatus.SKIP,
                            envId: +envId,
                            message: SKIPPED_RESOURCES_MESSAGE,
                        })
                    }
                }
            }
        })

        if (!appIds.length && !skippedResources.length) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'No valid application present',
            })
            return
        }
        setIsBranchChangeLoading(true)

        if (!appIds.length) {
            updateResponseListData(skippedResources)
            setIsBranchChangeLoading(false)
            return
        }

        triggerBranchChange(appIds, +envId, value)
            .then((response: any) => {
                const _responseList = []
                response.map((res) => {
                    _responseList.push({
                        appId: res.appId,
                        appName: appNameMap.get(res.appId),
                        statusText: res.status,
                        status: GetBranchChangeStatus(res.status),
                        envId: +envId,
                        message: res.message,
                    })
                })
                updateResponseListData([..._responseList, ...skippedResources])
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setIsBranchChangeLoading(false)
            })
    }

    const closeApprovalModal = (e: MouseEvent): void => {
        e.stopPropagation()
        navigate({
            search: '',
        })
        getWorkflowStatusData(workflows)
    }

    const hideBulkCDModal = () => {
        setShowBulkCDModal(false)
        setResponseList([])

        navigate({
            search: '',
        })
    }

    const onShowBulkCDModal = (e) => {
        setBulkTriggerType(e.currentTarget.dataset.triggerType)
        setShowBulkCDModal(true)
    }

    const hideBulkCIModal = () => {
        setShowBulkCIModal(false)
        setResponseList([])
    }

    const onShowBulkCIModal = () => {
        setShowBulkCIModal(true)
    }

    const hideChangeSourceModal = () => {
        if (responseList.length > 0) {
            setPageViewType(ViewType.LOADING)
            inprogressStatusTimer && clearTimeout(inprogressStatusTimer)
            getWorkflowsData()
        }
        setIsBranchChangeLoading(false)
        setShowBulkSourceChangeModal(false)
        setResponseList([])
    }

    const handleCloseChangeImageSource = () => {
        setPageViewType(ViewType.LOADING)
        getWorkflowsData()
    }

    const onShowChangeSourceModal = () => {
        setShowBulkSourceChangeModal(true)
    }

    const updateResponseListData = (_responseList) => {
        setResponseList((prevList) => {
            const resultMap = new Map(_responseList.map((data) => [data.appId, data]))
            const updatedArray = prevList?.map((prevItem) => resultMap.get(prevItem.appId) || prevItem)
            return (updatedArray?.length > 0 ? updatedArray : _responseList).sort((a, b) =>
                sortCallback('appName', a, b),
            )
        })
    }

    if (pageViewType === ViewType.LOADING) {
        return <Progressing pageLoader />
    }
    if (pageViewType === ViewType.ERROR) {
        return <ErrorScreenManager code={errorCode} />
    }
    if (!filteredWorkflows.length) {
        return (
            <div className="flex-grow-1">
                <AppNotConfigured />
            </div>
        )
    }

    const renderBulkCDMaterial = (): JSX.Element | null => {
        if (!showBulkCDModal) {
            return null
        }

        return (
            <BulkDeployModal
                handleClose={hideBulkCDModal}
                stageType={bulkTriggerType}
                workflows={filteredWorkflows}
                isVirtualEnvironment={isVirtualEnv}
                envId={+envId}
                handleSuccess={getWorkflowStatusData}
            />
        )
    }

    const renderBulkCIMaterial = (): JSX.Element | null => {
        if (!showBulkCIModal) {
            return null
        }

        return (
            <BulkBuildImageModal
                handleClose={hideBulkCIModal}
                workflows={filteredWorkflows}
                reloadWorkflows={getWorkflowsData}
                filteredCIPipelineMap={filteredCIPipelines}
                reloadWorkflowStatus={getWorkflowStatusData}
            />
        )
    }

    const renderBulkSourceChange = (): JSX.Element | null => {
        if (!showBulkSourceChangeModal) {
            return null
        }

        return (
            <BulkSourceChange
                closePopup={hideChangeSourceModal}
                responseList={responseList}
                changeBranch={changeBranch}
                loading={isBranchChangeLoading}
                selectedAppCount={selectedAppList.length}
            />
        )
    }

    const handleActionClick: ActionMenuProps['onClick'] = (item) => {
        switch (item.id) {
            case EnvTriggerViewActionKey.PRE_DEPLOY:
                setBulkTriggerType(DeploymentNodeType.PRECD)
                setShowBulkCDModal(true)
                break
            case EnvTriggerViewActionKey.DEPLOY:
                setBulkTriggerType(DeploymentNodeType.CD)
                setShowBulkCDModal(true)
                break
            case EnvTriggerViewActionKey.POST_DEPLOY:
                setBulkTriggerType(DeploymentNodeType.POSTCD)
                setShowBulkCDModal(true)
                break
            default:
                break
        }
    }

    const renderApprovalMaterial = () => {
        if (ApprovalMaterialModal && location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            const { node, appId } = getSelectedNodeAndAppId(filteredWorkflows, location.search)

            return (
                <ApprovalMaterialModal
                    node={node ?? ({} as CommonNodeAttr)}
                    materialType={MATERIAL_TYPE.inputMaterialList}
                    stageType={DeploymentNodeType.CD}
                    closeApprovalModal={closeApprovalModal}
                    appId={appId}
                    pipelineId={node?.id}
                    getModuleInfo={getModuleInfo}
                    ciPipelineId={node?.connectingCiPipelineId}
                />
            )
        }

        return null
    }

    const renderDeployPopupMenu = (): JSX.Element => (
        <ActionMenu<EnvTriggerViewActionKey>
            id="deploy-popup"
            onClick={handleActionClick}
            options={[
                {
                    items: [
                        ...(showPreDeployment
                            ? [
                                  {
                                      id: EnvTriggerViewActionKey.PRE_DEPLOY,
                                      label: 'Trigger Pre-deployment stage',
                                  },
                              ]
                            : []),
                        {
                            id: EnvTriggerViewActionKey.DEPLOY,
                            label: 'Trigger Deployment',
                        },
                        ...(showPostDeployment
                            ? [
                                  {
                                      id: EnvTriggerViewActionKey.POST_DEPLOY,
                                      label: 'Trigger Post-deployment stage',
                                  },
                              ]
                            : []),
                    ],
                },
            ]}
            buttonProps={{
                dataTestId: 'deploy-popup',
                icon: <Dropdown className="icon-dim-20 fcn-0" />,
                variant: ButtonVariantType.primary,
                size: ComponentSizeType.medium,
                ariaLabel: 'Deploy options',
            }}
        />
    )

    const renderBulkTriggerActionButtons = (): JSX.Element => {
        const selectedWorkflows = filteredWorkflows.filter((wf) => wf.isSelected)
        const _showPopupMenu = showPreDeployment || showPostDeployment
        return (
            <div className="flex dc__min-width-fit-content dc__gap-12">
                {ChangeImageSource && (
                    <ChangeImageSource
                        selectedWorkflows={selectedWorkflows}
                        handleCloseChangeImageSource={handleCloseChangeImageSource}
                    />
                )}
                <Button
                    dataTestId="change-branch-bulk"
                    text="Change branch"
                    startIcon={<Pencil />}
                    onClick={onShowChangeSourceModal}
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.neutral}
                    variant={ButtonVariantType.secondary}
                />
                <span className="filter-divider-env" />
                <Button
                    dataTestId="bulk-build-image-button"
                    text="Build image"
                    onClick={onShowBulkCIModal}
                    size={ComponentSizeType.medium}
                />
                <div className="flex">
                    <button
                        className={`cta flex h-32 dc__gap-8 ${_showPopupMenu ? 'dc__no-right-radius' : ''}`}
                        data-trigger-type="CD"
                        data-testid="bulk-deploy-button"
                        onClick={onShowBulkCDModal}
                    >
                        <DeployIcon className="icon-dim-16 dc__no-svg-fill scn-0" />
                        Deploy
                    </button>
                    {_showPopupMenu && renderDeployPopupMenu()}
                </div>
            </div>
        )
    }

    const renderSelectedApps = (): JSX.Element => (
        <div className="flex">
            <Tippy className="default-tt" arrow={false} placement="top" content="Clear selection">
                <div className="flex">
                    <Close className="icon-dim-18 scr-5 mr-16 cursor mw-18" onClick={clearAppList} />
                </div>
            </Tippy>
            <div>
                <div data-testid="selected-application-text" className="fs-13 fw-6 cn-9">
                    {selectedAppList.length} application{selectedAppList.length > 1 ? 's' : ''} selected
                </div>
                <div className="fs-13 fw-4 cn-7 dc__ellipsis-right__2nd-line" data-testid="selected-apps-name">
                    {sortObjectArrayAlphabetically(selectedAppList, 'name').map((app, index) => (
                        <span key={`selected-app-${app.id}`}>
                            {app.name}
                            {index !== selectedAppList.length - 1 && <span>, </span>}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )

    const revertToPreviousURL = () => {
        navigate(generatePath(ROUTER_URLS.APP_GROUP_DETAILS.TRIGGER, { envId }))
    }

    const getWebhookDetails = () => getExternalCIConfig(selectedWebhookNode.appId, selectedWebhookNode.id, false)

    const handleWebhookAddImageClick = (appId: number) => (id: number) => {
        setSelectedWebhookNode({ appId, id })
    }

    const handleWebhookAddImageModalClose = () => {
        setSelectedWebhookNode(null)
    }

    const openCIMaterialModal = (ciNodeId: string) => {
        navigate(`build/${ciNodeId}`)
    }

    const renderWebhookAddImageModal = () => {
        if (
            WebhookAddImageModal &&
            shouldRenderWebhookAddImageModal(location) &&
            !location.pathname.includes('bulk-deploy/request') &&
            selectedWebhookNode
        ) {
            return (
                <WebhookAddImageModal getWebhookDetails={getWebhookDetails} onClose={handleWebhookAddImageModalClose} />
            )
        }

        return null
    }

    const renderWorkflow = (): JSX.Element => (
        <>
            {filteredWorkflows.map((workflow, index) => (
                <Workflow
                    key={workflow.id}
                    id={workflow.id}
                    name={workflow.name}
                    startX={workflow.startX}
                    startY={workflow.startY}
                    height={workflow.height}
                    width={workflow.width}
                    nodes={workflow.nodes}
                    appId={workflow.appId}
                    isSelected={workflow.isSelected ?? false}
                    handleSelectionChange={handleSelectionChange}
                    fromAppGrouping
                    location={location}
                    index={index}
                    handleWebhookAddImageClick={handleWebhookAddImageClick(workflow.appId)}
                    openCIMaterialModal={openCIMaterialModal}
                    reloadTriggerView={reloadTriggerView}
                    navigate={navigate}
                    params={{ envId }}
                />
            ))}
            <LinkedCIDetail workflows={filteredWorkflows} />
            {renderWebhookAddImageModal()}
        </>
    )

    return (
        <div className="dc__overflow-auto flex-grow-1 dc__content-space flexbox-col app-group-trigger-view-container bg__primary">
            <div className="flexbox-col flex-grow-1 dc__overflow-auto py-16 px-20">
                <div className="flex left mb-14">
                    <Checkbox
                        rootClassName="fs-13 app-group-checkbox"
                        isChecked={isSelectAll}
                        value={selectAllValue}
                        onChange={handleSelectAll}
                        dataTestId="select-all-apps"
                    >
                        Select all apps
                    </Checkbox>
                </div>

                {renderWorkflow()}

                <Routes>
                    <Route
                        path="build/:ciNodeId"
                        element={
                            <BuildImageModal
                                handleClose={revertToPreviousURL}
                                isJobView={false}
                                filteredCIPipelineMap={filteredCIPipelines}
                                workflows={workflows}
                                reloadWorkflows={getWorkflowsData}
                                reloadWorkflowStatus={getWorkflowStatusData}
                                environmentLists={[]}
                            />
                        }
                    />
                </Routes>
                <CDMaterial
                    workflows={filteredWorkflows}
                    handleClose={revertToPreviousURL}
                    handleSuccess={getWorkflowStatusData}
                    isTriggerView={false}
                />
                {renderBulkCDMaterial()}
                {renderBulkCIMaterial()}
                {renderApprovalMaterial()}
                {renderBulkSourceChange()}
                <div />
            </div>
            {!!selectedAppList.length && (
                <div className="flexbox dc__gap-8 dc__content-space dc__border-top w-100 bg__primary px-20 py-12">
                    {renderSelectedApps()}
                    {renderBulkTriggerActionButtons()}
                </div>
            )}
        </div>
    )
}

export default EnvTriggerView
