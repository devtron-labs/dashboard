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

import { Fragment, useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    Drawer,
    ToastVariantType,
    ToastManager,
    ClipboardButton,
    Button,
    ButtonVariantType,
    ButtonStyleType,
    ComponentSizeType,
    getHandleOpenURL,
    OptionType,
    getDocumentationUrl
} from '@devtron-labs/devtron-fe-common-lib'
import { DEVTRON_IFRAME_PRIMARY, DOCUMENTATION } from '@Config/constants'
import { createGroupedItemsByKey } from '../../common'
import ConfigureLinkAction from './ConfigureLinkAction'
import { getExternalLinks, saveExternalLinks, updateExternalLink } from '../ExternalLinks.service'
import {
    AddExternalLinkType,
    ExternalLink,
    ExternalLinkIdentifierType,
    ExternalLinkScopeType,
    IdentifierOptionType,
    LinkAction,
    OptionTypeWithIcon,
} from '../ExternalLinks.type'
import { availableVariables, sortByUpdatedOn } from '../ExternalLinks.utils'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as ICOpenBook } from '@Icons/ic-book-open.svg'
import './AddExternalLink.scss'

export default function AddExternalLink({
    appId,
    isFullMode,
    isAppConfigView,
    monitoringTools,
    clusters,
    allApps,
    selectedLink,
    setExternalLinks,
    handleDialogVisibility,
}: AddExternalLinkType): JSX.Element {
    const [linksData, setLinksData] = useState<LinkAction[]>([])
    const [savingLinks, setSavingLinks] = useState(false)
    const linksLen = linksData.length

    // Init tool options grouped by category & default monitoring tool
    const _toolGroupedOptions = Object.values(createGroupedItemsByKey(monitoringTools, 'category')).map((_tools) => ({
        label: _tools[0].label,
        options: _tools as OptionTypeWithIcon[],
    }))
    const defaultTool = monitoringTools.find((tool) => tool.label.toLowerCase() === 'webpage')

    useEffect(() => {
        if (selectedLink) {
            const monitoringTool = monitoringTools.find((tool) => tool.value === selectedLink.monitoringToolId)
            setLinksData([
                {
                    tool: {
                        label: monitoringTool.label,
                        value: monitoringTool.value,
                        icon: monitoringTool.icon,
                    },
                    name: selectedLink.name,
                    description: selectedLink.description,
                    urlTemplate: selectedLink.url,
                    identifiers: initSelectedIdentifiers(),
                    isEditable: selectedLink.isEditable,
                    type: selectedLink.type,
                    openInNewTab: selectedLink.openInNewTab,
                },
            ])
        } else {
            setLinksData([
                {
                    tool: defaultTool
                        ? {
                              label: defaultTool.label,
                              value: defaultTool.value,
                              icon: defaultTool.icon,
                          }
                        : null,
                    name: '',
                    description: '',
                    urlTemplate: '',
                    identifiers: [],
                    isEditable: false,
                    type: ExternalLinkScopeType.ClusterLevel,
                    openInNewTab: false,
                },
            ])
        }
    }, [])

    const initSelectedIdentifiers = () => {
        const selectedIdentifiers =
            selectedLink.identifiers.length === 0
                ? selectedLink.type === ExternalLinkScopeType.ClusterLevel
                    ? clusters
                    : allApps
                : []

        if (selectedIdentifiers.length === 0) {
            if (selectedLink.type === ExternalLinkScopeType.ClusterLevel) {
                for (const _selectedIdentifier of selectedLink.identifiers) {
                    const _selectedCluster = clusters.find(
                        (_cluster) => _selectedIdentifier.clusterId === +_cluster.value,
                    )

                    if (_selectedCluster) {
                        selectedIdentifiers.push(_selectedCluster)
                    }
                }
            } else {
                for (const _selectedIdentifier of selectedLink.identifiers) {
                    if (_selectedIdentifier.type === ExternalLinkIdentifierType.ExternalHelmApp) {
                        selectedIdentifiers.push({
                            label: _selectedIdentifier.identifier,
                            value: _selectedIdentifier.identifier,
                            type: _selectedIdentifier.type,
                        })
                    } else {
                        const _selectedApp = allApps.find((_app) => {
                            const _appValue = _app.value.split('|')
                            return (
                                _selectedIdentifier.identifier === _appValue[0] &&
                                _selectedIdentifier.type === _appValue[2]
                            )
                        })
                        if (_selectedApp) {
                            selectedIdentifiers.push(_selectedApp)
                        }
                    }
                }
            }
        }

        return selectedIdentifiers
    }

    const handleLinksDataActions = (
        action: string,
        key?: number,
        value?: OptionTypeWithIcon | OptionType[] | string | boolean | ExternalLinkScopeType | LinkAction,
    ): void => {
        switch (action) {
            case 'add':
                linksData.splice(0, 0, {
                    tool: defaultTool
                        ? {
                              label: defaultTool.label,
                              value: defaultTool.value,
                              icon: defaultTool.icon,
                          }
                        : null,
                    name: '',
                    description: '',
                    identifiers: [],
                    urlTemplate: '',
                    isEditable: false,
                    openInNewTab: false,
                    type: ExternalLinkScopeType.ClusterLevel,
                })
                break
            case 'delete':
                linksData.splice(key, 1)
                break
            case 'validate':
                linksData[key] = value as LinkAction
                break
            case 'onMonitoringToolSelection':
                linksData[key].tool = value as OptionTypeWithIcon
                break
            case 'onClusterSelection':
            case 'onAppSelection':
                const _selectedOption = value as IdentifierOptionType[]
                const areAllOptionsSelected = _selectedOption.findIndex((option) => option.value === '*') !== -1
                const areAllOptionsAlredySeleted =
                    Array.isArray(linksData[key].identifiers) &&
                    linksData[key].identifiers.findIndex((_identifier) => _identifier.value === '*') !== -1
                const allOptions =
                    action === 'onClusterSelection'
                        ? [{ label: 'All clusters', value: '*', type: ExternalLinkIdentifierType.Cluster }]
                        : [{ label: 'All applications', value: '*', type: ExternalLinkIdentifierType.AllApps }]
                const identifiersLength = action === 'onClusterSelection' ? clusters.length : allApps.length
                let _newSelections = []

                if (areAllOptionsSelected && !areAllOptionsAlredySeleted) {
                    _newSelections = allOptions
                } else if (!areAllOptionsSelected && areAllOptionsAlredySeleted) {
                    _newSelections = []
                } else if (areAllOptionsSelected && _selectedOption.length !== identifiersLength) {
                    _newSelections = _selectedOption.filter((option) => option.value !== '*')
                } else {
                    _newSelections = _selectedOption
                }

                linksData[key].identifiers = _newSelections
                break
            case 'onNameChange':
                linksData[key].name = value as string
                break
            case 'onUrlTemplateChange':
                linksData[key].urlTemplate = value as string
                break
            case 'onDescriptionChange':
                linksData[key].description = value as string
                break
            case 'onScopeChange':
                linksData[key].type = value as ExternalLinkScopeType
                linksData[key].identifiers = []
                break
            case 'onEditableFlagToggle':
                linksData[key].isEditable = value as boolean
                break
            case 'onNewTabToggle':
                linksData[key].openInNewTab = value as boolean
                break
            default:
                break
        }

        setLinksData([...linksData])
    }

    const onMonitoringToolSelectionHandler = (key: number, selected: OptionTypeWithIcon, link: LinkAction) => {
        handleLinksDataActions('onMonitoringToolSelection', key, selected)

        if (
            selected.label.toLowerCase() !== 'other' &&
            (!link.name || monitoringTools.findIndex((tool) => tool.label === link.name) !== -1)
        ) {
            handleLinksDataActions('onNameChange', key, selected.label)
        }
    }

    const getSelectedIdentifiers = (link: LinkAction) => {
        if (!Array.isArray(link.identifiers)) {
            return []
        }
        if (link.identifiers.findIndex((_identifier) => _identifier.value === '*') === -1) {
            return link.identifiers
        }

        return link.type === ExternalLinkScopeType.ClusterLevel ? clusters : allApps
    }

    const renderConfigureLinkActionColumn = (): JSX.Element => {
        return (
            <div className="configure-link-action-container flexbox-col flex-grow-1 dc__overflow-auto p-20 mw-720 dc__border-right dc__break-word">
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
                                    isFullMode={isFullMode}
                                    isAppConfigView={isAppConfigView}
                                    index={idx}
                                    link={link}
                                    clusters={clusters}
                                    allApps={allApps}
                                    selectedIdentifiers={getSelectedIdentifiers(link)}
                                    toolGroupedOptions={_toolGroupedOptions}
                                    onToolSelection={(key, selected) =>
                                        onMonitoringToolSelectionHandler(key, selected, link)
                                    }
                                    handleLinksDataActions={handleLinksDataActions}
                                    showDelete={linksLen > 1}
                                />
                                {linksLen > 1 && idx !== linksLen - 1 && (
                                    <div className="divider__primary" />
                                )}
                            </Fragment>
                        )
                    })}
            </div>
        )
    }

    const renderConfigureLinkInfoColumn = (): JSX.Element => {
        return (
            <div className="px-16 py-20 dc__break-word dc__overflow-auto">
                <div className="flexbox dc__content-space dc__align-items-center">
                    <div className="flexbox dc__gap-8 dc__align-items-center">
                        <Help className="icon-dim-20 fcv-5" />
                        <span className="cn-9 fs-13 lh-20 fw-6">Configuring an external link</span>
                    </div>
                    <Button
                        ariaLabel="learn-more-external-link"
                        dataTestId="learn-more-external-link"
                        icon={<ICOpenBook />}
                        style={ButtonStyleType.neutral}
                        variant={ButtonVariantType.borderLess}
                        size={ComponentSizeType.small}
                        onClick={getHandleOpenURL(getDocumentationUrl(DOCUMENTATION.EXTERNAL_LINKS))}
                        showAriaLabelInTippy={false}
                        showTooltip
                        tooltipProps={{
                            content: 'View Documentation',
                        }}
                    />
                </div>
                <ol className="configure-link-info-list">
                    <li>Link name</li>
                    <p className="mb-16">
                        Enter a name for the link (eg. API Doc, Logs, etc.) and select a suitable icon.
                    </p>
                    <li>Description (optional)</li>
                    <p className="mb-16">Add a description for the link.</p>
                    {!isAppConfigView && (
                        <>
                            <li>Show link in</li>
                            <div className="mb-16">
                                <p>Choose where you want the link to be shown:</p>
                                <ul>
                                    <li>All applications in specific cluster</li>
                                    <li>Specific applications</li>
                                </ul>
                            </div>
                        </>
                    )}
                    <li>Enter link or Create URL template</li>
                    <p className="mb-8">
                        You can choose to enter a direct link or create a URL template using available variables.
                    </p>
                    <p className="mb-8">A dynamic link can be created using variables as shown below.</p>
                    <p className="mb-8 fw-4 dc__italic-font-style">
                        {`http://www.domain.com/{namespace}/{appName}/details/{appId}/env/{envId}/details/{podName}`}
                    </p>
                    <div className="flexbox-col dc__gap-6">
                        {availableVariables.map((variable) => (
                            <div
                                key={variable}
                                className="flexbox dc__gap-4 dc__align-items-center dc__visible-hover dc__visible-hover--parent"
                            >
                                <span className="bcn-1 px-4 br-6 dc__truncate">{variable}</span>
                                <span className="dc__visible-hover--child">
                                    <ClipboardButton content={variable} />
                                </span>
                            </div>
                        ))}
                    </div>
                </ol>
            </div>
        )
    }

    const getValidatedLinksData = (): LinkAction[] => {
        const validatedLinksData: LinkAction[] = linksData.map((link) => ({
            tool: link.tool,
            invalidTool: !link.tool,
            name: link.name.trim(),
            invalidName: !link.name.trim(),
            description: link.description?.trim(),
            identifiers: link.identifiers,
            invalidIdentifiers: !link.identifiers || link.identifiers.length <= 0,
            urlTemplate: link.urlTemplate.replace(/\s+/g, ''),
            invalidUrlTemplate: !link.urlTemplate.trim(),
            invalidProtocol: link.urlTemplate.trim() && !link.urlTemplate.trim().startsWith('http'),
            type: link.type,
            isEditable: link.isEditable,
            openInNewTab: link.openInNewTab,
        }))
        setLinksData(validatedLinksData)

        return validatedLinksData
    }

    const processIdentifiers = (identifiers: IdentifierOptionType[], selectedLink?: ExternalLink) => {
        if (isAppConfigView) {
            return selectedLink
                ? selectedLink.identifiers
                : [
                      {
                          type: ExternalLinkIdentifierType.DevtronApp,
                          identifier: appId,
                          clusterId: 0,
                      },
                  ]
        }
        if (identifiers.findIndex((_identifier) => _identifier.value === '*') === -1) {
            return identifiers.map((identifier) => ({
                type: identifier.type,
                identifier:
                    identifier.type === ExternalLinkIdentifierType.Cluster
                        ? ''
                        : identifier.type === ExternalLinkIdentifierType.ExternalHelmApp
                          ? identifier.value
                          : identifier.value.split('|')[0],
                clusterId: identifier.type === ExternalLinkIdentifierType.Cluster ? +identifier.value : 0,
            }))
        }
        return []
    }

    const appendDevtronPrimaryIframe = (urlTemplate: string, openInNewTab: boolean): string => {
        if (!openInNewTab) return urlTemplate
        const linkURL = new URL(urlTemplate)
        linkURL.searchParams.append(DEVTRON_IFRAME_PRIMARY, 'false')
        return decodeURIComponent(linkURL.href)
    }

    const saveLinks = async (): Promise<void> => {
        try {
            const validatedLinksData = getValidatedLinksData()
            const invalidData = validatedLinksData.some(
                (link) =>
                    (!isAppConfigView && (link.invalidTool || link.invalidIdentifiers)) ||
                    link.invalidName ||
                    link.invalidUrlTemplate ||
                    link.invalidProtocol,
            )

            if (invalidData) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Some required fields are missing or have invalid input.',
                })
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
                    type: link.type,
                    identifiers: processIdentifiers(link.identifiers, selectedLink),
                    url: appendDevtronPrimaryIframe(link.urlTemplate, link.openInNewTab),
                    isEditable: link.isEditable,
                }

                const { result } = await updateExternalLink(payload, isAppConfigView ? appId : '')

                if (result?.success) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Updated successfully!',
                    })
                }
            } else {
                const payload = validatedLinksData.map((link) => ({
                    monitoringToolId: +link.tool.value,
                    name: link.name,
                    description: link.description || '',
                    type: isAppConfigView ? ExternalLinkScopeType.AppLevel : link.type,
                    identifiers: processIdentifiers(link.identifiers),
                    url: appendDevtronPrimaryIframe(link.urlTemplate, link.openInNewTab),
                    isEditable: isAppConfigView ? true : link.isEditable,
                }))

                // Reversing because on 'Add another', new link fields are added & displayed at the top of linksData
                const { result } = await saveExternalLinks(payload.reverse(), isAppConfigView ? appId : '')

                if (result?.success) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Saved successfully!',
                    })
                }
            }

            if (isAppConfigView) {
                const { result } = await getExternalLinks(0, appId, ExternalLinkIdentifierType.DevtronApp)
                setExternalLinks(
                    result?.ExternalLinks?.filter(
                        (_link) => _link.isEditable && _link.type === ExternalLinkScopeType.AppLevel,
                    ).sort(sortByUpdatedOn) || [],
                )
            } else {
                const { result } = await getExternalLinks()
                setExternalLinks(result?.ExternalLinks?.sort(sortByUpdatedOn) || [])
            }
            setSavingLinks(false)
            handleDialogVisibility()
        } catch (e) {
            showError(e)
            setSavingLinks(false)
            handleDialogVisibility()
        }
    }

    return (
        <Drawer
            position="right"
            parentClassName="add-external-link-dialog"
            maxWidth="1200px"
            onEscape={handleDialogVisibility}
        >
            <div className="modal__body flexbox-col flex-grow-1">
                <div className="modal__header dc__border-bottom">
                    <h3 className="modal__title fs-16">{selectedLink ? 'Update Link' : 'Add Link'}</h3>
                    <button
                        type="button"
                        className={`dc__transparent ${savingLinks ? 'cursor-not-allowed' : 'cursor'}`}
                        onClick={handleDialogVisibility}
                        disabled={savingLinks}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="modal__content flexbox-col flex-grow-1 dc__overflow-hidden">
                    {renderConfigureLinkActionColumn()}
                    {renderConfigureLinkInfoColumn()}
                </div>
                <div className="modal__buttons dc__border-top">
                    <button
                        className="cta lh-36 h-36"
                        onClick={saveLinks}
                        disabled={savingLinks}
                        data-testid="save-link-button"
                    >
                        {savingLinks ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </div>
        </Drawer>
    )
}
