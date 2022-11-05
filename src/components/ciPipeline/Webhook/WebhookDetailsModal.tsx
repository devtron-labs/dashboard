import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ButtonWithLoader, copyToClipboard, Drawer, Progressing, showError } from '../../common'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as PlayButton } from '../../../assets/icons/ic-play.svg'
import { ReactComponent as Clipboard } from '../../../assets/icons/ic-copy.svg'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import './webhookDetails.scss'
import ReactSelect from 'react-select'
import { Option } from '../../v2/common/ReactSelect.utils'
import { components } from 'react-select'
import { getUserRole, saveUser } from '../../userGroups/userGroup.service'
import { ACCESS_TYPE_MAP, MODES } from '../../../config'
import { createGeneratedAPIToken } from '../../apiTokens/service'
import { useParams } from 'react-router-dom'
import { getDateInMilliseconds } from '../../apiTokens/authorization.utils'
import { ActionTypes, CreateUser, EntityTypes } from '../../userGroups/userGroups.types'
import {
    CURL_PREFIX,
    PLAYGROUND_TAB_LIST,
    REQUEST_BODY_TAB_LIST,
    RESPONSE_TAB_LIST,
    SELECT_TOKEN_STYLE,
    TOKEN_TAB_LIST,
} from './webhook.utils'
import { SchemaType, TabDetailsType, TokenListOptionsType, WebhookDetailsType, WebhookDetailType } from './types'
import { executeWebhookAPI, getExternalCIConfig, getWebhookAPITokenList } from './webhook.service'
import Tippy from '@tippyjs/react'
import { toast } from 'react-toastify'
import CodeEditor from '../../CodeEditor/CodeEditor'

export function WebhookDetailsModal({ getWorkflows, close, deleteWorkflow }: WebhookDetailType) {
    const { appId, webhookId } = useParams<{
        appId: string
        webhookId: string
    }>()
    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const [loader, setLoader] = useState(false)
    const [webhookExecutionLoader, setWebhookExecutionLoader] = useState(false)
    const [generateTokenLoader, setGenerateTokenLoader] = useState(false)
    const [selectedTokenTab, setSelectedTokenTab] = useState<string>(TOKEN_TAB_LIST[0].key)
    const [tokenName, setTokenName] = useState<string>('')
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
    const [sampleJSON, setSampleJSON] = useState(null)
    const [sampleCURL, setSampleCURL] = useState<any>(null)
    const [tryoutAPIToken, setTryoutAPIToken] = useState<string>(null)
    const [webhookDetails, setWebhookDetails] = useState<WebhookDetailsType>(null)
    const [copied, setCopied] = useState(false)

    const formatSampleJson = (json): string => {
        let formattedJSON = ''
        formattedJSON = JSON.stringify(json, null, 4)
        return formattedJSON
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

    const flattenObject = (ob: Object, tableName: string): Record<string, SchemaType> => {
        let toReturn = {}
        toReturn[tableName] = {}
        for (let key in ob) {
            if (!ob.hasOwnProperty(key)) continue
            const currentElement = ob[key]
            if (currentElement.child) {
                var flatObject = flattenObject(
                    currentElement.dataType === 'Array' ? currentElement.child[0] : currentElement.child,
                    key,
                )
                currentElement.createLink = true
                currentElement.dataType = key
                delete currentElement.child
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue
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
                getExternalCIConfig(appId, webhookId),
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
            delete _modifiedPayload.ciProjectDetails
            const modifiedJSONString = formatSampleJson(_modifiedPayload)
            setSamplePayload(_modifiedPayload)
            setModifiedSamplePayload(_modifiedPayload)
            setSampleJSON(modifiedJSONString)
            setSampleCURL(CURL_PREFIX + modifiedJSONString)
            if (_isSuperAdmin) {
                const { result } = await getWebhookAPITokenList(
                    _webhookDetails.projectName,
                    _webhookDetails.environmentName,
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
        } catch (err) {
            setIsSuperAdmin(false)
            setLoader(false)
        }
    }

    const generateToken = async (): Promise<void> => {
        setGenerateTokenLoader(true)
        try {
            const payload = {
                name: tokenName,
                description: '',
                expireAtInMs: getDateInMilliseconds(30),
            }
            const { result } = await createGeneratedAPIToken(payload)
            if (result) {
                const userPermissionPayload: CreateUser = {
                    id: result.userId,
                    email_id: result.userIdentifier,
                    groups: [],
                    roleFilters: [
                        {
                            entity: EntityTypes.DIRECT,
                            entityName: webhookDetails.projectName,
                            environment: webhookDetails.environmentName,
                            team: webhookDetails.projectName,
                            action: ActionTypes.TRIGGER,
                            accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
                        },
                    ],
                    superAdmin: false,
                }
                const { result: userPermissionResponse } = await saveUser(userPermissionPayload)
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
            <ul role="tablist" className={`tab-list ${isChildTab ? '' : 'dc__border-bottom'}`}>
                {tabList.map((tabDetail) => (
                    <li
                        key={tabDetail.key}
                        className="tab-list__tab pointer"
                        onClick={tabClickHandler}
                        data-key={tabDetail.key}
                    >
                        <div
                            className={`mb-6 ${isChildTab ? 'fs-12 child-tab' : 'fs-13'} tab-hover${
                                selectedTab === tabDetail.key ? ' fw-6 active' : ' fw-4'
                            }`}
                        >
                            {tabDetail.value}
                        </div>
                        {selectedTab === tabDetail.key && (
                            <div className={`tab-list_active-tab ${isChildTab ? 'child-tab' : ''}`} />
                        )}
                    </li>
                ))}
            </ul>
        )
    }

    function formatOptionLabel(option): JSX.Element {
        return (
            <div className="flexbox justify-space">
                <span className="cn-9 fw-4">{option.label}</span>
                <span className="cn-5 fw-4 font-roboto">Has access</span>
            </div>
        )
    }

    const ValueContainer = (props) => {
        let value = props.getValue()[0]?.label
        return (
            <components.ValueContainer {...props}>
                <>
                    {!props.selectProps.menuIsOpen &&
                        (value ? `${value}` : <span className="cn-5">Select API token</span>)}
                    {React.cloneElement(props.children[1])}
                </>
            </components.ValueContainer>
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
        } else {
            return (
                <span className="cb-5 cursor top fw-6" onClick={generateToken}>
                    Generate token
                </span>
            )
        }
    }

    const renderWebhookURLContainer = (): JSX.Element => {
        return (
            <div className="flexbox dc__content-space mb-16">
                <div className="flexbox w-100 dc__position-rel en-2 bw-1 br-4 h-32 p-6">
                    <div className="bcg-5 cn-0 lh-14 pt-2 pr-8 pb-2 pl-8 fs-12 br-2">POST</div>
                    <div className="bcn-0 pl-8 w-100">{webhookDetails?.webhookUrl}</div>
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={copied ? 'Copied!' : 'Copy'}
                        trigger="mouseenter click"
                        onShow={(instance) => {
                            setCopied(false)
                        }}
                        interactive={true}
                    >
                        <Clipboard
                            className="pointer hover-only icon-dim-16"
                            onClick={() => {
                                copyToClipboard(webhookDetails?.webhookUrl, () => {
                                    setCopied(true)
                                })
                            }}
                        />
                    </Tippy>
                </div>
            </div>
        )
    }

    const handleTokenChange = (e): void => {
        setTryoutAPIToken(e.target.value)
    }

    const renderWebhookURLTokenContainer = (): JSX.Element => {
        return (
            <div className="flexbox dc__content-space mb-16">
                <div className="flexbox w-100 dc__position-rel en-2 bw-1 br-4 h-32">
                    <div className="lh-14 pt-2 pr-8 pb-2 pl-8 fs-12 br-2 flex w-120 dc__border-right">
                        api-token
                        <Help className="icon-dim-16 ml-8" />
                    </div>
                    <input
                        type="text"
                        placeholder="Enter API token"
                        className="bcn-0 dc__no-border form__input"
                        onChange={handleTokenChange}
                        value={tryoutAPIToken}
                    />
                </div>
            </div>
        )
    }

    const renderSelectedToken = (titlePrefix: string, token: string): JSX.Element => {
        return (
            <div>
                <div className="cn-7 mt-16 mb-8 fs-13">{titlePrefix} API token</div>
                <div className="fs-13 font-roboto flexbox" style={{ wordBreak: 'break-word' }}>
                    {token}
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={copied ? 'Copied!' : 'Copy'}
                        trigger="mouseenter click"
                        onShow={(instance) => {
                            setCopied(false)
                        }}
                        interactive={true}
                    >
                        <Clipboard
                            className="ml-8 mt-5 pointer hover-only icon-dim-16"
                            onClick={() => {
                                copyToClipboard(token, () => {
                                    setCopied(true)
                                })
                            }}
                        />
                    </Tippy>
                </div>
            </div>
        )
    }

    const renderSelectTokenSection = (): JSX.Element => {
        return (
            <>
                <div className="w-400 h-32 mt-16">
                    <ReactSelect
                        value={selectedToken}
                        tabIndex={1}
                        onChange={setSelectedToken}
                        options={tokenList}
                        isSearchable={false}
                        formatOptionLabel={formatOptionLabel}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            ValueContainer,
                        }}
                        styles={SELECT_TOKEN_STYLE}
                        menuPlacement="auto"
                    />
                </div>
                {selectedToken?.value && renderSelectedToken('Selected', selectedToken.token)}
            </>
        )
    }

    const handleTokenNameChange = (e): void => {
        setTokenName(e.target.value)
    }

    const renderGenerateTokenSection = (): JSX.Element => {
        return (
            <div>
                <div className="mt-16">
                    <div className="mb-8">Token name*</div>
                    <input
                        type="text"
                        className="form__input"
                        value={tokenName}
                        onChange={handleTokenNameChange}
                        disabled={!!generatedAPIToken}
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
            return null
        }
        return (
            <>
                {!showTokenSection && (
                    <div className="cb-5 fs-13 mt-16 pointer" onClick={toggleTokenSection}>
                        Select or auto-generate token with required permissions
                    </div>
                )}
                {showTokenSection && (
                    <div className="mt-16">
                        {generateTabHeader(TOKEN_TAB_LIST, selectedTokenTab, setSelectedTokenTab)}
                        {selectedTokenTab === TOKEN_TAB_LIST[0].key && renderSelectTokenSection()}
                        {selectedTokenTab === TOKEN_TAB_LIST[1].key && renderGenerateTokenSection()}
                    </div>
                )}
            </>
        )
    }

    const renderCodeSnippet = (value: string, showCopyOption?: boolean): JSX.Element => {
        return (
            <pre className="br-4 fs-13 fw-4 cn-9 dc__position-rel">
                {showCopyOption && (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={copied ? 'Copied!' : 'Copy'}
                        trigger="mouseenter click"
                        onShow={(instance) => {
                            setCopied(false)
                        }}
                        interactive={true}
                    >
                        <Clipboard
                            className="pointer hover-only icon-dim-16 dc__position-abs"
                            style={{ right: '8px' }}
                            onClick={() => {
                                copyToClipboard(value, () => {
                                    setCopied(true)
                                })
                            }}
                        />
                    </Tippy>
                )}
                <code>{value}</code>
            </pre>
        )
    }

    const renderSchema = (schemaData: SchemaType): JSX.Element => {
        return (
            <div className="dc__border-top">
                <div className="json-schema-row dc__border-bottom pt-8 pb-8 fw-6 fs-13">
                    <span>Name</span>
                    <span>Type</span>
                    <span>Mandatory</span>
                    <span>Description</span>
                </div>
                {Object.keys(schemaData).map((key) => {
                    const data = schemaData[key]
                    return (
                        <div className="json-schema-row pt-8 pb-8 fw-4 fs-12">
                            <span>{key}</span>
                            <span>{data.createLink ? <a>{key}</a> : data.dataType}</span>
                            <span>{data.optional ? 'false' : 'true'}</span>
                            <span>{data.description}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderSchemaSection = (schema: Record<string, SchemaType>): JSX.Element => {
        return (
            <div>
                {renderSchema(schema['root'])}
                {Object.keys(schema).map((key) => {
                    const data = schema[key]
                    if (key === 'root') return null
                    else
                        return (
                            <>
                                <div className="cn-9 fs-13 fw-6 mt-8 mb-8">{key}</div>
                                {renderSchema(schema[key])}
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
                {selectedRequestBodyTab === REQUEST_BODY_TAB_LIST[1].key && renderSchemaSection(webhookDetails.schema)}
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
        setSampleJSON(_modifiedJSONString)
        setSampleCURL(CURL_PREFIX.replace('{webhookURL}', webhookDetails.webhookUrl) + _modifiedJSONString)
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
                                {!option.mandatory && (
                                    <>
                                        {option.isSelected ? (
                                            <Close className="icon-dim-16 mr-5" />
                                        ) : (
                                            <Add className="icon-dim-16 mr-5" />
                                        )}
                                    </>
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
        setModifiedSamplePayload(JSON.parse(codeEditorData))
    }

    const renderCodeEditor = (): JSX.Element => {
        return (
            <div className="br-4 fs-13 fw-4 cn-9 en-2 bw-1 p-2 pr-5">
                <CodeEditor
                    value={formatSampleJson(modifiedSamplePayload)}
                    onChange={changePayload}
                    height="300px"
                    mode={MODES.JSON}
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
            <div className="bcn-0 p-16 mb-16 br-4 bw-1 en-2">
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
            <div className="bcn-0 p-16 br-4 bw-1 en-2 mb-16">
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
            <div className="bcn-0 p-16 br-4 bw-1 en-2">
                <div className="cn-9 fs-13 fw-6 mb-8">Responses</div>
                <div className="cn-9 fs-13 fw-6 mb-8">
                    <div className="response-row dc__border-bottom pt-8 pb-8">
                        <div>Code</div>
                        <div>Description</div>
                    </div>
                    {webhookDetails?.responses.map((response, index) => (
                        <div className="response-row pt-8 pb-8">
                            <div className="fs-13 fw-4 cn-9">{response.code}</div>
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
                                    renderSchemaSection(response.description.schema)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const executeWebhook = async (): Promise<void> => {
        if (!tryoutAPIToken) {
            toast.error('API token is required field')
            return
        }
        setWebhookExecutionLoader(true)
        try {
            const response = await executeWebhookAPI(webhookDetails.webhookUrl, tryoutAPIToken, modifiedSamplePayload)
            setWebhookResponse(response)
            setWebhookExecutionLoader(false)
        } catch (error) {
            setWebhookExecutionLoader(false)
            setWebhookResponse(error)
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
                    loaderColor="white"
                >
                    <PlayButton className="icon-dim-18 mr-8" />
                    Execute
                </ButtonWithLoader>
                <button className="cta cancel h-28 flex" onClick={clearWebhookResponse}>
                    <Close className="icon-dim-18 mr-8" />
                    Clear
                </button>
            </div>
        )
    }

    const renderActualResponseSection = (): JSX.Element | null => {
        if (!webhookResponse) {
            return null
        } else {
            return (
                <div className="mt-16">
                    <div className="cn-9 fs-13 fw-6 mb-8">Server response</div>
                    <div className="cn-9 fs-13 fw-6 mb-8">
                        <div className="response-row dc__border-bottom pt-8 pb-8">
                            <div>Code</div>
                            <div>Description</div>
                        </div>
                        <div className="response-row pt-8 pb-8">
                            <div className="fs-13 fw-4 cn-9">{'000'}</div>
                            <div>
                                <div className="fs-13 fw-4 cn-9 mb-16"> {'Some error'}</div>
                                <div className="cn-9 fs-12 fw-6 mt-16 mb-8">Response body</div>
                                {renderCodeSnippet('value')}
                                <div className="cn-9 fs-12 fw-6 mt-16 mb-8">Response header</div>
                                {renderCodeSnippet('value')}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pr-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Deploy image from external source</h2>
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

    const copySharableURL = (): void => {
        copyToClipboard(window.location.href, () => {
            toast.success('URL copied successfully')
        })
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div
                className="dc__border-top flex flex-align-center flex-justify bcn-0 pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0"
                style={{ width: '1000px' }}
            >
                <div className="flexbox pt-8 pb-8">
                    <Help className="icon-dim-20 fcv-5 mr-8" />
                    <span>
                        Only super admin users can generate API tokens. Share the webhook details with a super admin
                        user.
                    </span>
                </div>
                <button className="cta flex h-36" onClick={copySharableURL}>
                    <Clipboard className="mr-8 icon-dim-16" />
                    Copy shareable link
                </button>
            </div>
        )
    }

    return (
        <Drawer position="right" width="1024px">
            <div className="dc__window-bg h-100 webhook-details-container" ref={appStatusDetailRef}>
                {renderHeaderSection()}
                {loader ? (
                    <Progressing pageLoader />
                ) : (
                    <>
                        {renderBodySection()}
                        {!isSuperAdmin && renderFooterSection()}
                    </>
                )}
            </div>
        </Drawer>
    )
}
