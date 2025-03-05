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

import React, { useEffect, useRef, useState } from 'react'
import {
    showError,
    Progressing,
    Drawer,
    InfoColourBar,
    Reload,
    copyToClipboard,
    CustomInput,
    ClipboardButton,
    ButtonWithLoader,
    CodeEditor,
    SelectPicker,
    TabGroup,
    ComponentSizeType,
    ToastVariantType,
    ToastManager,
    ACCESS_TYPE_MAP,
    EntityTypes,
    Button,
    ButtonVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as ICHelpOutline } from '../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as PlayButton } from '../../../assets/icons/ic-play.svg'
import { ReactComponent as Tag } from '../../../assets/icons/ic-tag.svg'
import './webhookDetails.scss'
import {
    getUserRole,
    createOrUpdateUser,
} from '../../../Pages/GlobalConfigurations/Authorization/authorization.service'
import { DOCUMENTATION, MODES, SERVER_MODE, WEBHOOK_NO_API_TOKEN_ERROR } from '../../../config'
import { createGeneratedAPIToken } from '../../../Pages/GlobalConfigurations/Authorization/APITokens/service'
import {
    CURL_PREFIX,
    getWebhookTokenListOptions,
    PLAYGROUND_TAB_LIST,
    REQUEST_BODY_TAB_LIST,
    RESPONSE_TAB_LIST,
    TOKEN_TAB_LIST,
} from './webhook.utils'
import { SchemaType, TabDetailsType, TokenListOptionsType, WebhookDetailsType, WebhookDetailType } from './types'
import { executeWebhookAPI, getExternalCIConfig, getWebhookAPITokenList } from './webhook.service'
import { GENERATE_TOKEN_NAME_VALIDATION } from '../../../config/constantMessaging'
import { createUserPermissionPayload } from '../../../Pages/GlobalConfigurations/Authorization/utils'
import { ChartGroupPermissionsFilter } from '../../../Pages/GlobalConfigurations/Authorization/types'
import { ActionTypes, PermissionType } from '../../../Pages/GlobalConfigurations/Authorization/constants'
import {
    getDefaultStatusAndTimeout,
    getDefaultUserStatusAndTimeout,
} from '../../../Pages/GlobalConfigurations/Authorization/libUtils'

export const WebhookDetailsModal = ({ close, isTemplateView }: WebhookDetailType) => {
    const { appId, webhookId } = useParams<{
        appId: string
        webhookId: string
    }>()
    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const responseSectionRef = useRef<HTMLDivElement>(null)
    const [loader, setLoader] = useState(false)
    const [webhookExecutionLoader, setWebhookExecutionLoader] = useState(false)
    const [generateTokenLoader, setGenerateTokenLoader] = useState(false)
    const [selectedTokenTab, setSelectedTokenTab] = useState<string>(TOKEN_TAB_LIST[0].key)
    const [tokenName, setTokenName] = useState<string>('')
    const [showTokenNameError, setTokenNameError] = useState(false)
    const [selectedPlaygroundTab, setSelectedPlaygroundTab] = useState<string>(PLAYGROUND_TAB_LIST[0].key)
    const [selectedRequestBodyTab, setRequestBodyPlaygroundTab] = useState<string>(REQUEST_BODY_TAB_LIST[0].key)
    const [webhookResponse, setWebhookResponse] = useState<Object>(null)
    const [selectedToken, setSelectedToken] = useState<TokenListOptionsType>(null)
    const [generatedAPIToken, setGeneratedAPIToken] = useState<string>(null)
    const [tokenList, setTokenList] = useState<TokenListOptionsType[]>(undefined)
    const [showTokenSection, setShowTokenSection] = useState(false)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [samplePayload, setSamplePayload] = useState<any>(null)
    const [modifiedSamplePayload, setModifiedSamplePayload] = useState<any>(null)
    const [modifiedSampleString, setModifiedSampleString] = useState<string>('')
    const [sampleJSON, setSampleJSON] = useState(null)
    const [sampleCURL, setSampleCURL] = useState<any>(null)
    const [tryoutAPIToken, setTryoutAPIToken] = useState<string>(null)
    const [showTryoutAPITokenError, setTryoutAPITokenError] = useState(false)
    const [webhookDetails, setWebhookDetails] = useState<WebhookDetailsType>(null)
    const [selectedSchema, setSelectedSchema] = useState<string>('')
    const [errorInGetData, setErrorInGetData] = useState(false)
    const [copyToClipboardPromise, setCopyToClipboardPromise] = useState<ReturnType<typeof copyToClipboard>>(null)
    const schemaRef = useRef<Array<HTMLDivElement | null>>([])

    const clipboardContent = window.location.href

    const handleCopyButtonClick = async () => {
        setCopyToClipboardPromise(copyToClipboard(clipboardContent))
    }

    const formatSampleJson = (json): string => {
        return JSON.stringify(json, null, 4)
    }

    const closeWebhook = (): void => {
        close()
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }

    const flattenObject = (ob: Record<string, any>, tableName: string): Record<string, SchemaType> => {
        const toReturn = {}
        toReturn[tableName] = {}
        for (const key in ob) {
            if (!ob.hasOwnProperty(key)) {
                continue
            }
            const currentElement = ob[key]
            if (currentElement.child) {
                const flatObject = flattenObject(
                    currentElement.dataType === 'Array' ? currentElement.child[0] : currentElement.child,
                    key,
                )
                currentElement.createLink = true
                currentElement.dataType = key
                delete currentElement.child
                for (const x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) {
                        continue
                    }
                    toReturn[key] = flatObject[x]
                }
            }

            toReturn[tableName][key] = currentElement
        }
        return toReturn
    }

    const getData = async (): Promise<void> => {
        setLoader(true)
        try {
            const [{ result: _userRole }, { result: _webhookDetails }] = await Promise.all([
                getUserRole(),
                getExternalCIConfig(appId, webhookId, isTemplateView),
            ])
            const _isSuperAdmin = _userRole?.superAdmin
            setIsSuperAdmin(_isSuperAdmin)
            _webhookDetails.payloadOption.map((option) => {
                option.isSelected = option.mandatory
                return option
            })
            _webhookDetails.schema = flattenObject(_webhookDetails.schema, 'root')
            _webhookDetails.responses.map((response) => {
                response.description.schema = flattenObject(response.description.schema, 'root')
                response.selectedTab = RESPONSE_TAB_LIST[0].key
                return response
            })
            setWebhookDetails(_webhookDetails)
            const parsedPayload = JSON.parse(_webhookDetails['payload'])
            const _modifiedPayload = { ...parsedPayload }
            if (_modifiedPayload.dockerImage) {
                _modifiedPayload.dockerImage = ''
            }
            delete _modifiedPayload.ciProjectDetails
            const modifiedJSONString = formatSampleJson(_modifiedPayload)
            setSamplePayload(_modifiedPayload)
            setModifiedSamplePayload(_modifiedPayload)
            setModifiedSampleString(modifiedJSONString)
            setSampleJSON(modifiedJSONString)
            // creating sample curl by replacing the actuall wehook url and appending sample data
            setSampleCURL(
                CURL_PREFIX.replace('{webhookURL}', _webhookDetails.webhookUrl).replace('{data}', modifiedJSONString),
            )
            if (_isSuperAdmin) {
                const { result } = await getWebhookAPITokenList(
                    _webhookDetails.projectName,
                    _webhookDetails.environmentIdentifier,
                    _webhookDetails.appName,
                )
                const sortedResult =
                    result
                        ?.sort((a, b) => a['name'].localeCompare(b['name']))
                        .map((tokenData) => {
                            return { label: tokenData.name, value: tokenData.id, ...tokenData }
                        }) || []
                setTokenList(sortedResult)
            }
            setLoader(false)
        } catch (error) {
            setIsSuperAdmin(false)
            setLoader(false)
            setErrorInGetData(true)
        }
    }
    const generateToken = async (): Promise<void> => {
        if (!tokenName) {
            setTokenNameError(true)
            return
        }
        setGenerateTokenLoader(true)
        try {
            const payload = {
                name: tokenName,
                description: '',
                expireAtInMs: 0,
            }
            const { result } = await createGeneratedAPIToken(payload)
            if (result) {
                const userPermissionPayload = createUserPermissionPayload({
                    id: result.userId,
                    userIdentifier: result.userIdentifier,
                    userRoleGroups: [],
                    serverMode: SERVER_MODE.FULL,
                    directPermission: [],
                    chartPermission: {} as ChartGroupPermissionsFilter,
                    k8sPermission: [],
                    permissionType: PermissionType.SPECIFIC,
                    userGroups: [],
                    ...getDefaultUserStatusAndTimeout(),
                })
                const { result: userPermissionResponse } = await createOrUpdateUser({
                    ...userPermissionPayload,
                    // Override the role filter
                    roleFilters: [
                        {
                            entity: EntityTypes.DIRECT,
                            entityName: webhookDetails.appName,
                            environment: webhookDetails.environmentIdentifier,
                            team: webhookDetails.projectName,
                            action: ActionTypes.TRIGGER,
                            accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
                            ...getDefaultStatusAndTimeout(),
                        },
                    ],
                })
                if (userPermissionResponse) {
                    setGeneratedAPIToken(result.token)
                }
            }
            setGenerateTokenLoader(false)
        } catch (err) {
            setGenerateTokenLoader(false)
            showError(err)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    const generateTabHeader = (
        tabList: TabDetailsType[],
        selectedTab: string,
        setSelectedTab: (selectedTab: string, index: number) => void | React.Dispatch<React.SetStateAction<string>>,
        isChildTab?: boolean,
        index?: number,
    ): JSX.Element => {
        const tabClickHandler = (e): void => {
            setSelectedTab(e.currentTarget.dataset.key, index)
        }
        return (
            <div className={`${!isChildTab ? 'dc__border-bottom' : ''}`}>
                <TabGroup
                    tabs={tabList.map(({ key, value }) => ({
                        id: key,
                        label: value,
                        tabType: 'button',
                        active: selectedTab === key,
                        props: {
                            onClick: tabClickHandler,
                            'data-key': key,
                        },
                    }))}
                    hideTopPadding
                    alignActiveBorderWithContainer={!isChildTab}
                    size={isChildTab ? ComponentSizeType.medium : ComponentSizeType.large}
                />
            </div>
        )
    }


    const toggleTokenSection = (): void => {
        setShowTokenSection(true)
    }

    const renderActionButton = (): JSX.Element => {
        if (generateTokenLoader) {
            return (
                <div className="w-120">
                    <Progressing />
                </div>
            )
        }
        return (
            <span className="cb-5 cursor top fw-6" onClick={generateToken}>
                Generate token
            </span>
        )
    }

    const renderWebhookURLContainer = (): JSX.Element => {
        return (
            <div className="flexbox dc__content-space mb-16">
                <div className="flexbox w-100 dc__position-rel en-2 bw-1 br-4 h-32 p-6">
                    <div className="bcg-5 cn-0 lh-14 pt-2 pr-8 pb-2 pl-8 fs-12 br-2">POST</div>
                    <div className="bg__primary pl-8 w-100">{webhookDetails?.webhookUrl}</div>
                    <div className="flex">
                        <ClipboardButton content={webhookDetails?.webhookUrl} />
                    </div>
                </div>
            </div>
        )
    }

    const handleTokenChange = (e): void => {
        setTryoutAPIToken(e.target.value)
        if (e.target.value) {
            setTryoutAPITokenError(false)
        }
    }

    const renderWebhookTokenLabel = (): JSX.Element => {
        return (
            <div className="lh-14 pt-2 pr-8 pb-2 pl-8 fs-12 br-2 flex w-120 br-4 border__primary dc__no-right-radius dc__no-right-border">
                api-token
                <Tippy
                    className="default-white no-content-padding tippy-shadow w-300"
                    arrow={false}
                    placement="top"
                    content={
                        <>
                            <div className="flexbox fw-6 p-12 dc__border-bottom-n1">
                                <Help className="icon-dim-20 mr-6 fcv-5" />
                                <span className="fs-14 fw-6 cn-9">Why is API token required?</span>
                            </div>
                            <div className="fs-13 fw-4 cn-9 p-12">
                                API token is required to allow requests from an external service. Use an API token with
                                the permissions mentioned in the above section.
                            </div>
                        </>
                    }
                >
                    <div className="flex">
                        <ICHelpOutline className="icon-dim-16 ml-6" />
                    </div>
                </Tippy>
            </div>
        )
    }

    const renderWebhookURLTokenContainer = (): JSX.Element => {
        return (
            <div className="flexbox w-100 dc__position-rel h-32 mb-16">
                {renderWebhookTokenLabel()}
                <CustomInput
                    name="api-token"
                    placeholder="Enter API token"
                    onChange={handleTokenChange}
                    value={tryoutAPIToken}
                    error={showTryoutAPITokenError && WEBHOOK_NO_API_TOKEN_ERROR}
                    fullWidth
                    borderRadiusConfig={{
                        left: false,
                    }}
                    size={ComponentSizeType.medium}
                />
            </div>
        )
    }

    const renderSelectedToken = (titlePrefix: string, token: string): JSX.Element => {
        return (
            <div>
                <div className="cn-7 mt-16 mb-8 fs-13">{titlePrefix} API token</div>
                <div className="fs-13 font-roboto flexbox dc__word-break pl-8-imp" data-testid="generated-api-token">
                    {token}
                    <div className="flex pl-4">
                        <ClipboardButton content={token} />
                    </div>
                </div>
            </div>
        )
    }

    const renderSelectTokenSection = (): JSX.Element => {

        const handleSelectedTokenChange = (selectedToken): void => {
            setSelectedToken(selectedToken)
        }

        return (
            <>
                <div className="w-400 h-32 mt-16">
                    <SelectPicker
                        inputId="select-token"
                        name="select-token"
                        classNamePrefix="select-token"
                        placeholder="Select API token"
                        isClearable={false}
                        options={getWebhookTokenListOptions(tokenList)}
                        value={selectedToken}
                        onChange={handleSelectedTokenChange}
                        isSearchable={false}
                    />
                </div>
                {selectedToken?.value && renderSelectedToken('Selected', selectedToken.token)}
            </>
        )
    }

    const handleTokenNameChange = (e): void => {
        setTokenName(e.target.value)
        if (e.target.value) {
            setTokenNameError(false)
        }
    }

    const renderGenerateTokenSection = (): JSX.Element => {
        return (
            <div>
                <div className="mt-16">
                    <CustomInput
                        placeholder="Enter token name"
                        name="token-name"
                        label="Token name"
                        value={tokenName}
                        onChange={handleTokenNameChange}
                        disabled={!!generatedAPIToken}
                        error={showTokenNameError && GENERATE_TOKEN_NAME_VALIDATION}
                    />
                    {generatedAPIToken && renderSelectedToken('Generated', generatedAPIToken)}
                </div>
                {!generatedAPIToken && (
                    <InfoColourBar
                        message="An API token with the required permissions will be auto-generated."
                        classname="info_bar mt-16"
                        Icon={InfoIcon}
                        iconClass="h-20"
                        renderActionButton={renderActionButton}
                    />
                )}
            </div>
        )
    }

    const renderTokenSection = (): JSX.Element | null => {
        if (!isSuperAdmin) {
            return (
                <a
                    className="dc__link dc__no-decor fs-13 fw-4"
                    href={DOCUMENTATION.GLOBAL_CONFIG_API_TOKEN}
                    rel="noreferrer noopener"
                    target="_blank"
                >
                    How to generate API tokens?
                </a>
            )
        }
        return !showTokenSection ? (
            <div className="cb-5 fs-13 mt-16 pointer" onClick={toggleTokenSection}>
                Select or auto-generate token with required permissions
            </div>
        ) : (
            <div className="mt-16">
                {generateTabHeader(TOKEN_TAB_LIST, selectedTokenTab, setSelectedTokenTab)}
                {selectedTokenTab === TOKEN_TAB_LIST[0].key && renderSelectTokenSection()}
                {selectedTokenTab === TOKEN_TAB_LIST[1].key && renderGenerateTokenSection()}
            </div>
        )
    }

    const renderCodeSnippet = (value: string, showCopyOption?: boolean): JSX.Element => {
        return (
            <pre
                className="br-4 fs-13 fw-4 cn-9 flexbox dc__content-space dc__position-rel dc__word-break"
                data-testid="sample-script"
            >
                <code>{value}</code>
                {showCopyOption && <ClipboardButton content={value} />}
            </pre>
        )
    }

    const handleSchemaClick = (schemaName: string): void => {
        setSelectedSchema(schemaName)
        schemaRef.current[schemaName]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
            setSelectedSchema('')
        }, 2000)
    }

    const renderSchema = (schemaData: SchemaType, schemaName: string): JSX.Element => {
        return (
            <div
                ref={(el) => (schemaRef.current[schemaName] = el)}
                className={`dc__border-top ${selectedSchema === schemaName ? 'bcy-1' : ''}`}
            >
                <div className="json-schema-row dc__border-bottom pt-8 pb-8 fw-6 fs-13">
                    <span>Name</span>
                    <span>Type</span>
                    <span>Mandatory</span>
                    <span>Description</span>
                </div>
                {Object.keys(schemaData).map((key) => {
                    const data = schemaData[key]
                    return (
                        <div className="json-schema-row pt-8 pb-8 fw-4 fs-13">
                            <span className="dc__ellipsis-right">{key}</span>
                            <span className="dc__ellipsis-right">
                                {data.createLink ? (
                                    <span
                                        className="cb-5 cursor"
                                        onClick={() => handleSchemaClick(`${schemaName}-${key}`)}
                                    >
                                        {key}
                                    </span>
                                ) : (
                                    data.dataType
                                )}
                            </span>
                            <span>{data.optional ? 'false' : 'true'}</span>
                            <span>{data.description}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderSchemaSection = (schema: Record<string, SchemaType>, schemaName: string): JSX.Element => {
        return (
            <div>
                {renderSchema(schema['root'], `${schemaName}-root`)}
                {Object.keys(schema).map((key) => {
                    const data = schema[key]
                    if (key === 'root') {
                        return null
                    }
                    return (
                        <>
                            <div className="cn-9 fs-13 fw-6 mt-8 mb-8">{key}</div>
                            {renderSchema(schema[key], `${schemaName}-root` + `-${key}`)}
                        </>
                    )
                })}
            </div>
        )
    }

    const renderWebhookURLSection = (): JSX.Element => {
        return (
            <div className="pt-16">
                {renderWebhookURLContainer()}
                {renderMetadata()}
                <div className="cn-9 fs-13 fw-6 mb-8">Request body</div>
                {generateTabHeader(REQUEST_BODY_TAB_LIST, selectedRequestBodyTab, setRequestBodyPlaygroundTab, true)}
                {selectedRequestBodyTab === REQUEST_BODY_TAB_LIST[0].key && renderCodeSnippet(sampleJSON, true)}
                {selectedRequestBodyTab === REQUEST_BODY_TAB_LIST[1].key &&
                    renderSchemaSection(webhookDetails.schema, 'requestBody')}
            </div>
        )
    }

    const addMetadata = (e): void => {
        const index = +e.currentTarget.dataset.index
        const _webhookDetails = { ...webhookDetails }
        const currentOption = _webhookDetails.payloadOption[index]
        if (currentOption.mandatory) {
            return
        }
        const _samplePayload = { ...samplePayload }
        const _modifiedSamplePayload = { ...modifiedSamplePayload }
        if (currentOption.isSelected) {
            for (let index = 0; index < currentOption.payloadKey.length; index++) {
                const currentKeys = currentOption.payloadKey[index].split('.')
                if (currentKeys.length === 1) {
                    delete _samplePayload[currentKeys[0]]
                    delete _modifiedSamplePayload[currentKeys[0]]
                } else {
                    delete _samplePayload[currentKeys[0]][0][currentKeys[1]]
                    delete _modifiedSamplePayload[currentKeys[0]][0][currentKeys[1]]
                    if (Object.keys(_samplePayload[currentKeys[0]][0]).length === 0) {
                        delete _samplePayload[currentKeys[0]]
                        delete _modifiedSamplePayload[currentKeys[0]]
                    }
                }
            }
        } else {
            for (let index = 0; index < currentOption.payloadKey.length; index++) {
                const currentKeys = currentOption.payloadKey[index].split('.')
                if (currentKeys.length === 1) {
                    _samplePayload[currentKeys[0]] = ''
                    _modifiedSamplePayload[currentKeys[0]] = ''
                } else {
                    if (!_samplePayload[currentKeys[0]]) {
                        _samplePayload[currentKeys[0]] = [{}]
                        _modifiedSamplePayload[currentKeys[0]] = [{}]
                    }
                    _samplePayload[currentKeys[0]][0][currentKeys[1]] = ''
                    _modifiedSamplePayload[currentKeys[0]][0][currentKeys[1]] = ''
                }
            }
        }
        _webhookDetails.payloadOption[index].isSelected = !currentOption.isSelected
        setWebhookDetails(_webhookDetails)
        setSamplePayload(_samplePayload)
        const _modifiedJSONString = formatSampleJson(_samplePayload)
        setModifiedSamplePayload(_modifiedSamplePayload)

        setModifiedSampleString(_modifiedJSONString)
        setSampleJSON(_modifiedJSONString)
        setSampleCURL(
            CURL_PREFIX.replace('{webhookURL}', _webhookDetails.webhookUrl).replace('{data}', _modifiedJSONString),
        )
    }

    const renderMetadata = (): JSX.Element => {
        return (
            <>
                <div className="cn-9 fs-13 fw-6 mb-8">
                    Select metadata to send to Devtron. Sample JSON and cURL request will be generated accordingly.
                </div>
                <div className="">
                    {webhookDetails?.payloadOption.map((option, index) => (
                        <div
                            key={`md-${index}`}
                            className={`dc__inline-block bw-1 br-4 mr-8 mb-8 pt-2 pr-8 pb-2 pl-8 ${
                                option.isSelected ? 'bcb-1 eb-2' : 'en-2'
                            } ${option.mandatory ? '' : 'pointer'}`}
                            data-index={index}
                            onClick={addMetadata}
                        >
                            <div className="flex">
                                {option.mandatory ? (
                                    <Tag className="icon-dim-16 mr-5" />
                                ) : option.isSelected ? (
                                    <Close className="icon-dim-16 mr-5" />
                                ) : (
                                    <Add className="icon-dim-16 mr-5" />
                                )}
                                <span className="fs-12 fw-4 cn-9">{option.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }

    const renderSampleCurlSection = (): JSX.Element | null => {
        return (
            <div className="pt-16">
                {renderMetadata()}
                {renderCodeSnippet(sampleCURL, true)}
            </div>
        )
    }

    const changePayload = (codeEditorData: string): void => {
        try {
            setModifiedSampleString(codeEditorData)
        } catch (error) {}
    }

    const renderCodeEditor = (): JSX.Element => {
        return (
            <div className="br-4 fs-13 fw-4 cn-9 en-2 bw-1 p-2 pr-5">
                <CodeEditor
                    value={modifiedSampleString}
                    onChange={changePayload}
                    height="300px"
                    mode={MODES.JSON}
                    noParsing
                />
            </div>
        )
    }

    const renderTryOutSection = (): JSX.Element | null => {
        return (
            <div className="pt-16">
                <div className="cn-9 fs-13 fw-6 mb-8">Webhook URL</div>
                {renderWebhookURLContainer()}
                <div className="cn-9 fs-13 fw-6 mb-8">Request header</div>
                {renderWebhookURLTokenContainer()}
                <div className="cn-9 fs-13 fw-6 mb-8">Request body</div>
                {renderCodeEditor()}
            </div>
        )
    }

    const renderTokenPermissionSection = (): JSX.Element | null => {
        return (
            <div className="bg__primary p-16 mb-16 br-4 bw-1 en-2">
                <InfoColourBar
                    message="Authentication via API token is required to allow requests from an external service."
                    classname="info_bar mb-16"
                    Icon={InfoIcon}
                    iconClass="h-20"
                />
                <div className="fw-6 fs-13 cn-9 pb-16">Use API token with below permissions in the cURL request</div>
                <div className="permission-row dc__border-bottom pt-8 pb-8">
                    <span>Project</span>
                    <span>Environment</span>
                    <span>Application</span>
                    <span>Role</span>
                </div>
                <div className="permission-row pt-8 pb-8">
                    <span>{webhookDetails?.projectName}</span>
                    <span>{webhookDetails?.environmentName}</span>
                    <span>{webhookDetails?.appName}</span>
                    <span>{webhookDetails?.role}</span>
                </div>
                {renderTokenSection()}
            </div>
        )
    }

    const renderPlayGroundSection = (): JSX.Element | null => {
        return (
            <div className="bg__primary p-16 br-4 bw-1 en-2 mb-16">
                {generateTabHeader(PLAYGROUND_TAB_LIST, selectedPlaygroundTab, setSelectedPlaygroundTab)}
                {selectedPlaygroundTab === PLAYGROUND_TAB_LIST[0].key && renderWebhookURLSection()}
                {selectedPlaygroundTab === PLAYGROUND_TAB_LIST[1].key && renderSampleCurlSection()}
                {selectedPlaygroundTab === PLAYGROUND_TAB_LIST[2].key && (
                    <>
                        {renderTryOutSection()}
                        {renderTryoutActionSection()}
                        {renderActualResponseSection()}
                    </>
                )}
            </div>
        )
    }

    const setSelectedResponseTab = (selectedTab: string, index: number): void => {
        const _webhookDetails = { ...webhookDetails }
        _webhookDetails.responses[index].selectedTab = selectedTab
        setWebhookDetails(_webhookDetails)
    }

    const renderSampleResponseSection = (): JSX.Element | null => {
        return (
            <div className="bg__primary p-16 br-4 bw-1 en-2">
                <div className="cn-9 fs-13 fw-6 mb-8">Responses</div>
                <div className="cn-9 fs-13 fw-6 mb-8">
                    <div className="response-row dc__border-bottom pt-8 pb-8">
                        <div>Code</div>
                        <div>Description</div>
                    </div>
                    {webhookDetails?.responses.map((response, index) => (
                        <div className="response-row pt-8 pb-8">
                            <div className="fs-13 fw-4 cn-9" data-testid="response-code">
                                {response.code}
                            </div>
                            <div>
                                <div className="fs-13 fw-4 cn-9 mb-16"> {response.description.description}</div>
                                {generateTabHeader(
                                    RESPONSE_TAB_LIST,
                                    response.selectedTab,
                                    setSelectedResponseTab,
                                    true,
                                    index,
                                )}
                                {webhookDetails.responses[index].selectedTab === RESPONSE_TAB_LIST[0].key &&
                                    renderCodeSnippet(formatSampleJson(response.description.exampleValue))}
                                {webhookDetails.responses[index].selectedTab === RESPONSE_TAB_LIST[1].key &&
                                    renderSchemaSection(response.description.schema, `response-${index}`)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const executeWebhook = async (): Promise<void> => {
        if (!tryoutAPIToken) {
            setTryoutAPITokenError(true)
            return
        }
        let _modifiedPayload
        try {
            _modifiedPayload = JSON.parse(modifiedSampleString)
        } catch (error) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid JSON',
            })
            return
        }
        setWebhookExecutionLoader(true)
        try {
            const response = await executeWebhookAPI(webhookDetails.webhookUrl, tryoutAPIToken, _modifiedPayload)
            setWebhookResponse(response)
            setWebhookExecutionLoader(false)
        } catch (error) {
            setWebhookExecutionLoader(false)
            setWebhookResponse(error)
        } finally {
            setTimeout(() => {
                responseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 500)
        }
    }

    const clearWebhookResponse = (): void => {
        setWebhookResponse(null)
    }

    const renderTryoutActionSection = (): JSX.Element => {
        return (
            <div className="flex left mt-20">
                <ButtonWithLoader
                    rootClassName="cta h-28 flex mr-8"
                    onClick={executeWebhook}
                    isLoading={webhookExecutionLoader}
                >
                    <PlayButton className="icon-dim-18 mr-8" />
                    Execute
                </ButtonWithLoader>
                {webhookResponse && (
                    <button className="cta cancel h-28 flex" onClick={clearWebhookResponse}>
                        <Close className="icon-dim-18 mr-8" />
                        Clear
                    </button>
                )}
            </div>
        )
    }

    const renderActualResponseSection = (): JSX.Element | null => {
        if (!webhookResponse) {
            return null
        }
        return (
            <div className="mt-16" ref={responseSectionRef}>
                <div className="cn-9 fs-13 fw-6 mb-8">Server response</div>
                <div className="cn-9 fs-13 fw-6 mb-8">
                    <div className="response-row dc__border-bottom pt-8 pb-8">
                        <div>Code</div>
                        <div>Description</div>
                    </div>
                    <div className="response-row pt-8 pb-8">
                        <div className="fs-13 fw-4 cn-9">{webhookResponse?.['code']}</div>
                        <div>
                            <div className="fs-13 fw-4 cn-9 mb-16">{webhookResponse?.['result'] || '-'}</div>
                            <div className="cn-9 fs-12 fw-6 mt-16 mb-8">Response body</div>
                            {renderCodeSnippet(webhookResponse?.['bodyText'])}
                            <div className="cn-9 fs-12 fw-6 mt-16 mb-8">Response header</div>
                            {renderCodeSnippet(webhookResponse?.['headers'])}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bg__primary pt-16 pr-20 pb-16 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Webhook Details</h2>
                <button type="button" className="dc__transparent flex icon-dim-24" onClick={closeWebhook}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const renderBodySection = (): JSX.Element => {
        return (
            <div className={`p-20 webhook-body ${isSuperAdmin ? 'super-admin-view' : ''}`}>
                {renderTokenPermissionSection()}
                {renderPlayGroundSection()}
                {selectedPlaygroundTab === PLAYGROUND_TAB_LIST[0].key && renderSampleResponseSection()}
            </div>
        )
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div
                className="dc__border-top flex flex-align-center flex-justify bg__primary pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0"
                style={{ width: '75%', minWidth: '1024px', maxWidth: '1200px' }}
            >
                <div className="flexbox pt-8 pb-8">
                    <Help className="icon-dim-20 fcv-5 mr-8" />
                    <span className="fs-13">
                        Only super admin users can generate API tokens. Share the webhook details with a super admin
                        user.
                    </span>
                </div>
                <Button
                    dataTestId="copy-shareable-link"
                    variant={ButtonVariantType.primary}
                    size={ComponentSizeType.medium}
                    onClick={handleCopyButtonClick}
                    startIcon={
                        <ClipboardButton content={clipboardContent} copyToClipboardPromise={copyToClipboardPromise} />
                    }
                    text="Copy shareable link"
                />
            </div>
        )
    }

    const renderPageDetails = (): JSX.Element => {
        if (loader) {
            return <Progressing pageLoader />
        }
        if (errorInGetData) {
            return <Reload />
        }
        return (
            <>
                {renderBodySection()}
                {!isSuperAdmin && renderFooterSection()}
            </>
        )
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="bg__tertiary h-100 webhook-details-container" ref={appStatusDetailRef}>
                {renderHeaderSection()}
                {renderPageDetails()}
            </div>
        </Drawer>
    )
}
