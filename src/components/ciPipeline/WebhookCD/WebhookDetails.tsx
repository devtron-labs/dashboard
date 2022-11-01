import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { Drawer, Progressing } from '../../common'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as CopyIcon } from '../../../assets/icons/ic-copy.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { CIPipelineType } from '../types'
import './webhookDetails.scss'
import ReactSelect from 'react-select'
import { OptionType } from '../../app/types'
import { Option } from '../../v2/common/ReactSelect.utils'
import { components } from 'react-select'
import { getUserRole, saveUser } from '../../userGroups/userGroup.service'
import { ACCESS_TYPE_MAP, MODES } from '../../../config'
import { createGeneratedAPIToken, getWebhookAPITokenList } from '../../apiTokens/service'
import { useParams } from 'react-router-dom'
import { getExternalCIConfig } from '../../../services/service'
import { TokenListType } from '../../apiTokens/authorization.type'
import { getDateInMilliseconds } from '../../apiTokens/authorization.utils'
import { ActionTypes, CreateUser, EntityTypes } from '../../userGroups/userGroups.types'

interface TabDetailsType {
    key: string
    value: string
}

interface TokenListOptionsType extends TokenListType {
    label: string
    value: string
}

interface TokenPermissionType {
    projectName: string
    environmentName: string
    appName: string
    role: string
}

interface MetadataType {
    key: string
    keyInObj: string[]
    displayName: string
    isSelected: boolean
    readOnly: boolean
}

export function WebhookDetails({ appName, connectCDPipelines, getWorkflows, close, deleteWorkflow }: CIPipelineType) {
    const tokenTabList: TabDetailsType[] = [
        { key: 'selectToken', value: 'Select API token' },
        { key: 'autoToken', value: 'Auto-generate token' },
    ]
    const playgroundTabList: TabDetailsType[] = [
        { key: 'webhookURL', value: 'Webhook URL' },
        { key: 'sampleCurl', value: 'Sample cURL request' },
        { key: 'try', value: 'Try it out' },
    ]
    const requestBodyTabList: TabDetailsType[] = [
        { key: 'json', value: 'JSON' },
        { key: 'schema', value: 'Schema' },
    ]
    const responseTabList: TabDetailsType[] = [
        { key: 'example', value: 'Example value' },
        { key: 'schema', value: 'Schema' },
    ]
    const formatOptions: OptionType[] = ['STRING', 'BOOL', 'NUMBER', 'DATE'].map((format) => ({
        label: format,
        value: format,
    }))
    const { appId, webhookId } = useParams<{
        appId: string
        webhookId: string
    }>()

    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const [loader, setLoader] = useState(false)
    const [selectedTokenTab, setSelectedTokenTab] = useState<string>(tokenTabList[0].key)
    const [metadataChips, setMetadataChips] = useState<MetadataType[]>([
        {
            key: 'dockerImage',
            keyInObj: ['dockerImage'],
            displayName: 'Container image tag',
            isSelected: true,
            readOnly: true,
        },
        {
            key: 'gitRepository',
            keyInObj: ['ciProjectDetails', 'gitRepository'],
            displayName: 'Git repository',
            isSelected: false,
            readOnly: false,
        },
        {
            key: 'checkoutPath',
            keyInObj: ['ciProjectDetails', 'checkoutPath'],
            displayName: 'Checkout path',
            isSelected: false,
            readOnly: false,
        },
        {
            key: 'commitHash',
            keyInObj: ['ciProjectDetails', 'commitHash'],
            displayName: 'Commit hash',
            isSelected: false,
            readOnly: false,
        },
        {
            key: 'commitTime',
            keyInObj: ['ciProjectDetails', 'commitTime'],
            displayName: 'Date & time of commit',
            isSelected: false,
            readOnly: false,
        },
        {
            key: 'branch',
            keyInObj: ['ciProjectDetails', 'branch'],
            displayName: 'Branch',
            isSelected: false,
            readOnly: false,
        },
        {
            key: 'message',
            keyInObj: ['ciProjectDetails', 'message'],
            displayName: 'Commit message',
            isSelected: false,
            readOnly: false,
        },
        {
            key: 'author',
            keyInObj: ['ciProjectDetails', 'author'],
            displayName: 'Author',
            isSelected: false,
            readOnly: false,
        },
    ])
    const curlBaseValue = `curl -X 'POST'
  'https://demo1.devtron.info:32443/orchestrator/webhook/ext-ci'
  -H 'Content-type: application/json'
  `

    const [tokenName, setTokenName] = useState<string>('')
    const [selectedPlaygroundTab, setSelectedPlaygroundTab] = useState<string>(playgroundTabList[0].key)
    const [selectedRequestBodyTab, setRequestBodyPlaygroundTab] = useState<string>(requestBodyTabList[0].key)
    const [selectedResponse200Tab, setResponse200Tab] = useState<string>(responseTabList[0].key)
    const [selectedResponse400Tab, setResponse400Tab] = useState<string>(responseTabList[0].key)
    const [selectedResponse401Tab, setResponse401Tab] = useState<string>(responseTabList[0].key)
    const [selectedToken, setSelectedToken] = useState<TokenListOptionsType>(null)
    const [generatedAPIToken, setGeneratedAPIToken] = useState<string>(null)
    const [requiredTokenPermission, setRequiredTokenPermission] = useState<TokenPermissionType>(null)
    const [tokenList, setTokenList] = useState<TokenListOptionsType[]>(undefined)
    const [showTokenSection, setShowTokenSection] = useState(false)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [samplePayload, setSamplePayload] = useState<any>(null)
    const [modifiedSamplePayload, setModifiedSamplePayload] = useState<any>(null)
    const [sampleJSON, setSampleJSON] = useState(null)
    const [modifiedSampleJSON, setModifiedSampleJSON] = useState(null)
    const [sampleCURL, setSampleCURL] = useState<any>(null)

    const formatSampleJson = (json): string => {
        let formattedJSON = ''
        formattedJSON = JSON.stringify(json, null, 4)
        return formattedJSON
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }

    const getData = async () => {
        setLoader(true)
        try {
            const [userRole, webhookDetails] = await Promise.all([getUserRole(), getExternalCIConfig(appId, webhookId)])
            const _isSuperAdmin = userRole?.result?.roles?.includes('role:super-admin___')
            setIsSuperAdmin(_isSuperAdmin)
            const _requiredTokenPermission = {
                projectName: webhookDetails['projectName'],
                environmentName: webhookDetails['environmentName'],
                appName: webhookDetails['appName'],
                role: webhookDetails['role'],
            }
            const parsedPayload = JSON.parse(webhookDetails['payload'])
            setSamplePayload(parsedPayload)
            const _modifiedPayload = { ...parsedPayload }
            delete _modifiedPayload.ciProjectDetails
            const modifiedJSONString = formatSampleJson(_modifiedPayload)
            setSampleJSON(modifiedJSONString)
            setModifiedSamplePayload(_modifiedPayload)
            setSampleCURL(curlBaseValue + modifiedJSONString)
            setRequiredTokenPermission(_requiredTokenPermission)
            if (_isSuperAdmin) {
                const { result } = await getWebhookAPITokenList(
                    _requiredTokenPermission.projectName,
                    _requiredTokenPermission.environmentName,
                    _requiredTokenPermission.appName,
                )
                const sortedResult = result
                    .sort((a, b) => a['name'].localeCompare(b['name']))
                    .map((tokenData) => {
                        return { label: tokenData.name, value: tokenData.id, ...tokenData }
                    })
                setTokenList(sortedResult)
            }
            setLoader(false)
        } catch (err) {
            setIsSuperAdmin(false)
            setLoader(false)
        }
    }

    const generateToken = async (): Promise<void> => {
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
                            entityName: requiredTokenPermission.projectName,
                            environment: requiredTokenPermission.environmentName,
                            team: requiredTokenPermission.projectName,
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
        } catch (err) {}
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

    const outputFormatSelectStyle = {
        control: (base, state) => ({
            ...base,
            border: '1px solid var(--N200)',
            boxShadow: 'none',
            minHeight: 'auto',
            height: '32px',
            fontSize: '13px',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            fontSize: '13px',
            padding: '5px 10px',
        }),
        dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
        valueContainer: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            background: 'var(--N50) !important',
            padding: '0px 10px',
            display: 'flex',
            height: '30px',
            fontSize: '13px',
            pointerEvents: 'all',
            whiteSpace: 'nowrap',
            borderRadius: '4px',
        }),
        indicatorsContainer: (base, state) => ({
            ...base,
            background: 'var(--N50) !important',
        }),
    }

    const generateTabHeader = (
        tabList: TabDetailsType[],
        selectedTab: string,
        setSelectedTab: React.Dispatch<React.SetStateAction<string>>,
        isChildTab?: boolean,
    ): JSX.Element => {
        const tabClickHandler = (e): void => {
            setSelectedTab(e.currentTarget.dataset.key)
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

    function formatOptionLabel(option) {
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

    const renderActionButton = () => {
        return (
            <span className="cb-5 cursor top fw-6" onClick={generateToken}>
                Generate token
            </span>
        )
    }

    const renderWebhookURLContainer = () => {
        return (
            <div className="flexbox dc__content-space mb-16">
                <div className="flexbox w-100 dc__position-rel en-2 bw-1 br-4 h-32 p-6">
                    <div className="bcg-5 cn-0 lh-14 pt-2 pr-8 pb-2 pl-8 fs-12 br-2">POST</div>
                    <input
                        type="text"
                        placeholder="Search Token"
                        value={'https://demo1.devtron.info:32443/orchestrator/webhook/ext-ci'}
                        className="bcn-0 dc__no-border form__input"
                    />
                    <button className="flex search__clear-button" type="button">
                        <CopyIcon className="icon-dim-20" />
                    </button>
                </div>
            </div>
        )
    }

    const renderWebhookURLTokenContainer = () => {
        return (
            <div className="flexbox dc__content-space mb-16">
                <div className="flexbox w-100 dc__position-rel en-2 bw-1 br-4 h-32">
                    <div className="lh-14 pt-2 pr-8 pb-2 pl-8 fs-12 br-2 flex w-120 dc__border-right">
                        api-token
                        <Help className="icon-dim-16 ml-8" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Token"
                        value={'https://demo1.devtron.info:32443/orchestrator/webhook/ext-ci'}
                        className="bcn-0 dc__no-border form__input"
                    />
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
                        styles={outputFormatSelectStyle}
                        menuPlacement="auto"
                    />
                </div>
                {selectedToken?.value && (
                    <div>
                        <div className="cn-7 mt-16 mb-8 fs-13">Selected API token</div>
                        <div className="fs-13 font-roboto" style={{ wordBreak: 'break-word' }}>
                            {selectedToken.token}
                        </div>
                    </div>
                )}
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
                    {generatedAPIToken && (
                        <>
                            <div className="mt-16 mb-8">Generated API token</div>
                            <div className="fs-13 font-roboto" style={{ wordBreak: 'break-word' }}>
                                {generatedAPIToken}
                            </div>
                        </>
                    )}
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
                        {generateTabHeader(tokenTabList, selectedTokenTab, setSelectedTokenTab)}
                        {selectedTokenTab === tokenTabList[0].key && renderSelectTokenSection()}
                        {selectedTokenTab === tokenTabList[1].key && renderGenerateTokenSection()}
                    </div>
                )}
            </>
        )
    }

    const renderCodeEditor = (value: string, height: number, MODE?: MODES): JSX.Element => {
        return (
            <pre className="br-4 fs-13 fw-4 cn-9">
                <code>{value}</code>
            </pre>
        )
    }

    const renderWebhookURLSection = (): JSX.Element | null => {
        return (
            <div className="pt-16">
                {renderWebhookURLContainer()}
                {renderMetadata()}
                <div className="cn-9 fs-13 fw-6 mb-8">Request body</div>
                {generateTabHeader(requestBodyTabList, selectedRequestBodyTab, setRequestBodyPlaygroundTab, true)}
                {renderCodeEditor(sampleJSON, 300)}
            </div>
        )
    }

    const addMetadata = (e): void => {
        const index = +e.currentTarget.dataset.index
        const _metadataChips = [...metadataChips]
        const removeData = _metadataChips[index].isSelected
        _metadataChips[index].isSelected = !metadataChips[index].isSelected
        const _modifiedSamplePayload = { ...modifiedSamplePayload }
        // for (let index = 0; index < _modifiedSamplePayload.length; index++) {
        //     const element = _modifiedSamplePayload[index]
        if (removeData) {
            if (_metadataChips[index].keyInObj.length === 1) {
                delete _modifiedSamplePayload[_metadataChips[index].keyInObj[0]]
            } else {
                delete _modifiedSamplePayload[_metadataChips[index].keyInObj[0]][0][_metadataChips[index].keyInObj[1]]
                if (Object.keys(_modifiedSamplePayload[_metadataChips[index].keyInObj[0]][0]).length === 0) {
                    delete _modifiedSamplePayload[_metadataChips[index].keyInObj[0]]
                }
            }
        } else {
            if (_metadataChips[index].keyInObj.length === 1) {
                _modifiedSamplePayload[_metadataChips[index].keyInObj[0]] =
                    samplePayload[_metadataChips[index].keyInObj[0]]
            } else {
                if (!_modifiedSamplePayload[_metadataChips[index].keyInObj[0]]) {
                    _modifiedSamplePayload[_metadataChips[index].keyInObj[0]] = [{}]
                }
                _modifiedSamplePayload[_metadataChips[index].keyInObj[0]][0][_metadataChips[index].keyInObj[1]] =
                    samplePayload[_metadataChips[index].keyInObj[0]][0][_metadataChips[index].keyInObj[1]]
            }
        }
        //}
        setModifiedSamplePayload(_modifiedSamplePayload)
        const _modifiedJSONString = formatSampleJson(_modifiedSamplePayload)
        setSampleJSON(_modifiedJSONString)
        setSampleCURL(curlBaseValue + _modifiedJSONString)
        setMetadataChips(_metadataChips)
    }

    const renderMetadata = (): JSX.Element => {
        return (
            <>
                <div className="cn-9 fs-13 fw-6 mb-8">
                    Select metadata to send to Devtron. Sample JSON and cURL request will be generated accordingly.
                </div>
                <div className="">
                    {metadataChips.map((metaData, index) => (
                        <div
                            key={`md-${index}`}
                            className={`dc__inline-block bw-1 br-4 mr-8 mb-8 pt-2 pr-8 pb-2 pl-8 pointer ${
                                metaData.isSelected ? 'bcb-1 eb-2' : 'en-2'
                            }`}
                            data-index={index}
                            onClick={addMetadata}
                        >
                            <div className="flex">
                                {!metaData.readOnly && (
                                    <>
                                        {metaData.isSelected ? (
                                            <Close className="icon-dim-16 mr-5" />
                                        ) : (
                                            <Add className="icon-dim-16 mr-5" />
                                        )}
                                    </>
                                )}
                                <span className="fs-12 fw-4 cn-9">{metaData.displayName}</span>
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
                {renderCodeEditor(sampleCURL, 300, MODES.SHELL)}
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
                {renderCodeEditor(sampleJSON, 300)}
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
                    <span>{requiredTokenPermission?.projectName}</span>
                    <span>{requiredTokenPermission?.environmentName}</span>
                    <span>{requiredTokenPermission?.appName}</span>
                    <span>{requiredTokenPermission?.role}</span>
                </div>
                {renderTokenSection()}
            </div>
        )
    }

    const renderPlayGroundSection = (): JSX.Element | null => {
        return (
            <div className="bcn-0 p-16 br-4 bw-1 en-2 mb-16">
                {generateTabHeader(playgroundTabList, selectedPlaygroundTab, setSelectedPlaygroundTab)}
                {selectedPlaygroundTab === playgroundTabList[0].key && renderWebhookURLSection()}
                {selectedPlaygroundTab === playgroundTabList[1].key && renderSampleCurlSection()}
                {selectedPlaygroundTab === playgroundTabList[2].key && renderTryOutSection()}
            </div>
        )
    }

    const renderResponseRow = (
        responseCode: number,
        responseDescription: string,
        selectedTab: string,
        setSelectedTab: React.Dispatch<React.SetStateAction<string>>,
        value: string,
    ): JSX.Element => {
        return (
            <div className="response-row pt-8 pb-8">
                <div className="fs-13 fw-4 cn-9">{responseCode}</div>
                <div>
                    <div className="fs-13 fw-4 cn-9 mb-16"> {responseDescription}</div>
                    {generateTabHeader(responseTabList, selectedTab, setSelectedTab, true)}
                    {renderCodeEditor(value, 200)}
                </div>
            </div>
        )
    }

    const renderResponseSection = (): JSX.Element | null => {
        return (
            <div className="bcn-0 p-16 br-4 bw-1 en-2">
                <div className="cn-9 fs-13 fw-6 mb-8">Response</div>
                <div className="cn-9 fs-13 fw-6 mb-8">
                    <div className="response-row dc__border-bottom pt-8 pb-8">
                        <div>Code</div>
                        <div>Description</div>
                    </div>
                    {renderResponseRow(
                        200,
                        'Create or Update helm application response',
                        selectedResponse200Tab,
                        setResponse200Tab,
                        sampleJSON,
                    )}
                    {renderResponseRow(
                        400,
                        'If request is not correct, then this error is thrown',
                        selectedResponse400Tab,
                        setResponse400Tab,
                        sampleJSON,
                    )}
                    {renderResponseRow(
                        401,
                        'If the user is not authenicated, then this error is thrown',
                        selectedResponse401Tab,
                        setResponse401Tab,
                        sampleJSON,
                    )}
                </div>
            </div>
        )
    }

    const renderHeaderSection = (): JSX.Element | null => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pr-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Deploy image from external source</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    onClick={() => {
                        close()
                    }}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const renderBodySection = (): JSX.Element | null => {
        return (
            <div className="p-20 webhook-body">
                {renderTokenPermissionSection()}
                {renderPlayGroundSection()}
                {renderResponseSection()}
            </div>
        )
    }

    const renderFooterSection = (): JSX.Element | null => {
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
                <button className="cta flex h-36">
                    <CopyIcon className="icon-dim-20 mr-8" />
                    Copy shareable link
                </button>
            </div>
        )
    }

    return (
        <Drawer position="right" width="1000px">
            <div className="dc__window-bg h-100 webhook-details-container" ref={appStatusDetailRef}>
                {renderHeaderSection()}
                {loader ? <Progressing pageLoader /> : renderBodySection()}
                {renderFooterSection()}
            </div>
        </Drawer>
    )
}
