import React, { Fragment, useEffect, useState } from 'react'
import { MultiValue } from 'react-select'
import { toast } from 'react-toastify'
import { DOCUMENTATION } from '../../../config'
import { OptionType } from '../../app/types'
import { Progressing, showError, VisibleModal } from '../../common'
import ConfigureLinkAction from './ConfigureLinkAction'
import { getExternalLinks, saveExternalLinks, updateExternalLink } from '../ExternalLinks.service'
import { AddExternalLinkType, ExternalLink, LinkAction, OptionTypeWithIcon } from '../ExternalLinks.type'
import { availableVariables, sortByUpdatedOn } from '../ExternalLinks.utils'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import './AddExternalLink.scss'

export default function AddExternalLink({
    monitoringTools,
    clusters,
    selectedLink,
    setExternalLinks,
    handleDialogVisibility,
}: AddExternalLinkType): JSX.Element {
    const [linksData, setLinksData] = useState<LinkAction[]>([])
    const [savingLinks, setSavingLinks] = useState(false)

    useEffect(() => {
        if (selectedLink) {
            const monitoringTool = monitoringTools.find((tool) => tool.value === selectedLink.monitoringToolId)
            const selectedClusters =
                selectedLink.clusterIds.length === 0
                    ? clusters
                    : clusters.filter((cluster) => selectedLink.clusterIds.includes(+cluster.value))

            setLinksData([
                {
                    tool: {
                        label: monitoringTool.label,
                        value: monitoringTool.value,
                        icon: monitoringTool.icon,
                    },
                    name: selectedLink.name,
                    description: selectedLink.description,
                    clusters: selectedClusters,
                    urlTemplate: selectedLink.url,
                },
            ])
        } else {
            setLinksData([
                {
                    tool: null,
                    name: '',
                    description: '',
                    clusters: [],
                    urlTemplate: '',
                },
            ])
        }
    }, [])

    const handleLinksDataActions = (
        action: string,
        key?: number,
        value?: OptionType | MultiValue<OptionType> | string,
    ): void => {
        switch (action) {
            case 'add':
                linksData.splice(0, 0, {
                    tool: null,
                    name: '',
                    description: '',
                    clusters: [],
                    urlTemplate: '',
                })
                break
            case 'delete':
                linksData.splice(key, 1)
                break
            case 'onMonitoringToolSelection':
                linksData[key].tool = value as OptionTypeWithIcon
                break
            case 'onClusterSelection':
                const _selectedOption = value as MultiValue<OptionType>
                const areAllOptionsSelected = _selectedOption.findIndex((option) => option.value === '*') !== -1
                const areAllOptionsAlredySeleted =
                    Array.isArray(linksData[key].clusters) && linksData[key].clusters[0]?.value === '*'

                if (areAllOptionsSelected && !areAllOptionsAlredySeleted) {
                    linksData[key].clusters = [{ label: 'All clusters', value: '*' }]
                } else if (!areAllOptionsSelected && areAllOptionsAlredySeleted) {
                    linksData[key].clusters = []
                } else if (areAllOptionsSelected && _selectedOption.length !== clusters.length) {
                    linksData[key].clusters = _selectedOption.filter((option) => option.value !== '*')
                } else if (!areAllOptionsSelected && _selectedOption.length === clusters.length - 1) {
                    linksData[key].clusters = [{ label: 'All clusters', value: '*' }]
                } else {
                    linksData[key].clusters = _selectedOption
                }
                break
            case 'onNameChange':
                linksData[key].name = value as string
                break
            case 'onUrlTemplateChange':
                linksData[key].urlTemplate = value as string
                break
            default:
                break
        }

        setLinksData([...linksData])
    }

    const onMonitoringToolSelectionHandler = (key: number, selected: OptionType, link: LinkAction) => {
        handleLinksDataActions('onMonitoringToolSelection', key, selected)

        if (
            selected.label.toLowerCase() !== 'other' &&
            (!link.name || monitoringTools.findIndex((tool) => tool.label === link.name) !== -1)
        ) {
            handleLinksDataActions('onNameChange', key, selected.label)
        }
    }

    const linksLen = linksData.length

    const renderConfigureLinkActionColumn = (): JSX.Element => {
        return (
            <div className="configure-link-action-container">
                {!selectedLink && (
                    <div
                        className="link-add-another fs-13 fw-6 mb-16 cursor"
                        onClick={() => handleLinksDataActions('add')}
                    >
                        <AddIcon className="icon-dim-20 mr-8" /> Add another
                    </div>
                )}
                {linksData &&
                    linksData.map((link, idx) => {
                        return (
                            <Fragment key={`ConfigureLinkAction-${idx}`}>
                                <ConfigureLinkAction
                                    index={idx}
                                    link={link}
                                    clusters={clusters}
                                    selectedClusters={
                                        Array.isArray(link.clusters) && link.clusters[0]?.value === '*'
                                            ? clusters
                                            : link.clusters
                                    }
                                    monitoringTools={monitoringTools}
                                    onMonitoringToolSelection={(key, selected) =>
                                        onMonitoringToolSelectionHandler(key, selected, link)
                                    }
                                    onClusterSelection={(key, selected) =>
                                        handleLinksDataActions('onClusterSelection', key, selected)
                                    }
                                    onNameChange={(key, name) => handleLinksDataActions('onNameChange', key, name)}
                                    onUrlTemplateChange={(key, urlTemplate) =>
                                        handleLinksDataActions('onUrlTemplateChange', key, urlTemplate)
                                    }
                                    showDelete={linksLen > 1}
                                    deleteLinkData={(key) => handleLinksDataActions('delete', key)}
                                />
                                {linksLen > 1 && idx !== linksLen - 1 && (
                                    <hr className="external-links-divider mt-16 mb-16" />
                                )}
                            </Fragment>
                        )
                    })}
            </div>
        )
    }

    const renderConfigureLinkInfoColumn = (): JSX.Element => {
        return (
            <div className="configure-link-info-container">
                <div className="configure-link-info-heading">
                    <Help />
                    <span className="cn-9">Configuring an external link</span>
                </div>
                <ol className="configure-link-info-list">
                    <li>Monitoring Tool</li>
                    <p className="mb-16">
                        Select a monitoring tool from the drop-down list. To add a different tool, select 'Other'.
                    </p>
                    <li>Clusters</li>
                    <p className="mb-16">Choose the clusters for which you want to configure the selected tool.</p>
                    <li>URL Template</li>
                    <p className="mb-20">
                        The configured URL template is used by apps deployed on the selected clusters.
                        <br />
                        By combining one or more of the available env variables, a URL with the structure shown below
                        can be created:
                    </p>
                    <p className="mb-12">
                        {`http://www.domain.com/{namespace}/{appName}/details/{appId}/env/{envId}/details/{podName}`}
                    </p>
                    <ul className="fs-12 fw-4">
                        {availableVariables.map((_var) => (
                            <li>`{_var}`</li>
                        ))}
                    </ul>
                    <a href={DOCUMENTATION.EXTERNAL_LINKS} target="_blank" rel="noreferrer noopener">
                        Learn more
                    </a>
                </ol>
            </div>
        )
    }

    const getValidatedLinksData = (): LinkAction[] => {
        const validatedLinksData = linksData.map((link) => ({
            tool: link.tool,
            invalidTool: !link.tool,
            name: link.name.trim(),
            invalidName: !link.name.trim(),
            description: link.description?.trim(),
            clusters: link.clusters,
            invalidClusters: !link.clusters || link.clusters.length <= 0,
            urlTemplate: link.urlTemplate.replace(/\s+/g, ''),
            invalidUrlTemplate: !link.urlTemplate.trim(),
            invalidProtocol: link.urlTemplate.trim() && !link.urlTemplate.trim().startsWith('http'),
        }))
        setLinksData(validatedLinksData)

        return validatedLinksData
    }

    const saveLinks = async (): Promise<void> => {
        try {
            const validatedLinksData = getValidatedLinksData()
            const invalidData = validatedLinksData.some(
                (link) =>
                    link.invalidTool ||
                    link.invalidName ||
                    link.invalidClusters ||
                    link.invalidUrlTemplate ||
                    link.invalidProtocol,
            )

            if (invalidData) {
                toast.error('Some required fields are missing or have invalid input.')
                return
            }

            setSavingLinks(true)
            if (selectedLink) {
                const link = validatedLinksData[0]
                const payload: ExternalLink = {
                    id: selectedLink.id,
                    monitoringToolId: +link.tool.value,
                    name: link.name,
                    description: link.description || '',
                    clusterIds:
                        link.clusters.findIndex((_cluster) => _cluster.value === '*') === -1
                            ? link.clusters.map((_cluster) => +_cluster.value)
                            : [],
                    url: link.urlTemplate,
                }

                const { result } = await updateExternalLink(payload)

                if (result?.success) {
                    toast.success('Updated successfully!')
                }
            } else {
                const payload = validatedLinksData.map((link) => ({
                    monitoringToolId: +link.tool.value,
                    name: link.name,
                    description: link.description || '',
                    clusterIds:
                        link.clusters.findIndex((_cluster) => _cluster.value === '*') === -1
                            ? link.clusters.map((_cluster) => +_cluster.value)
                            : [],
                    url: link.urlTemplate,
                }))

                // Reversing because on 'Add another', new link fields are added & displayed at the top of linksData
                const { result } = await saveExternalLinks(payload.reverse())

                if (result?.success) {
                    toast.success('Saved successfully!')
                }
            }

            const { result } = await getExternalLinks()
            setExternalLinks(result?.sort(sortByUpdatedOn) || [])
            setSavingLinks(false)
            handleDialogVisibility()
        } catch (e) {
            showError(e)
            setSavingLinks(false)
            handleDialogVisibility()
        }
    }

    return (
        <VisibleModal className="add-external-link-dialog" {...(!savingLinks && { onEscape: handleDialogVisibility })}>
            <div className="modal__body">
                <div className="modal__header">
                    <h3 className="modal__title fs-16">{selectedLink ? 'Update link' : 'Add link'}</h3>
                    <button
                        type="button"
                        className={`dc__transparent ${savingLinks ? 'cursor-not-allowed' : 'cursor'}`}
                        onClick={handleDialogVisibility}
                        disabled={savingLinks}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <hr className="modal__divider mt-0 mb-0" />
                <div className="modal__content">
                    {renderConfigureLinkActionColumn()}
                    {renderConfigureLinkInfoColumn()}
                </div>
                <hr className="modal__divider mt-0 mb-0" />
                <div className="modal__buttons">
                    <button className="cta" onClick={saveLinks} disabled={savingLinks}>
                        {savingLinks ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </div>
        </VisibleModal>
    )
}
