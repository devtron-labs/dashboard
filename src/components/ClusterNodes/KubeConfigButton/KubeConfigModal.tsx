/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { useState } from 'react'
import ReactGA from 'react-ga4'
import {
    BulkSelectionIdentifiersType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ClipboardButton,
    ClusterDetail,
    ClusterStatusType,
    ComponentSizeType,
    copyToClipboard,
    Icon,
    SelectPicker,
    SelectPickerOptionType,
    Toggle,
    useBulkSelection,
    VisibleModal2,
} from '@devtron-labs/devtron-fe-common-lib'
import { GroupBase } from 'react-select'
import { KubeConfigTippyContentProps } from './types'
import { getKubeConfigCommand } from './utils'

const DefaultSelectPickerOptionType = {
    label: 'Do not set context',
    value: 'Do not set context',
}

const getOptions = (
    clusterNames?: string[],
): Array<GroupBase<SelectPickerOptionType<string>> | SelectPickerOptionType<string>> => [
    DefaultSelectPickerOptionType,
    {
        label: 'Set Context of',
        options: clusterNames?.map((_cluster) => ({
            label: _cluster,
            value: _cluster,
        })),
    },
]

const KubeConfigModal = ({ clusterName, handleModalClose }: KubeConfigTippyContentProps) => {
    const [copyToClipboardPromise, setCopyToClipboardPromise] = useState<ReturnType<typeof copyToClipboard>>(null)
    const [toggleEnabled, setToggleEnabled] = useState(false)
    const { selectedIdentifiers: bulkSelectionClusterList } =
        useBulkSelection<BulkSelectionIdentifiersType<ClusterDetail>>()
    const [selectedClusterName, setSelectedClusterName] =
        useState<SelectPickerOptionType<string>>(DefaultSelectPickerOptionType)

    const bulkSelectedClusterNames = Object.keys(bulkSelectionClusterList)

    const getDefaultConfig = () => {
        const command = () =>
            clusterName
                ? getKubeConfigCommand(clusterName)
                : bulkSelectedClusterNames?.map((cluster) => getKubeConfigCommand(cluster))

        return (command() as string[]).join('\n')
    }
    const [kubeconfigCommand, setKubeconfigCommand] = useState<string>(getDefaultConfig)

    const handleCopyButtonClick = () => {
        ReactGA.event({
            category: 'Resource Browser',
            action: 'Get kubeconfig copy button clicked',
        })
        setCopyToClipboardPromise(copyToClipboard(kubeconfigCommand))
    }

    const renderHeader = () => (
        <div className="flexbox dc__gap-10 dc__align-items-center dc__border-bottom-n1 p-12 dc__content-space px-20 py-16">
            <span className="fs-16 fw-6 lh-20 cn-9">Get kubeconfig</span>
            <Button
                variant={ButtonVariantType.borderLess}
                ariaLabel="Close"
                onClick={handleModalClose}
                icon={<Icon name="ic-close-large" color={null} />}
                dataTestId="close-kubeconfig-modal"
                size={ComponentSizeType.xs}
                style={ButtonStyleType.negativeGrey}
            />
        </div>
    )

    const onChange = (selectedClusters) => {
        setSelectedClusterName(selectedClusters)
        setKubeconfigCommand(getKubeConfigCommand(selectedClusters.value))
        ReactGA.event({
            category: 'Resource Browser',
            action: 'Get kubeconfig set context',
            label: selectedClusters.value,
        })
    }

    const reachableClustersList = Object.values(bulkSelectionClusterList).filter(
        (clusterData) => clusterData.status !== ClusterStatusType.CONNECTION_FAILED,
    )
    console.log(reachableClustersList)

    const handleReachableClustersToggle = () => {
        setToggleEnabled(!toggleEnabled)
        if (toggleEnabled) {
            setKubeconfigCommand(getDefaultConfig())
        } else {
            setKubeconfigCommand(reachableClustersList.map((cluster) => getKubeConfigCommand(cluster.name)).join('\n'))
        }
    }

    const renderSelectiveClusters = () => (
        <div className="flexbox-col border__secondary bw-1 px-16 py-12 fs-13 br-8 dc__gap-12">
            <div className="flex dc__gap-16 dc__content-space top">
                <p className="m-0">
                    <div className="lh-20">Get access for reachable clusters only</div>
                    <div className="fs-12 lh-18 cn-7">
                        {`${reachableClustersList.length}/${bulkSelectedClusterNames.length}`} selected clusters are
                        reachable
                    </div>
                </p>
                <div className="w-32 h-20">
                    <Toggle
                        dataTestId="toggle-selective-cluster"
                        className="dc__toggle--small"
                        selected={toggleEnabled}
                        onChange={handleReachableClustersToggle}
                    />
                </div>
            </div>

            {reachableClustersList.length > 0 && (
                <div className="flex dc__gap-16 dc__content-space border__secondary--top pt-12">
                    <span className="lh-20">Set cluster context</span>

                    <SelectPicker
                        inputId="cluster-kube-config"
                        options={getOptions(bulkSelectedClusterNames)}
                        size={ComponentSizeType.medium}
                        onChange={onChange}
                        value={selectedClusterName}
                    />
                </div>
            )}
        </div>
    )

    const renderConfigCommand = () => (
        <div className="flexbox-col dc__gap-12 p-20">
            {bulkSelectedClusterNames.length > 1 && renderSelectiveClusters()}

            <ol
                className={`steps-with-trail--normal ${bulkSelectedClusterNames.length > 1 ? 'border__secondary--top' : ''} pt-12 px-0`}
            >
                <li>
                    <span className="fs-13 lh-20">
                        <b className="fw-6">Prerequisites:</b>
                        &nbsp;
                        <a
                            href="https://kubernetes.io/docs/reference/kubectl/"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="dc__underline dc__link-n9"
                        >
                            kubectl
                        </a>
                        &nbsp;must be installed
                    </span>
                </li>
                <li>
                    <div className="flexbox-col dc__overflow-hidden dc__gap-4">
                        <span className="fs-13 lh-20">
                            Run below command on terminal to get server URI & bearer token
                        </span>
                        <pre className="mono p-10 br-8 fs-13 m-0 p-0 dc__overflow-auto bg__secondary dc__border-n1 mxh-100">
                            {kubeconfigCommand}
                        </pre>
                    </div>
                </li>
            </ol>
        </div>
    )

    const renderActionButtons = () => (
        <div className="flexbox dc__content-space dc__align-items-center dc__border-top-n1 p-12 dc__gap-12 px-20 py-16">
            <a
                href="https://docs.devtron.ai/usage/resource-browser#running-kubectl-commands-locally"
                target="_blank"
                rel="noreferrer noopener"
                className="dc__link fs-13 lh-20 fw-6"
            >
                View documentation
            </a>
            <Button
                dataTestId="copy-kubeconfig-commands"
                size={ComponentSizeType.medium}
                onClick={handleCopyButtonClick}
                startIcon={
                    <ClipboardButton content={kubeconfigCommand} copyToClipboardPromise={copyToClipboardPromise} />
                }
                text="Copy command"
            />
        </div>
    )

    return (
        <VisibleModal2 className="visible-modal__body">
            <div className="flexbox-col dc__border dc__m-auto mt-40 br-8 bg__primary w-600 cn-9">
                {renderHeader()}
                {renderConfigCommand()}
                {renderActionButtons()}
            </div>
        </VisibleModal2>
    )
}

export default KubeConfigModal
