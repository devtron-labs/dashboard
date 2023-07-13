import {
    Drawer,
    get,
    multiSelectStyles,
    post,
    RadioGroup,
    RadioGroupItem,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect, useState } from 'react'
import { EDITOR_VIEW } from '../../../../deploymentConfig/constants'
import { EphemeralContainerDrawerType, EphemeralKeyType } from './nodeDetail.type'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { SwitchItemValues } from '../../../../cdPipeline/CDPipeline'
import { ButtonWithLoader, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem } from '../../../../common'
import sampleConfig from './sampleConfig.json'
import yamlJsParser from 'yaml'
import IndexStore from '../../index.store'
import { generateEphemeralUrl } from './nodeDetail.api'
import { OutputTabType } from '../../../../bulkEdits/bulkEdits.type'
import { ResponsePayload } from './nodeDetail.type'
import { DropdownIndicator, Option } from '../../../common/ReactSelect.utils'
import ReactSelect from 'react-select'
import { toast } from 'react-toastify'

function EphemeralContainerDrawer({
    ephemeralForm,
    setEphemeralForm,
    setEphemeralContainerDrawer,
    params,
    setEphemeralFormAdvanced,
    ephemeralFormAdvanced,
    containerList,
}: EphemeralContainerDrawerType) {
    const [ephemeralContainerType, setEphemeralContainerType] = useState<string>(EDITOR_VIEW.BASIC)
    const [switchManifest, setSwitchManifest] = useState<string>(SwitchItemValues.Config)
    const [loader, setLoader] = useState<boolean>(false)
    const appDetails = IndexStore.getAppDetails()
    const onClickHideLaunchEphemeral = (): void => {
        setEphemeralContainerDrawer(false)
    }

    const onChangeEphemeralContainerType = (event): void => {
        setEphemeralContainerType(event.target.value)
    }

    const handleEphemeralChange = (e, key: EphemeralKeyType): void => {
        setEphemeralForm({
            ...ephemeralForm,
            basicData: {
                ...ephemeralForm.basicData,
                [key]: e.target.value,
            },
        })
    }
    const [ephemeralContainerList, setEphemeralContainerList] = useState([])

    const handleManifestTabChange = (e): void => {
        setSwitchManifest(e.target.value)
    }

    const renderEphemeralHeaders = (): JSX.Element => {
        return (
            <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
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

    const handleContainerSelectChange = (selected) => {
        setEphemeralForm({
            ...ephemeralForm,
            basicData: {
                ...ephemeralForm.basicData,
                targetContainerName: selected[0].value,
            },
        })
    }

    const getOptions = (): [{ label: string; value: string }] => {
        return containerList[0].containers.map((res) => {
            return [{ value: res, label: res }]
        })
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
                    <input
                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                        data-testid="preBuild-task-description-textbox"
                        type="text"
                        onChange={(e) => handleEphemeralChange(e, 'image')}
                        value={ephemeralForm.basicData.image}
                        placeholder="Enter task description"
                    />
                </div>

                <div className="dc__row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 dc__required-field">Target Container Name</div>
                    <ReactSelect
                        value={{
                            label: ephemeralForm.basicData.targetContainerName,
                            value: ephemeralForm.basicData.targetContainerName,
                        }}
                        options={getOptions()}
                        className="select-width"
                        classNamePrefix="select-token-expiry-duration"
                        isSearchable={false}
                        onChange={handleContainerSelectChange}
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
            <>
                <ul role="tablist" className="tab-list">
                    <RadioGroup
                        className="ecr-authType__radio-group"
                        value={ephemeralContainerType}
                        name="ecr-authType"
                        onChange={onChangeEphemeralContainerType}
                    >
                        <RadioGroupItem value={EDITOR_VIEW.BASIC} dataTestId="ephemeral-basic-tab">
                            <li className="tab-list__tab dc__ellipsis-right">Basic</li>
                        </RadioGroupItem>
                        <RadioGroupItem value={EDITOR_VIEW.ADVANCED} dataTestId="ephemeral-advanced-tab">
                            <li className="tab-list__tab">Advanced</li>
                        </RadioGroupItem>
                    </RadioGroup>
                </ul>
            </>
        )
    }

    const handleManifestAdvanceChange = (e) => {
        if (switchManifest !== SwitchItemValues.Config) return
        let manifestJson = yamlJsParser.parse(e)
        setEphemeralFormAdvanced({
            ...ephemeralFormAdvanced,
            advancedData: {
                manifest: JSON.stringify(manifestJson),
            },
        })
    }

    const renderAdvancedEphemeral = () => {
        let codeEditorBody =
            switchManifest === SwitchItemValues.Config
                ? ephemeralFormAdvanced.advancedData.manifest
                : yamlJsParser.stringify(sampleConfig?.sampleManifest, { indent: 2 })
        return (
            <div className="mt-24 mr-24 mb-24 code-editor-container">
                <CodeEditor
                    value={codeEditorBody}
                    height={300}
                    mode="yaml"
                    onChange={handleManifestAdvanceChange}
                    readOnly={switchManifest === SwitchItemValues.Sample}
                >
                    <CodeEditor.Header>
                        <Switch
                            value={ephemeralFormAdvanced.advancedData.manifest}
                            name={'tab'}
                            onChange={handleManifestTabChange}
                        >
                            <SwitchItem value={SwitchItemValues.Config}> Config </SwitchItem>
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
        let payload: ResponsePayload = {
            namespace: appDetails.namespace,
            clusterId: appDetails.clusterId,
            podName: params.podName,
        }
        if (ephemeralContainerType === EDITOR_VIEW.BASIC) {
            payload = {
                ...payload,
                basicData: ephemeralForm.basicData,
            }
        } else {
            payload = {
                ...payload,
                advancedData: ephemeralFormAdvanced.advancedData,
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
        )
            .then((response: any) => {
                toast.success('Launched Container Successfully ')
                setEphemeralContainerDrawer(false)
                setEphemeralContainerList(response)
                console.log('ephemeral containers list', response)
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
            })
            .catch((err) => {
                showError(err)
                setEphemeralContainerDrawer(true)
            })
            .finally(() => {
                setLoader(false)
                setEphemeralContainerDrawer(false)
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
                        disabled={loader}
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
                <div className="p-20 ">
                    {renderEphemeralContainerType()}
                    {ephemeralContainerType === EDITOR_VIEW.BASIC ? renderBasicEphemeral() : renderAdvancedEphemeral()}
                </div>
                {renderEphemeralFooter()}
            </div>
        </Drawer>
    )
}
export default EphemeralContainerDrawer
