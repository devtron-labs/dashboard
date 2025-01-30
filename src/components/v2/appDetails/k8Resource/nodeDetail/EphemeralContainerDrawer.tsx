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

import {
    CustomInput,
    Drawer,
    OptionType,
    showError,
    ButtonWithLoader,
    YAMLStringify,
    InfoIconTippy,
    CodeEditor,
    SelectOption,
    ToastManager,
    ToastVariantType,
    TabGroup,
    SelectPicker,
    MODES,
} from '@devtron-labs/devtron-fe-common-lib'
import { useEffect, useState } from 'react'
import yamlJsParser from 'yaml'
import ReactSelect from 'react-select'
import Tippy from '@tippyjs/react'
import CreatableSelect from 'react-select/creatable'
import {
    EphemeralContainerDrawerType,
    EphemeralForm,
    EphemeralFormAdvancedType,
    ResponsePayload,
} from './nodeDetail.type'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import {
    convertToOptionsList,
    DevtronSwitch as Switch,
    DevtronSwitchItem as SwitchItem,
    filterImageList,
} from '../../../../common'
import sampleConfig from './sampleConfig.json'
import IndexStore from '../../index.store'
import { generateEphemeralUrl } from './nodeDetail.api'
import { menuComponentForImage } from '../../../common/ReactSelect.utils'
import { getHostURLConfiguration } from '../../../../../services/service'
import { IMAGE_LIST } from '../../../../ClusterNodes/constants'
import { Options } from '../../appDetails.type'
import { EPHEMERAL_CONTAINER } from '../../../../../config/constantMessaging'
import { selectStyles } from './nodeDetail.util'
import { DEFAULT_CONTAINER_NAME, SwitchItemValues, DOCUMENTATION, EDITOR_VIEW } from '../../../../../config'

const EphemeralContainerDrawer = ({
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
    handleSuccess,
}: EphemeralContainerDrawerType) => {
    const [switchManifest, setSwitchManifest] = useState<string>(SwitchItemValues.Configuration)
    const [loader, setLoader] = useState<boolean>(false)
    const appDetails = IndexStore.getAppDetails()
    const [ephemeralForm, setEphemeralForm] = useState<EphemeralForm>({
        basicData: {
            targetContainerName: '',
            containerName: DEFAULT_CONTAINER_NAME.DEBUGGER,
            image: '',
        },
    })
    const [ephemeralFormAdvanced, setEphemeralFormAdvanced] = useState<EphemeralFormAdvancedType>({
        advancedData: {
            manifest: YAMLStringify(sampleConfig?.sampleManifest),
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
            const jsonManifest = JSON.parse(
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
                            manifest: YAMLStringify(jsonManifest),
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
            setSelectedImageList(selectedimageValue || parsedImageOption)
        } catch (err) {}
    }

    const getImageList = () => {
        getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST').then((hostUrlConfig) => {
            if (hostUrlConfig.result) {
                const imageValue: string = hostUrlConfig.result.value
                const filteredImageList = filterImageList(JSON.parse(imageValue), appDetails?.k8sVersion)
                const option = convertToOptionsList(
                    filteredImageList,
                    IMAGE_LIST.NAME,
                    IMAGE_LIST.IMAGE,
                    IMAGE_LIST.DESCRIPTION,
                )
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
            <div className="flex flex-align-center flex-justify bg__primary py-12 px-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding flex left w-90">
                    <span style={{ minWidth: '290px' }}>Launch ephemeral container on pod:</span>
                    <span className="dc__ellipsis-left">{isResourceBrowserView ? params.node : params.podName}</span>
                    <InfoIconTippy
                        heading={EPHEMERAL_CONTAINER.TITLE}
                        infoText={EPHEMERAL_CONTAINER.SUBTITLE}
                        iconClassName="icon-dim-20 fcn-6 ml-8"
                        documentationLink={DOCUMENTATION.APP_EPHEMERAL_CONTAINER}
                        documentationLinkText="View Documentation"
                    />
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
        const defaultVal = defaultOptions.length && defaultOptions[0]
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

    const getImageTippyContent = (data) => {
        return (
            <span style={{ display: 'block', width: '220px' }}>
                <span className="fs-12 fw-4">{data.description}</span>
            </span>
        )
    }

    const renderBasicEphemeral = (): JSX.Element => {
        return (
            <div className="p-20 flex-grow-1">
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
                    <CustomInput
                        name="container-name"
                        fullWidth
                        placeholder="Enter container name"
                        onChange={handleContainerChange}
                        value={ephemeralForm.basicData.containerName}
                    />
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
                            Option: (props) => (
                                <SelectOption
                                    showTippy
                                    tippyClass="default-tt"
                                    tippyContent={getImageTippyContent(props.data)}
                                    {...props}
                                />
                            ),
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
                    <SelectPicker
                        inputId="target-container-name"
                        name="target-container-name"
                        value={selectedTargetContainer || targetContainerOption?.[0]}
                        options={targetContainerOption}
                        classNamePrefix="select-token-expiry-duration"
                        isSearchable={false}
                        onChange={(e) => handleEphemeralChange(e, 'targetContainerName', targetContainerOption[0])}
                    />
                </div>
            </div>
        )
    }

    const renderEphemeralContainerType = () => {
        return (
            <div className="dc__border-bottom pl-20">
                <TabGroup
                    tabs={[
                        {
                            id: 'basic-tab',
                            label: 'Basic',
                            tabType: 'button',
                            active: ephemeralContainerType === EDITOR_VIEW.BASIC,
                            props: {
                                onClick: () => handleEphemeralContainerTypeClick(EDITOR_VIEW.BASIC),
                            },
                        },
                        {
                            id: 'advanced-tab',
                            label: 'Advanced',
                            tabType: 'button',
                            active: ephemeralContainerType === EDITOR_VIEW.ADVANCED,
                            props: {
                                onClick: () => handleEphemeralContainerTypeClick(EDITOR_VIEW.ADVANCED),
                            },
                        },
                    ]}
                    hideTopPadding
                    alignActiveBorderWithContainer
                />
            </div>
        )
    }

    const handleManifestAdvanceConfiguration = (e) => {
        if (switchManifest !== SwitchItemValues.Configuration) {
            return
        }
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
        const codeEditorBody =
            switchManifest === SwitchItemValues.Configuration
                ? ephemeralFormAdvanced.advancedData.manifest
                : YAMLStringify(sampleConfig?.sampleManifest)
        return (
            <div className="flex-grow-1 flexbox-col">
                <CodeEditor
                    value={codeEditorBody}
                    mode={MODES.YAML}
                    onChange={handleManifestAdvanceConfiguration}
                    readOnly={switchManifest === SwitchItemValues.Sample}
                    height="fitToParent"
                >
                    <CodeEditor.Header>
                        <Switch value={switchManifest} name="tab" onChange={handleManifestTabChange}>
                            <SwitchItem value={SwitchItemValues.Configuration}> Manifest </SwitchItem>
                            <SwitchItem value={SwitchItemValues.Sample}> Sample manifest</SwitchItem>
                        </Switch>
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
        )
    }

    const onSave = () => {
        setLoader(true)
        setShowEphemeralContainerDrawer(true)
        let payload: ResponsePayload = {
            namespace: isResourceBrowserView
                ? selectedNamespaceByClickingPod
                : appDetails.resourceTree?.nodes?.find((nd) => nd.name === params.podName || nd.name === params.podName)
                      ?.namespace,
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

        generateEphemeralUrl({
            requestData: payload,
            clusterId: appDetails.clusterId,
            environmentId: appDetails.environmentId,
            namespace: appDetails.namespace,
            appName: appDetails.appName,
            appId: appDetails.appId,
            appType: appDetails.appType,
            fluxTemplateType: appDetails.fluxTemplateType,
            isResourceBrowserView,
            params,
        })
            .then((response: any) => {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Launched Container Successfully',
                })
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
                const containerName = response.result
                _containers.push({
                    name: containerName,
                    isInitContainer: false,
                    isEphemeralContainer: true,
                } as Options)
                setContainers(_containers)
                setResourceContainers(_containers)
                setShowEphemeralContainerDrawer(false)
                switchSelectedContainer(containerName)
                if (typeof handleSuccess === 'function') {
                    handleSuccess()
                }
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
            <div className="dc__border-top bg__primary pt-12 pb-12 pl-20 pr-20 flex right bottom-border-radius">
                <ButtonWithLoader
                    rootClassName="flex cta cancel h-36 "
                    onClick={onClickShowLaunchEphemeral}
                    disabled={loader}
                    dataTestId="cancel-token"
                    isLoading={false}
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
                >
                    Launch container
                </ButtonWithLoader>
            </div>
        )
    }

    return (
        <Drawer position="right" width="50%">
            <div className="bg__primary h-100 flexbox-col">
                {renderEphemeralHeaders()}
                {renderEphemeralContainerType()}
                {ephemeralContainerType === EDITOR_VIEW.BASIC ? renderBasicEphemeral() : renderAdvancedEphemeral()}
                {renderEphemeralFooter()}
            </div>
        </Drawer>
    )
}
export default EphemeralContainerDrawer
