import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { Drawer } from '../../common'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as CopyIcon } from '../../../assets/icons/ic-copy.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { CIPipelineType } from '../types'
import './webhookDetails.scss'
import ReactSelect from 'react-select'
import { OptionType } from '../../app/types'
import { Option } from '../../v2/common/ReactSelect.utils'
import { components } from 'react-select'
import { getUserId, getUserRole, saveUser } from '../../userGroups/userGroup.service'
import CodeEditor from '../../CodeEditor/CodeEditor'
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
    const { appId, pipelineId } = useParams<{
        appId: string
        pipelineId: string
    }>()
    const appStatusDetailRef = useRef<HTMLDivElement>(null)
    const [selectedTokenTab, setSelectedTokenTab] = useState<string>(tokenTabList[0].key)
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
    const [sampleJSON, setSampleJSON] = useState(
        JSON.stringify({
            ciProjectDetails: [
                {
                    commitHash: '239077135f8cdeeccb7857e2851348f558cb53d3',
                    commitTime: '2019-10-31T20:55:21+05:30',
                    message: 'Update README.md',
                    author: 'Suraj Gupta ',
                },
            ],
            dockerImage: '445808685819.dkr.ecr.us-east-2.amazonaws.com/orch:23907713-2',
            digest: 'test1',
            dataSource: 'ext',
            materialType: 'git',
        }),
    )
    const [sampleCURL, setSampleCURL] = useState(
      `curl -X 'POST'
      'https://demo1.devtron.info:32443/orchestrator/webhook/ext-ci'
      -H 'Content-type: application/json'
      "ciProjectDetails": [
        {
          "commitHash": "239077135f8cdeeccb7857e2851348f558cb53d3",
          "commitTime": "2019-10-31T20:55:21+05:30",
          "message": "Update README.md",
          "author": "Suraj Gupta "
        }
      ],
      "dockerImage": "445808685819.dkr.ecr.us-east-2.amazonaws.com/orch:23907713-2",
      "digest": "test1",
      "dataSource": "ext",
      "materialType": "git"`,
    )

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof close === 'function') {
            evt.preventDefault()
            close()
        }
    }

    const getData = async () => {
        try {
            const [userRole, webhookDetails] = await Promise.all([
                getUserRole(),
                getExternalCIConfig(appId, pipelineId),
            ])
            const _isSuperAdmin = userRole?.result?.roles?.includes('role:super-admin___')
            setIsSuperAdmin(_isSuperAdmin)
            const _requiredTokenPermission = {
                projectName: webhookDetails[0]['projectName'],
                environmentName: webhookDetails[0]['environmentName'],
                appName: webhookDetails[0]['appName'],
                role: webhookDetails[0]['role'],
            }
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
        } catch (err) {
            setIsSuperAdmin(false)
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

    const renderWebhookURLSection = (): JSX.Element | null => {
        return (
            <div className="pt-16">
                {renderWebhookURLContainer()}
                <div className="cn-9 fs-13 fw-6 mb-8">
                    Select metadata to send to Devtron. Sample JSON and cURL request will be generated accordingly.
                </div>
                <div className="cn-9 fs-13 fw-6 mb-8">Request body</div>
                {generateTabHeader(requestBodyTabList, selectedRequestBodyTab, setRequestBodyPlaygroundTab, true)}
                <div className="en-2 bw-1 br-4 p-2">
                    <CodeEditor theme="vs-alice-blue" value={sampleJSON} mode={MODES.JSON} readOnly={true} height={300}></CodeEditor>
                </div>
            </div>
        )
    }

    const renderSampleCurlSection = (): JSX.Element | null => {
        return (
            <div className="pt-16">
                <div className="cn-9 fs-13 fw-6 mb-8">
                    Select metadata to send to Devtron. Sample JSON and cURL request will be generated accordingly.
                </div>
                <div className="en-2 bw-1 br-4 p-2">
                    <CodeEditor theme="vs-alice-blue" value={sampleCURL} mode={MODES.SHELL} readOnly={true} height={300}></CodeEditor>
                </div>
            </div>
        )
    }

    const renderTryOutSection = (): JSX.Element | null => {
        return (
            <div className="pt-16">
                <div className="cn-9 fs-13 fw-6 mb-8">Webhook URL</div>
                {renderWebhookURLContainer()}
                <div className="cn-9 fs-13 fw-6 mb-8">Request header</div>

                <div className="cn-9 fs-13 fw-6 mb-8">Request body</div>
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

    const renderResponseSection = (): JSX.Element | null => {
        return (
            <div className="bcn-0 p-16 br-4 bw-1 en-2">
                <div className="cn-9 fs-13 fw-6 mb-8">Response</div>
                <div className="cn-9 fs-13 fw-6 mb-8">
                    <div className="response-row dc__border-bottom pt-8 pb-8">
                        <div>Code</div>
                        <div>Description</div>
                    </div>
                    <div className="response-row pt-8 pb-8">
                        <div>200</div>
                        <div>
                            <div> Create or Update helm application response</div>

                            {generateTabHeader(responseTabList, selectedResponse200Tab, setResponse200Tab, true)}
                            <div className="en-2 bw-1 br-4 p-2">
                                <CodeEditor
                                theme="vs-alice-blue"
                                    value={sampleJSON}
                                    mode={MODES.JSON}
                                    readOnly={true}
                                    inline
                                    height={300}
                                ></CodeEditor>
                            </div>
                        </div>
                    </div>
                    <div className="response-row pt-8 pb-8">
                        <div>400</div>
                        <div>
                            <div> Create or Update helm application response</div>

                            {generateTabHeader(responseTabList, selectedResponse400Tab, setResponse400Tab, true)}
                            <div className="en-2 bw-1 br-4 p-2">
                                <CodeEditor
                                theme="vs-alice-blue"
                                    value={sampleJSON}
                                    mode={MODES.JSON}
                                    readOnly={true}
                                    inline
                                    height={300}
                                ></CodeEditor>
                            </div>
                        </div>
                    </div>
                    <div className="response-row pt-8 pb-8">
                        <div>401</div>
                        <div>
                            <div> Create or Update helm application response</div>

                            {generateTabHeader(responseTabList, selectedResponse401Tab, setResponse401Tab, true)}
                            <div className="en-2 bw-1 br-4 p-2">
                                <CodeEditor

                        noParsing
                                theme="vs-alice-blue"
                                    value={sampleJSON}
                                    mode={MODES.JSON}
                                    readOnly={true}
                                    height={300}
                                ></CodeEditor>
                            </div>
                        </div>
                    </div>
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
                {renderBodySection()}
                {renderFooterSection()}
            </div>
        </Drawer>
    )
}
