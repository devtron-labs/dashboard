import { type JSX, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    GenericFilterEmptyState,
    Icon,
    InfoBlock,
    ModalSidebarPanel,
    showError,
    YAMLtoJSON,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ErrorIcon } from '@Icons/ic-warning-y6.svg'

import { saveClusters, validateCluster } from '../cluster.service'
import { DataListType, SaveClusterPayloadType, UserDetails } from '../cluster.type'
import UserNameDropDownList from '../UseNameListDropdown'
import KubeConfigEditor from './KubeConfigEditor'
import { ConnectClusterViaKubeconfigProps } from './types'
import { renderKubeConfigClusterCountInfo } from './utils'

const ConnectClusterViaKubeconfig = ({ reload, handleModalClose }: ConnectClusterViaKubeconfigProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [saveYamlData, setSaveYamlData] = useState<string>('')
    const [errorText, setErrorText] = useState('')
    const [dataList, setDataList] = useState([])
    const [selectedUserNameOptions, setSelectedUserNameOptions] = useState<Record<string, any>>({})
    const [isClusterSelected, setClusterSelected] = useState<Record<string, boolean>>({})
    const [isClusterDetails, toggleClusterDetails] = useState(false)

    const [saveClusterList, setSaveClusterList] = useState<{ clusterName: string; status: string; message: string }[]>(
        [],
    )

    const areAllEntriesSelected = Object.values(isClusterSelected).every((isSelected) => isSelected)
    const areSomeEntriesSelected = Object.values(isClusterSelected).some((_selected) => _selected)

    const getSaveClusterPayload = (dataLists: DataListType[]) => {
        const saveClusterPayload: SaveClusterPayloadType[] = []
        dataLists.forEach((_dataList) => {
            if (isClusterSelected[_dataList.cluster_name]) {
                const _clusterDetails: SaveClusterPayloadType = {
                    id: _dataList.id,
                    cluster_name: _dataList.cluster_name,
                    insecureSkipTlsVerify: _dataList.insecureSkipTlsVerify,
                    config: selectedUserNameOptions[_dataList.cluster_name]?.config ?? null,
                    active: true,
                    prometheus_url: '',
                    prometheusAuth: {
                        userName: '',
                        password: '',
                        tlsClientKey: '',
                        tlsClientCert: '',
                    },
                    remoteConnectionConfig: _dataList.remoteConnectionConfig,
                    server_url: _dataList.server_url,
                }
                saveClusterPayload.push(_clusterDetails)
            }
        })

        return saveClusterPayload
    }

    const saveClustersDetails = async () => {
        setIsLoading(true)
        try {
            const payload = getSaveClusterPayload(dataList)
            await saveClusters(payload).then((response) => {
                const _clusterList = response.result.map((_clusterSaveDetails) => {
                    let status
                    let message
                    if (
                        _clusterSaveDetails.errorInConnecting.length === 0 &&
                        _clusterSaveDetails.clusterUpdated === false
                    ) {
                        status = 'Added'
                        message = 'Cluster Added'
                    } else if (_clusterSaveDetails.clusterUpdated === true) {
                        status = 'Updated'
                        message = 'Cluster Updated'
                    } else {
                        status = 'Failed'
                        message = _clusterSaveDetails.errorInConnecting
                    }

                    return {
                        clusterName: _clusterSaveDetails.cluster_name,
                        status,
                        message,
                    }
                })
                setSaveClusterList(_clusterList)
            })
            setIsLoading(false)
        } catch (err) {
            setIsLoading(false)
            showError(err)
        }
    }

    const isCheckboxDisabled = () => {
        const clusters = Object.values(selectedUserNameOptions)

        if (clusters.length === 0) {
            return true
        }

        return clusters.every(
            (cluster) => cluster.errorInConnecting !== 'cluster-already-exists' && cluster.errorInConnecting.length > 0,
        )
    }

    const handleClusterDetailCall = async () => {
        await saveClustersDetails()
        toggleClusterDetails(true)
        reload()
    }

    const handleEditConfigClick = () => {
        setClusterSelected({})
        setDataList([])
    }

    const toggleIsSelected = (clusterNameString: string, forceUnselect?: boolean) => {
        const _currentSelections = {
            ...isClusterSelected,
            [clusterNameString]: forceUnselect ? false : !isClusterSelected[clusterNameString],
        }
        setClusterSelected(_currentSelections)
    }

    const toggleSelectAll = (event) => {
        if (isCheckboxDisabled()) {
            return
        }
        const currentSelections = { ...isClusterSelected }
        const _selectAll = event.currentTarget.checked

        Object.keys(currentSelections).forEach((selection) => {
            if (
                selectedUserNameOptions[selection].errorInConnecting !== 'cluster-already-exists' &&
                selectedUserNameOptions[selection].errorInConnecting.length > 0
            ) {
                return
            }

            currentSelections[selection] = _selectAll
        })

        setClusterSelected(currentSelections)
    }

    const validCluster = () => {
        let count = 0

        dataList.forEach((_dataList) => {
            let found = false
            _dataList.userInfos.forEach((userInfo) => {
                if (
                    userInfo.errorInConnecting.length === 0 ||
                    userInfo.errorInConnecting === 'cluster-already-exists'
                ) {
                    found = true
                }
            })
            if (found) {
                count += 1
            }
        })
        return count
    }

    const getAllClustersCheckBoxValue = () => {
        if (areAllEntriesSelected) {
            return CHECKBOX_VALUE.CHECKED
        }
        if (areSomeEntriesSelected) {
            return CHECKBOX_VALUE.INTERMEDIATE
        }
        return null
    }

    const onChangeUserName = (selectedOption: any, clusterDetail: DataListType) => {
        setSelectedUserNameOptions({
            ...selectedUserNameOptions,
            [clusterDetail.cluster_name]: selectedOption,
        })
        toggleIsSelected(clusterDetail.cluster_name, true)
    }

    const validateClusterDetail = async () => {
        setIsLoading(true)
        try {
            const payload = { config: YAMLtoJSON(saveYamlData) }
            const response = await validateCluster(payload)
            const defaultUserNameSelections: Record<string, any> = {}
            const _clusterSelections: Record<string, boolean> = {}
            setDataList([
                ...Object.values<any>(response.result).map((_cluster) => {
                    const _userInfoList = [...Object.values(_cluster.userInfos as UserDetails[])]
                    defaultUserNameSelections[_cluster.cluster_name] = {
                        label: _userInfoList[0].userName,
                        value: _userInfoList[0].userName,
                        errorInConnecting: _userInfoList[0].errorInConnecting,
                        config: _userInfoList[0].config,
                    }
                    _clusterSelections[_cluster.cluster_name] = false

                    return {
                        cluster_name: _cluster.cluster_name,
                        userInfos: _userInfoList,
                        server_url: _cluster.server_url,
                        active: _cluster.active,
                        defaultClusterComponent: _cluster.defaultClusterComponent,
                        insecureSkipTlsVerify: _cluster.insecureSkipTlsVerify,
                        id: _cluster.id,
                        remoteConnectionConfig: _cluster.remoteConnectionConfig,
                    }
                }),
            ])
            setSelectedUserNameOptions(defaultUserNameSelections)
            setClusterSelected(_clusterSelections)
            setIsLoading(false)
            setErrorText('')
        } catch (err: any) {
            setIsLoading(false)
            const error = err?.errors?.[0]
            setErrorText(`${error.userMessage}`)
        }
    }

    const renderClusterDetails = (): JSX.Element => (
        <div className="bg__secondary p-20 flexbox-col flex-grow-1 dc__overflow-auto">
            <div className="bg__primary br-8 flexbox-col flex-grow-1 dc__overflow-auto border__secondary">
                <div
                    data-testid="cluster_list_page_after_selection"
                    className="saved-cluster-list-row cluster-env-list_table dc__grid dc__column-gap-12 fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-20 pr-20  dc__border-bottom-n1"
                >
                    <div data-testid="cluster_validate">CLUSTER</div>
                    <div data-testid="status_validate">STATUS</div>
                    <div data-testid="message_validate">MESSAGE</div>
                </div>
                <div className="dc__overflow-auto flex-grow-1 h-100">
                    {!saveClusterList || saveClusterList.length === 0 ? (
                        <GenericFilterEmptyState />
                    ) : (
                        saveClusterList.map((clusterListDetail, index) => (
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={`api_${index}`}
                                className="saved-cluster-list-row cluster-env-list_table dc__grid dc__column-gap-12 flex-align-center fw-4 cn-9 fs-13 pr-16 pl-16 pt-6 pb-6"
                            >
                                <div
                                    data-testid={`validate-cluster-${clusterListDetail.clusterName}`}
                                    className="flexbox dc__align-items-center ml-2"
                                >
                                    <span className="dc__ellipsis-right">{clusterListDetail.clusterName}</span>
                                </div>
                                <div className="flexbox dc__align-items-center dc__gap-2">
                                    <Icon
                                        name={clusterListDetail.status === 'Failed' ? 'ic-error' : 'ic-success'}
                                        color={null}
                                    />
                                    <div
                                        data-testid={`validate-cluster-${clusterListDetail.status}`}
                                        className="dc__ellipsis-right"
                                    >
                                        {clusterListDetail.status}&nbsp;
                                    </div>
                                </div>
                                <div className="dc__ellipsis-right"> {clusterListDetail.message}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )

    const displayClusterDetails = () =>
        isClusterDetails ? (
            renderClusterDetails()
        ) : (
            <div className="flexbox-col flex-grow-1 dc__overflow-auto p-20 bg__secondary">
                <div className="en-2 bw-1 bg__primary br-4">
                    <InfoBlock
                        borderConfig={{
                            top: false,
                            right: false,
                            bottom: false,
                            left: false,
                        }}
                        borderRadiusConfig={{ top: false, right: false }}
                        description={renderKubeConfigClusterCountInfo(validCluster())}
                    />
                    <div className="cluster-list-row-1 border__secondary--bottom cluster-env-list_table dc__grid dc__column-gap-12 fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-16 pr-16 dc__border-top dc__border-bottom">
                        <div data-testid="select_all_cluster_checkbox">
                            <Checkbox
                                rootClassName={`form__checkbox-label--ignore-cache mb-0 flex${
                                    isCheckboxDisabled() ? ' dc__opacity-0_5' : ''
                                }`}
                                onChange={toggleSelectAll}
                                isChecked={areSomeEntriesSelected}
                                value={getAllClustersCheckBoxValue()}
                                disabled={isCheckboxDisabled()}
                            />
                        </div>
                        <div>CLUSTER</div>
                        <div>USER</div>
                        <div>MESSAGE</div>
                    </div>
                    <div style={{ height: 'auto' }}>
                        {dataList.map((clusterDetail, index) => (
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={`api_${index}`}
                                className="cluster-list-row-1 border__secondary--bottom flex-align-center fw-4 cn-9 fs-13 pr-16 pl-16 pt-6 pb-6"
                                style={{
                                    height: 'auto',
                                    alignItems: 'start',
                                }}
                            >
                                <Checkbox
                                    dataTestId={`checkbox_selection_of_cluster-${clusterDetail.cluster_name}`}
                                    rootClassName={`form__checkbox-label--ignore-cache mb-0 flex${
                                        selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting ===
                                            'cluster-already-exists' ||
                                        !selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting
                                            ? ''
                                            : ' dc__opacity-0_5'
                                    }`}
                                    onChange={() => toggleIsSelected(clusterDetail.cluster_name)}
                                    isChecked={isClusterSelected[clusterDetail.cluster_name]}
                                    value={CHECKBOX_VALUE.CHECKED}
                                    disabled={
                                        selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting ===
                                        'cluster-already-exists'
                                            ? false
                                            : selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting
                                                  .length > 0
                                    }
                                />
                                <div
                                    className="flexbox"
                                    onClick={() => {
                                        if (
                                            selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting !==
                                                'cluster-already-exists' &&
                                            selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting
                                                .length > 0
                                        ) {
                                            return
                                        }
                                        toggleIsSelected(clusterDetail.cluster_name)
                                    }}
                                >
                                    <span className="dc__ellipsis-right">{clusterDetail.cluster_name}</span>
                                </div>
                                <UserNameDropDownList
                                    clusterDetail={clusterDetail}
                                    selectedUserNameOptions={selectedUserNameOptions}
                                    onChangeUserName={onChangeUserName}
                                />
                                <div className="dc__word-break">
                                    {clusterDetail.id !== 0 && (
                                        <div
                                            className="flex left top"
                                            style={{
                                                columnGap: '6px',
                                            }}
                                        >
                                            <ErrorIcon className="icon-dim-16 m-2" />
                                            <span>
                                                {isClusterSelected[clusterDetail.cluster_name]
                                                    ? 'Cluster already exists. Cluster will be updated'
                                                    : 'Cluster already exists.'}
                                            </span>
                                        </div>
                                    )}
                                    {selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting !== '' &&
                                        selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting !==
                                            'cluster-already-exists' && (
                                            <div
                                                className="flex left top"
                                                style={{
                                                    columnGap: '6px',
                                                }}
                                            >
                                                {selectedUserNameOptions[clusterDetail.cluster_name]?.errorInConnecting
                                                    .length !== 0 && (
                                                    <div className="m-2">
                                                        <Icon name="ic-error" color={null} />
                                                    </div>
                                                )}

                                                <span>
                                                    {selectedUserNameOptions[clusterDetail.cluster_name]
                                                        ?.errorInConnecting || ' '}
                                                </span>
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )

    const showEditor = !dataList.length && !isClusterDetails

    return (
        <>
            <div className="flexbox mh-0 flex-grow-1 dc__overflow-hidden">
                <ModalSidebarPanel
                    icon={<Icon name="ic-kubernetes" size={48} color={null} />}
                    heading="Connect Kubernetes Cluster"
                    documentationLink="GLOBAL_CONFIG_CLUSTER"
                    rootClassName="p-20 dc__no-shrink dc__no-background-imp"
                >
                    <p className="m-0">
                        Paste or upload a kubeconfig file to securely link one or more clusters and start managing them
                        through Devtron.
                    </p>
                </ModalSidebarPanel>
                {showEditor ? (
                    <KubeConfigEditor
                        saveYamlData={saveYamlData}
                        setSaveYamlData={setSaveYamlData}
                        errorText={errorText}
                    />
                ) : (
                    displayClusterDetails()
                )}
            </div>
            <div
                className={`flex  border__primary--top px-20 py-12 ${showEditor ? 'dc__content-end' : 'dc__content-space'}`}
            >
                {!showEditor && (
                    <Button
                        text="Edit kubeconfig"
                        startIcon={<Icon name="ic-pencil" color={null} />}
                        disabled={isLoading}
                        style={ButtonStyleType.neutral}
                        dataTestId="get_cluster_button"
                        onClick={handleEditConfigClick}
                        variant={ButtonVariantType.secondary}
                    />
                )}
                <div className="flex dc__gap-12">
                    <Button
                        text="Cancel"
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                        dataTestId="cancel-create-cluster-button"
                        onClick={handleModalClose}
                    />

                    {!isClusterDetails && (
                        <Button
                            text={showEditor ? 'Get Cluster' : 'Save'}
                            disabled={showEditor ? !saveYamlData : !saveClusterList || !areSomeEntriesSelected}
                            dataTestId={showEditor ? 'get_cluster_button' : 'save_cluster_list_button_after_selection'}
                            onClick={showEditor ? validateClusterDetail : handleClusterDetailCall}
                            isLoading={isLoading}
                            endIcon={showEditor ? <Icon name="ic-arrow-right" color={null} /> : null}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default ConnectClusterViaKubeconfig
