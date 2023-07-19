import {
    Drawer,
    OptionType,
    showError,
    TippyCustomized,
    TippyTheme,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect, useState } from 'react'
import { EDITOR_VIEW } from '../../../../deploymentConfig/constants'
import {
    EphemeralContainerDrawerType,
    EphemeralForm,
    EphemeralFormAdvancedType,
    ResponsePayload,
} from './nodeDetail.type'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import {
    ButtonWithLoader,
    convertToOptionsList,
    DevtronSwitch as Switch,
    DevtronSwitchItem as SwitchItem,
    filterImageList,
} from '../../../../common'
import sampleConfig from './sampleConfig.json'
import yamlJsParser from 'yaml'
import IndexStore from '../../index.store'
import { generateEphemeralUrl } from './nodeDetail.api'
import { DropdownIndicator, menuComponentForImage, Option } from '../../../common/ReactSelect.utils'
import ReactSelect from 'react-select'
import { toast } from 'react-toastify'
import { getHostURLConfiguration } from '../../../../../services/service'
import { IMAGE_LIST } from '../../../../ClusterNodes/constants'
import { SwitchItemValues } from '../../../../login/SSOLogin'
import { Options } from '../../appDetails.type'
import { ReactComponent as HelpIcon } from '../../../../../assets/icons/ic-help.svg'
import { ReactComponent as QuestionIcon } from '../../../../v2/assets/icons/ic-question.svg'
import { EPHEMERAL_CONTAINER } from '../../../../../config/constantMessaging'
import Tippy from '@tippyjs/react'
import CreatableSelect from 'react-select/creatable'
import { selectStyles } from './nodeDetail.util'

function EphemeralContainerDrawer({
    setShowEphemeralContainerDrawer,
    params,
    setResourceContainers,
    ephemeralContainerType,
    setEphemeralContainerType,
    targetContainerOption,
    setTargetContainerOption,
    imageListOption,
    setImageListOption,
    isResourceBrowserView,
    containers,
    setContainers,
    switchSelectedContainer,
    onClickShowLaunchEphemeral,
    selectedNamespaceByClickingPod,
}: EphemeralContainerDrawerType) {
    const [switchManifest, setSwitchManifest] = useState<string>(SwitchItemValues.Configuration)
    const [loader, setLoader] = useState<boolean>(false)
    const appDetails = IndexStore.getAppDetails()
    const [ephemeralForm, setEphemeralForm] = useState<EphemeralForm>({
        basicData: {
            targetContainerName: '',
            containerName: 'debugger',
            image: '',
        },
    })
    const [ephemeralFormAdvanced, setEphemeralFormAdvanced] = useState<EphemeralFormAdvancedType>({
        advancedData: {
            manifest: yamlJsParser.stringify(sampleConfig?.sampleManifest, { indent: 2 }),
        },
    })
    const [selectedImageList, setSelectedImageList] = useState<OptionType>(null)
    const [selectedTargetContainer, setSelectedTargetContainer] = useState<OptionType>(null)

    useEffect(() => {
        getImageList()
        getOptions()
    }, [])

    const handleEphemeralContainerTypeClick = (containerType) => {
        try {
            let jsonManifest = JSON.parse(
                JSON.stringify(yamlJsParser.parse(ephemeralFormAdvanced.advancedData.manifest)),
            )
            if (jsonManifest) {
                if (containerType === EDITOR_VIEW.ADVANCED) {
                    jsonManifest['name'] = ephemeralForm.basicData?.containerName || ''
                    jsonManifest['image'] = ephemeralForm.basicData?.image || ''
                    jsonManifest['targetContainerName'] =
                        ephemeralForm.basicData.targetContainerName || (containers.length && containers[0].name) || ''
                    setEphemeralFormAdvanced({
                        ...ephemeralFormAdvanced,
                        advancedData: {
                            manifest: yamlJsParser.stringify(jsonManifest, { indent: 2 }),
                        },
                    })
                } else {
                    setEphemeralForm({
                        ...ephemeralForm,
                        basicData: {
                            ...ephemeralForm.basicData,
                            containerName: jsonManifest['name'] || '',
                            image: jsonManifest['image'] || '',
                            targetContainerName: jsonManifest['targetContainerName'] || '',
                        },
                    })
                }
            }
            setEphemeralContainerType(containerType)
            const parsedImage = yamlJsParser.parse(ephemeralFormAdvanced.advancedData.manifest).image
            const parsedImageOption = { label: parsedImage, value: parsedImage }
            const selectedimageValue = imageListOption.find((imageList) => parsedImage === imageList.value)
            if (!selectedimageValue) {
                imageListOption.push(parsedImageOption)
            }
            setSelectedImageList(selectedimageValue ? selectedimageValue : parsedImageOption)
        } catch (err) {}
    }

    const getImageList = () => {
        getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST').then((hostUrlConfig) => {
            if (hostUrlConfig.result) {
                const imageValue: string = hostUrlConfig.result.value
                const filteredImageList = filterImageList(JSON.parse(imageValue), appDetails?.k8sVersion)
                const option = convertToOptionsList(filteredImageList, IMAGE_LIST.NAME, IMAGE_LIST.IMAGE)
                setImageListOption(option)
                setEphemeralForm({
                    ...ephemeralForm,
                    basicData: {
                        ...ephemeralForm.basicData,
                        image:
                            yamlJsParser.parse(ephemeralFormAdvanced.advancedData.manifest).image ||
                            option?.[0]?.value ||
                            '',
                    },
                })
            }
        })
    }

    const handleContainerChange = (e): void => {
        setEphemeralForm({
            ...ephemeralForm,
            basicData: {
                ...ephemeralForm.basicData,
                containerName: e.target.value,
            },
        })
    }

    const handleManifestTabChange = (e): void => {
        setSwitchManifest(e.target.value)
    }

    const renderEphemeralHeaders = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify bcn-0 pb-10 pt-12 pl-20 pr-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding flex left w-90">
                    <span style={{ minWidth: '290px' }}>Launch ephemeral container on pod:</span>
                    <span className="dc__ellipsis-left">{isResourceBrowserView ? params.node : params.podName}</span>
                    <TippyCustomized
                        theme={TippyTheme.white}
                        className="w-300"
                        placement="top"
                        Icon={HelpIcon}
                        iconClass="fcv-5"
                        heading={EPHEMERAL_CONTAINER.TITLE}
                        infoText={EPHEMERAL_CONTAINER.SUBTITLE}
                        showCloseButton={true}
                        trigger="click"
                        interactive={true}
                    >
                        <div className="flex">
                            <QuestionIcon className="icon-dim-16 fcn-6 ml-8 cursor" />
                        </div>
                    </TippyCustomized>
                </h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24 "
                    onClick={onClickShowLaunchEphemeral}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const handleEphemeralChange = (selected, key, defaultOptions) => {
        let defaultVal = defaultOptions.length && defaultOptions[0]
        if (key === 'image') {
            const newImageOption = {
                value: selected.value,
                label: selected.value,
            }
            const existingImageOption = imageListOption.find((option) => option.value === selected.value)
            const newImageListOption = [newImageOption, ...imageListOption]
            if (!existingImageOption) {
                setImageListOption(newImageListOption)
            }
            setSelectedImageList(selected)
        } else {
            setSelectedTargetContainer(selected)
        }
        try {
            setEphemeralForm({
                ...ephemeralForm,
                basicData: {
                    ...ephemeralForm.basicData,
                    [key]: selected?.value ?? defaultVal,
                },
            })
        } catch (err) {}
    }

    const getOptions = () => {
        setTargetContainerOption(
            containers
                .filter((container) => !container.isEphemeralContainer && !container.isInitContainer)
                .map((res) => {
                    return {
                        value: res.name,
                        label: res.name,
                    }
                }),
        )
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    const renderBasicEphemeral = (): JSX.Element => {
        return (
            <div className="p-20">
                <div className="dc__row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            content={
                                <span style={{ display: 'block', width: '220px' }}>
                                    {EPHEMERAL_CONTAINER.CONTAINER_NAME}
                                </span>
                            }
                        >
                            <span className="text-underline-dashed">Container name prefix</span>
                        </Tippy>
                    </div>
                    <div>
                        <input
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5 h-36"
                            data-testid="preBuild-task-name-textbox"
                            type="text"
                            onChange={handleContainerChange}
                            value={ephemeralForm.basicData.containerName}
                        />
                    </div>
                </div>

                <div className="dc__row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            content={
                                <span style={{ display: 'block', width: '220px' }}>{EPHEMERAL_CONTAINER.IMAGE}</span>
                            }
                        >
                            <span className="text-underline-dashed">Image</span>
                        </Tippy>
                    </div>

                    <CreatableSelect
                        value={selectedImageList || imageListOption[0]}
                        options={imageListOption}
                        className="select-width"
                        classNamePrefix="select-token-expiry-duration"
                        onChange={(e) => handleEphemeralChange(e, 'image', imageListOption)}
                        components={{
                            IndicatorSeparator: null,
                            MenuList: menuComponentForImage,
                        }}
                        styles={selectStyles}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="dc__row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            content={
                                <span style={{ display: 'block', width: '220px' }}>
                                    {EPHEMERAL_CONTAINER.TARGET_CONTAINER_NAME}
                                </span>
                            }
                        >
                            <span className="text-underline-dashed">Target Container Name</span>
                        </Tippy>
                    </div>
                    <ReactSelect
                        value={selectedTargetContainer || targetContainerOption?.[0]}
                        options={targetContainerOption}
                        className="select-width"
                        classNamePrefix="select-token-expiry-duration"
                        isSearchable={false}
                        onChange={(e) => handleEphemeralChange(e, 'targetContainerName', targetContainerOption[0])}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        styles={selectStyles}
                    />
                </div>
            </div>
        )
    }

    const renderEphemeralContainerType = () => {
        return (
            <div className="dc__border-bottom pl-20">
                <ul role="tablist" className="tab-list">
                    <li
                        className="pt-4 pr-16 lh-20 fs-13"
                        onClick={() => handleEphemeralContainerTypeClick(EDITOR_VIEW.BASIC)}
                    >
                        <div
                            className={`tab-list__tab-link w-auto pt-0 pb-4 ${
                                ephemeralContainerType === EDITOR_VIEW.BASIC ? 'active' : ''
                            }`}
                        >
                            Basic
                        </div>
                    </li>
                    <li
                        className="pt-4 pr-16 lh-20 fs-13"
                        onClick={() => handleEphemeralContainerTypeClick(EDITOR_VIEW.ADVANCED)}
                    >
                        <div
                            className={`tab-list__tab-link w-auto pt-0 pb-4 ${
                                ephemeralContainerType === EDITOR_VIEW.ADVANCED ? 'active ' : ''
                            }`}
                        >
                            Advanced
                        </div>
                    </li>
                </ul>
            </div>
        )
    }

    const handleManifestAdvanceConfiguration = (e) => {
        if (switchManifest !== SwitchItemValues.Configuration) return
        setEphemeralFormAdvanced({
            ...ephemeralFormAdvanced,
            advancedData: {
                manifest: e,
            },
        })
        setEphemeralForm({
            ...ephemeralForm,
            basicData: {
                targetContainerName: '',
                containerName: '',
                image: '',
            },
        })
    }

    const renderAdvancedEphemeral = () => {
        let codeEditorBody =
            switchManifest === SwitchItemValues.Configuration
                ? ephemeralFormAdvanced.advancedData.manifest
                : yamlJsParser.stringify(sampleConfig?.sampleManifest, { indent: 2 })
        return (
            <div className="mr-24 mb-24 code-editor-container">
                <CodeEditor
                    value={codeEditorBody}
                    mode="yaml"
                    onChange={handleManifestAdvanceConfiguration}
                    readOnly={switchManifest === SwitchItemValues.Sample}
                >
                    <CodeEditor.Header>
                        <Switch value={switchManifest} name="tab" onChange={handleManifestTabChange}>
                            <SwitchItem value={SwitchItemValues.Configuration}> Manifest </SwitchItem>
                            <SwitchItem value={SwitchItemValues.Sample}> Sample manifest</SwitchItem>
                        </Switch>
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
        )
    }

    const onSave = () => {
        setLoader(true)
        setShowEphemeralContainerDrawer(true)
        let payload: ResponsePayload = {
            namespace: isResourceBrowserView ? selectedNamespaceByClickingPod : appDetails.namespace,
            clusterId: isResourceBrowserView ? Number(params.clusterId) : appDetails.clusterId,
            podName: isResourceBrowserView ? params.node : params.podName,
        }

        if (ephemeralContainerType === EDITOR_VIEW.BASIC) {
            payload = {
                ...payload,
                basicData: {
                    containerName: ephemeralForm.basicData.containerName,
                    image: ephemeralForm.basicData?.image ? ephemeralForm.basicData.image : imageListOption[0].value,
                    targetContainerName: ephemeralForm.basicData?.targetContainerName
                        ? ephemeralForm.basicData.targetContainerName
                        : targetContainerOption[0]?.value || '',
                },
            }
        } else {
            payload = {
                ...payload,
                advancedData: {
                    manifest: JSON.stringify(yamlJsParser.parse(ephemeralFormAdvanced.advancedData.manifest)),
                },
            }
        }

        generateEphemeralUrl(
            payload,
            appDetails.clusterId,
            appDetails.environmentId,
            appDetails.namespace,
            appDetails.appName,
            appDetails.appId,
            appDetails.appType,
            isResourceBrowserView,
            params,
        )
            .then((response: any) => {
                toast.success('Launched Container Successfully ')
                setShowEphemeralContainerDrawer(false)
                setEphemeralForm({
                    ...ephemeralForm,
                    basicData: {
                        targetContainerName: '',
                        containerName: '',
                        image: '',
                    },
                })
                setEphemeralFormAdvanced({
                    advancedData: {
                        manifest: '',
                    },
                })

                const _containers = containers
                let containerName = response.result
                _containers.push({
                    name: containerName,
                    isInitContainer: false,
                    isEphemeralContainer: true,
                } as Options)
                setContainers(_containers)
                setResourceContainers(_containers)
                setShowEphemeralContainerDrawer(false)
                switchSelectedContainer(containerName)
            })
            .catch((err) => {
                showError(err)
                setShowEphemeralContainerDrawer(true)
            })
            .finally(() => {
                setLoader(false)
            })
    }

    const renderEphemeralFooter = (): JSX.Element => {
        return (
            <div className="">
                <div className="dc__border-top w-100 bcn-0 pt-12 pb-12 pl-20 pr-20 flex right bottom-border-radius dc__position-abs dc__right-0 dc__bottom-0">
                    <ButtonWithLoader
                        rootClassName="flex cta cancel h-36 "
                        onClick={onClickShowLaunchEphemeral}
                        disabled={loader}
                        dataTestId="cancel-token"
                        isLoading={false}
                        loaderColor="white"
                    >
                        Cancel
                    </ButtonWithLoader>
                    <ButtonWithLoader
                        rootClassName="flex cta h-36 ml-16"
                        onClick={onSave}
                        disabled={
                            ephemeralContainerType === EDITOR_VIEW.BASIC
                                ? !ephemeralForm.basicData.containerName
                                : !ephemeralFormAdvanced.advancedData.manifest
                        }
                        isLoading={loader}
                        loaderColor="white"
                    >
                        Launch container
                    </ButtonWithLoader>
                </div>
            </div>
        )
    }

    return (
        <Drawer position="right" width="50%">
            <div className="bcn-0 h-100 dc__position-rel">
                {renderEphemeralHeaders()}
                {renderEphemeralContainerType()}
                {ephemeralContainerType === EDITOR_VIEW.BASIC ? renderBasicEphemeral() : renderAdvancedEphemeral()}
                {renderEphemeralFooter()}
            </div>
        </Drawer>
    )
}
export default EphemeralContainerDrawer
