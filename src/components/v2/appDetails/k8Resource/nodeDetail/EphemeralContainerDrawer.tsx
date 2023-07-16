import {
    Drawer,
    multiSelectStyles,
    OptionType,
    RadioGroup,
    RadioGroupItem,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect, useState } from 'react'
import { EDITOR_VIEW } from '../../../../deploymentConfig/constants'
import { EphemeralContainerDrawerType, EphemeralKeyType } from './nodeDetail.type'
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
import { ResponsePayload } from './nodeDetail.type'
import { DropdownIndicator, menuComponentForImage, Option } from '../../../common/ReactSelect.utils'
import ReactSelect from 'react-select'
import { toast } from 'react-toastify'
import { getHostURLConfiguration } from '../../../../../services/service'
import { IMAGE_LIST } from '../../../../ClusterNodes/constants'
import { SwitchItemValues } from '../../../../login/SSOLogin'
import {Options} from "../../appDetails.type";

function EphemeralContainerDrawer({
    ephemeralForm,
    setEphemeralForm,
    setEphemeralContainerDrawer,
    params,
    setEphemeralFormAdvanced,
    ephemeralFormAdvanced,
    containerList,
    resourceContainers,
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
}: EphemeralContainerDrawerType) {
    const [switchManifest, setSwitchManifest] = useState<string>(SwitchItemValues.Configuration)
    const [loader, setLoader] = useState<boolean>(false)
    const appDetails = IndexStore.getAppDetails()

    const [selectedImageList, setSelectedImageList] = useState<OptionType>(null)
    const [selectedTargetContainer, setSelectedTargetContainer] = useState<OptionType>(null)

    useEffect(() => {
        getImageList()
        getOptions()
    }, [])

    const onClickHideLaunchEphemeral = (): void => {
        setEphemeralContainerDrawer(false)
    }

    const handleEphemeralContainerTypeClick = (containerType) => {
        setEphemeralContainerType(containerType)
    }

    const getImageList = () => {
        getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST').then((hostUrlConfig) => {
            if (hostUrlConfig.result) {
                const imageValue: string = hostUrlConfig.result.value
                let filteredImageList = filterImageList(JSON.parse(imageValue), appDetails?.k8sVersion)
                let option = convertToOptionsList(filteredImageList, IMAGE_LIST.NAME, IMAGE_LIST.IMAGE)
                setImageListOption(option)
            }
        })
    }

    const handleEphemeralChange = (e, key: EphemeralKeyType): void => {
        setEphemeralForm({
            ...ephemeralForm,
            basicData: {
                ...ephemeralForm.basicData,
                [key]: e.target.value,
            },
        })
        setEphemeralFormAdvanced({
            ...ephemeralFormAdvanced,
            advancedData: {
                manifest: '',
            },
        })
    }

    const handleManifestTabChange = (e): void => {
        setSwitchManifest(e.target.value)
    }

    const renderEphemeralHeaders = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                    Launch ephemeral container on pod: {params.podName}
                </h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24 "
                    onClick={onClickHideLaunchEphemeral}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const handleContainerSelectChange = (selected, key, defaultOptions) => {
        let defaultVal = defaultOptions.length && defaultOptions[0]
        if (key === 'image') {
            setSelectedImageList(selected)
        } else {
            setSelectedTargetContainer(selected)
        }
        setEphemeralForm({
            ...ephemeralForm,
            basicData: {
                ...ephemeralForm.basicData,
                [key]: selected?.value ?? defaultVal,
            },
        })
    }

    const getOptions = () => {
      if (isResourceBrowserView) {
          setTargetContainerOption(
              resourceContainers.map((container) => {
                  return {
                      label: container.name,
                      value: container.name,
                  }
              }),
          )
      } else {
          setTargetContainerOption(
              containerList &&
                  containerList?.[0]?.containers.map((res) => {
                      return {
                          value: res,
                          label: res,
                      }
                  }),
          )
      }
    }

    const renderBasicEphemeral = (): JSX.Element => {
        return (
            <div>
                <div className="dc__row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">Container name prefix</div>
                    <div>
                        <input
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                            data-testid="preBuild-task-name-textbox"
                            type="text"
                            onChange={(e) => handleEphemeralChange(e, 'containerName')}
                            value={ephemeralForm.basicData.containerName}
                        />
                    </div>
                </div>

                <div className="dc__row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">Image</div>
                    <ReactSelect
                        value={selectedImageList || imageListOption[0]}
                        options={imageListOption}
                        className="select-width"
                        classNamePrefix="select-token-expiry-duration"
                        isSearchable={false}
                        onChange={(e) => handleContainerSelectChange(e, 'image', imageListOption)}
                        components={{
                            IndicatorSeparator: null,
                            MenuList: menuComponentForImage,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            control: (base) => ({
                                ...base,
                                minHeight: '36px',
                                fontWeight: '400',
                                backgroundColor: 'var(--N50)',
                                cursor: 'pointer',
                            }),
                            dropdownIndicator: (base) => ({
                                ...base,
                                padding: '0 8px',
                            }),
                        }}
                    />
                </div>

                <div className="dc__row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">Target Container Name</div>
                    <ReactSelect
                        value={selectedTargetContainer || targetContainerOption?.[0]}
                        options={targetContainerOption}
                        className="select-width"
                        classNamePrefix="select-token-expiry-duration"
                        isSearchable={false}
                        onChange={(e) =>
                            handleContainerSelectChange(e, 'targetContainerName', targetContainerOption[0])
                        }
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            control: (base) => ({
                                ...base,
                                minHeight: '36px',
                                fontWeight: '400',
                                backgroundColor: 'var(--N50)',
                                cursor: 'pointer',
                            }),
                            dropdownIndicator: (base) => ({
                                ...base,
                                padding: '0 8px',
                            }),
                        }}
                    />
                </div>
            </div>
        )
    }

    const renderEphemeralContainerType = () => {
        return (
            <div className="dc__border-bottom pl-20">
                <ul role="tablist" className="tab-list">
                    <li className="pt-8 pr-16 lh-20 fs-13" onClick={() => handleEphemeralContainerTypeClick(EDITOR_VIEW.BASIC)}>
                        <div
                            className={`tab-list__tab-link w-auto pt-0 ${
                                ephemeralContainerType === EDITOR_VIEW.BASIC ? 'active pb-6' : 'pb-8'
                            }`}
                        >
                            Basic
                        </div>
                    </li>
                    <li className="pt-8 pr-16 lh-20 fs-13" onClick={() => handleEphemeralContainerTypeClick(EDITOR_VIEW.ADVANCED)}>
                        <div
                            className={`tab-list__tab-link w-auto pt-0 ${
                                ephemeralContainerType === EDITOR_VIEW.ADVANCED ? 'active pb-6' : 'pb-8'
                            }`}
                        >
                            Advanced
                        </div>
                    </li>
                </ul>
            </div>
        )
    }


    const handleManifestAdvanceChange = (e) => {
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
                    height={300}
                    mode="yaml"
                    onChange={handleManifestAdvanceChange}
                    readOnly={switchManifest === SwitchItemValues.Sample}

                >
                    <CodeEditor.Header>
                        <Switch
                            value={switchManifest}
                            name={'tab'}
                            onChange={handleManifestTabChange}
                        >
                            <SwitchItem  value={SwitchItemValues.Configuration}> Config </SwitchItem>
                            <SwitchItem value={SwitchItemValues.Sample}> Sample Script</SwitchItem>
                        </Switch>
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
        )
    }

    const onSave = () => {
        setLoader(true)
        setEphemeralContainerDrawer(true)
        let payload: ResponsePayload = {
            namespace: appDetails.namespace,
            clusterId: appDetails.clusterId,
            podName: params.podName,
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
            isResourceBrowserView
        )
            .then((response: any) => {
                toast.success('Launched Container Successfully ')
                setEphemeralContainerDrawer(false)
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
                } as Options )

                setResourceContainers(_containers)
                setContainers(_containers)
                setEphemeralContainerDrawer(false)
                switchSelectedContainer(containerName)
            })
            .catch((err) => {
                showError(err)
                setEphemeralContainerDrawer(true)
            })
            .finally(() => {
                setLoader(false)
            })
    }

    const renderEphemeralFooter = (): JSX.Element => {
        return (
            <div className="">
                <div className="dc__border-top w-50 bcn-0 pt-12 pb-12 pl-20 pr-20 flex right bottom-border-radius dc__position-fixed dc__right-0 dc__bottom-0">
                    <ButtonWithLoader
                        rootClassName="flex cta cancel h-36 "
                        onClick={onClickHideLaunchEphemeral}
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
                            ephemeralContainerType === EDITOR_VIEW.BASIC && !ephemeralForm.basicData.containerName
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
                <div className="p-20 ">
                    {ephemeralContainerType === EDITOR_VIEW.BASIC ? renderBasicEphemeral() : renderAdvancedEphemeral()}
                </div>
                {renderEphemeralFooter()}
            </div>
        </Drawer>
    )
}
export default EphemeralContainerDrawer
