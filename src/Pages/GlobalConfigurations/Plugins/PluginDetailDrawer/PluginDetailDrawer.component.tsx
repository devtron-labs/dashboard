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

import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    APIResponseHandler,
    Badge,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CodeEditor,
    ComponentSizeType,
    CustomInput,
    Drawer,
    Icon,
    InlineStepDetailType,
    MODES,
    noop,
    PluginImageContainer,
    PluginTagsContainer,
    ScriptType,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'

import { getInputOutputConditionDetails } from '@Components/cdPipeline/cdpipeline.util'
import { getPluginVersionSelectOption } from '@Components/CIPipelineN/PluginDetailHeader/utils'

import { PLUGIN_DRAWER_WIDTH, PLUGIN_ROUTE_SEGMENTS, PLUGINS_ROOT_URL } from '../constants'
import { useGetPluginVersionDetail } from '../service'
import { PluginsURLParamsType, PluginVariableKind } from '../types'
import { getIsPresetPlugin, getPluginDetailURL, getPluginInlineStep, getStepFromPluginVersionDetail } from '../utils'
import PluginConditionsList from './PluginConditionsList'
import PluginDetailSection from './PluginDetailSection'
import PluginVariablesTable from './PluginVariablesTable'

const PluginDetailDrawer = () => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const { pluginVersionId } = useParams<PluginsURLParamsType>()

    const handleClose = () => navigate({ pathname: PLUGINS_ROOT_URL, search })

    const handleVersionChange = (selectedPluginVersionId: number) => {
        navigate({ pathname: getPluginDetailURL(selectedPluginVersionId), search }, { replace: true })
    }

    const handleClone = () =>
        navigate({ pathname: `${getPluginDetailURL(pluginVersionId)}/${PLUGIN_ROUTE_SEGMENTS.CLONE}`, search })

    const handleNewVersion = () =>
        navigate({ pathname: `${getPluginDetailURL(pluginVersionId)}/${PLUGIN_ROUTE_SEGMENTS.NEW_VERSION}`, search })

    const { data: pluginVersionDetail, isLoading, error, refetch } = useGetPluginVersionDetail(+pluginVersionId)
    const isPresetPlugin = getIsPresetPlugin(pluginVersionDetail)

    const renderHeader = () => {
        if (!pluginVersionDetail) {
            return <h2 className="m-0 cn-9 fs-16 fw-6 lh-24">Plugin details</h2>
        }

        const { name, parentPlugin, icon, pluginVersion, id, isLatest, versions } = pluginVersionDetail
        const versionOptions: SelectPickerOptionType[] = (versions ?? []).map((version) =>
            getPluginVersionSelectOption(version.pluginVersion, version.id, version.isLatest),
        )

        const handleVersionSelect = (selectedOption: SelectPickerOptionType<number>) => {
            if (selectedOption.value !== id) {
                handleVersionChange(selectedOption.value)
            }
        }

        return (
            <div className="flexbox dc__align-items-center dc__gap-8 dc__overflow-hidden">
                <PluginImageContainer
                    fallbackImageClassName="icon-dim-24 p-2 dc__no-shrink"
                    imageProps={{
                        src: parentPlugin?.icon || icon,
                        alt: name,
                        width: 24,
                        height: 24,
                        className: 'p-2 dc__no-shrink',
                    }}
                />
                <h2 className="m-0 cn-9 fs-16 fw-6 lh-24 dc__truncate">{parentPlugin?.name || name}</h2>
                <span className="cn-5 fs-16 lh-24">/</span>
                <div className="flexbox dc__mxw-200">
                    <SelectPicker
                        options={versionOptions}
                        value={getPluginVersionSelectOption(pluginVersion, id, isLatest)}
                        classNamePrefix="plugin-detail__version-select"
                        inputId="plugin-detail__version-select"
                        placeholder="Version"
                        variant={SelectPickerVariantType.COMPACT}
                        onChange={handleVersionSelect}
                        onKeyDown={stopPropagation}
                    />
                </div>
                {isPresetPlugin && (
                    <Badge label="by Devtron" startIconProps={{ name: 'ic-devtron' }} size={ComponentSizeType.xxs} />
                )}
                {pluginVersionDetail.isDeprecated && (
                    <Badge label="Deprecated" variant="negative" size={ComponentSizeType.xxs} />
                )}
            </div>
        )
    }

    const renderScript = (inlineStepDetail: InlineStepDetailType) => {
        if (inlineStepDetail.scriptType === ScriptType.CONTAINERIMAGE) {
            return (
                <div className="flexbox-col dc__gap-12">
                    <CustomInput
                        name="plugin-container-image"
                        label="Container image"
                        value={inlineStepDetail.containerImagePath}
                        onChange={noop}
                        placeholder=""
                        disabled
                        layout="row"
                    />
                    {inlineStepDetail.commandArgsMap?.map(({ command, args }, index) => (
                        <CustomInput
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            name={`plugin-command-${index}`}
                            label="Command & args"
                            value={[command, ...(args ?? [])].filter(Boolean).join(' ')}
                            onChange={noop}
                            placeholder=""
                            disabled
                            layout="row"
                        />
                    ))}
                    {inlineStepDetail.script && (
                        <CodeEditor
                            mode={MODES.SHELL}
                            value={inlineStepDetail.script}
                            readOnly
                            noParsing
                            height={300}
                        />
                    )}
                </div>
            )
        }

        return <CodeEditor mode={MODES.SHELL} value={inlineStepDetail.script} readOnly noParsing height={300} />
    }

    const renderBody = () => {
        const { name, parentPlugin, description, inputVariables, outputVariables, tags, docLink } = pluginVersionDetail
        const { inlineStepDetail } = getStepFromPluginVersionDetail(pluginVersionDetail)
        const { conditionDetails, scriptType } = inlineStepDetail
        const { inputConditionDetails, outputConditionDetails } = getInputOutputConditionDetails(conditionDetails)
        const exposedInputVariables = (inputVariables ?? []).filter((variable) => variable.isExposed)
        const exposedOutputVariables = (outputVariables ?? []).filter((variable) => variable.isExposed)
        const hasInlineStep = !!getPluginInlineStep(pluginVersionDetail)

        return (
            <div className="flexbox-col flex-grow-1 dc__overflow-auto px-20">
                <div className="flexbox-col dc__gap-12 py-20">
                    <CustomInput
                        name="plugin-name"
                        label="Plugin name"
                        value={parentPlugin?.name || name}
                        onChange={noop}
                        placeholder=""
                        disabled
                        required
                        layout="row"
                    />
                    <CustomInput
                        name="plugin-description"
                        label="Description"
                        value={description || parentPlugin?.description || ''}
                        onChange={noop}
                        placeholder=""
                        disabled
                        layout="row"
                    />
                    {!!tags?.length && <PluginTagsContainer tags={tags} />}
                    {docLink && (
                        <a
                            href={docLink}
                            target="_blank"
                            rel="noreferrer"
                            className="anchor fs-13 lh-20 dc_width-max-content"
                        >
                            View documentation
                        </a>
                    )}
                </div>

                <PluginDetailSection title="Input Variables" isExpandedByDefault>
                    <PluginVariablesTable variables={exposedInputVariables} variableKind={PluginVariableKind.INPUT} />
                </PluginDetailSection>

                {hasInlineStep && (
                    <PluginDetailSection title="Script">{renderScript(inlineStepDetail)}</PluginDetailSection>
                )}

                <PluginDetailSection title="Trigger / Skip Conditions">
                    <PluginConditionsList conditions={inputConditionDetails} />
                </PluginDetailSection>

                <PluginDetailSection title="Output Variables">
                    <PluginVariablesTable variables={exposedOutputVariables} variableKind={PluginVariableKind.OUTPUT} />
                </PluginDetailSection>

                {scriptType !== ScriptType.CONTAINERIMAGE && (
                    <PluginDetailSection title="Success / Failure Conditions">
                        <PluginConditionsList conditions={outputConditionDetails} />
                    </PluginDetailSection>
                )}
            </div>
        )
    }

    return (
        <Drawer position="right" width={PLUGIN_DRAWER_WIDTH} onClose={handleClose} onEscape={handleClose}>
            <div className="plugin-detail flexbox-col h-100 bg__primary" onClick={stopPropagation}>
                <div className="flexbox dc__align-items-center dc__content-space dc__gap-12 py-12 px-20 dc__border-bottom">
                    {renderHeader()}

                    <div className="flexbox dc__align-items-center dc__gap-12 dc__no-shrink">
                        {pluginVersionDetail && (
                            <>
                                <Button
                                    dataTestId="plugin-detail-clone"
                                    text="Clone"
                                    startIcon={<Icon name="ic-copy" color={null} />}
                                    variant={ButtonVariantType.text}
                                    size={ComponentSizeType.small}
                                    onClick={handleClone}
                                />
                                {!isPresetPlugin && (
                                    <Button
                                        dataTestId="plugin-detail-new-version"
                                        text="New version"
                                        startIcon={<Icon name="ic-add" color={null} />}
                                        variant={ButtonVariantType.text}
                                        size={ComponentSizeType.small}
                                        onClick={handleNewVersion}
                                    />
                                )}
                            </>
                        )}
                        <Button
                            icon={<Icon name="ic-close-large" color={null} />}
                            dataTestId="plugin-detail-close"
                            style={ButtonStyleType.negativeGrey}
                            size={ComponentSizeType.xs}
                            variant={ButtonVariantType.borderLess}
                            ariaLabel="Close plugin details"
                            onClick={handleClose}
                            showAriaLabelInTippy={false}
                        />
                    </div>
                </div>

                <APIResponseHandler
                    isLoading={isLoading}
                    progressingProps={{ pageLoader: true }}
                    error={error}
                    errorScreenManagerProps={{ code: error?.code, reload: refetch }}
                >
                    {pluginVersionDetail && renderBody()}
                </APIResponseHandler>
            </div>
        </Drawer>
    )
}

export default PluginDetailDrawer
