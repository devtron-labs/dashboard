import {
    BaseAppMetaData,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    Progressing,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { APP_TYPE } from '@Config/constants'
import { getAppIconWithBackground } from '@Config/utils'

import { AppCloneList } from './AppClone'
import ApplicationInfoForm from './ApplicationInfoForm'
import {
    ApplicationSelectionListProps,
    CreateAppFormStateActionType,
    CreateAppFormStateType,
    CreationMethodType,
} from './types'
import UpdateTemplateConfig from './UpdateTemplateConfig'

const TemplateList = importComponentFromFELibrary('TemplateList', null, 'function')

export const CloneApplicationSelectionList = ({
    formState,
    selectedCreationMethod,
    isJobView,
    handleFormStateChange,
    formErrorState,
    handleTagErrorChange,
    isTagsAccordionExpanded,
    toggleIsTagsAccordionExpanded,
    handleCreationMethodChange,
}: ApplicationSelectionListProps) => {
    const isCreationMethodTemplate = selectedCreationMethod === CreationMethodType.template

    const handleGoBack = () => {
        handleFormStateChange({
            action: isCreationMethodTemplate
                ? CreateAppFormStateActionType.updateTemplateConfig
                : CreateAppFormStateActionType.updateCloneAppConfig,
            value: null,
        })
    }
    const handleTemplateClick = ({ id, templateId, name }: CreateAppFormStateType['templateConfig']) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateTemplateConfig,
            value: { id, templateId, name },
        })
    }

    const handleCloneAppClick = ({ appId, appName }: BaseAppMetaData) => {
        handleFormStateChange({
            action: CreateAppFormStateActionType.updateCloneAppConfig,
            value: { appId, appName },
        })
    }

    const renderSelectionList = () => {
        switch (selectedCreationMethod) {
            case CreationMethodType.template:
                return (
                    <TemplateList
                        handleTemplateClick={handleTemplateClick}
                        isJobView={isJobView}
                        isCreationMethodTemplate={isCreationMethodTemplate}
                    />
                )
            case CreationMethodType.clone:
                return (
                    <AppCloneList
                        handleCloneAppClick={handleCloneAppClick}
                        isJobView={isJobView}
                        handleCreationMethodChange={handleCreationMethodChange}
                    />
                )
            default:
                return null
        }
    }

    const getBreadcrumbText = () => {
        if (isCreationMethodTemplate) {
            return 'Templates'
        }

        if (isJobView) {
            return 'Clone Job'
        }

        return 'Clone Application'
    }

    const renderAppInfoForm = () => {
        const breadcrumbText = getBreadcrumbText()
        const breadcrumbDataTestId = isCreationMethodTemplate ? 'template-list-breadcrumb' : 'clone-list-breadcrumb'
        const icon = isCreationMethodTemplate ? (
            <Icon name="ic-app-template" color={null} />
        ) : (
            getAppIconWithBackground(isJobView ? APP_TYPE.JOB : APP_TYPE.DEVTRON_APPS)
        )
        const name = isCreationMethodTemplate ? formState.templateConfig.name : formState.cloneAppConfig.appName

        return (
            <>
                <div className="flex left dc__gap-12 py-12 px-20">
                    <Button
                        icon={<Icon name="ic-caret-left" color={null} />}
                        dataTestId={
                            isCreationMethodTemplate
                                ? 'create-app-modal-go-back-to-templates-list'
                                : 'create-app-modal-go-back-to-clone-app-list'
                        }
                        ariaLabel={isCreationMethodTemplate ? 'go-back-to-templates-list' : 'go-back-to-clone-app-list'}
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                        size={ComponentSizeType.xs}
                        showAriaLabelInTippy={false}
                        onClick={handleGoBack}
                    />
                    <div className="flex left dc__gap-6">
                        <Button
                            dataTestId={breadcrumbDataTestId}
                            variant={ButtonVariantType.text}
                            text={breadcrumbText}
                            onClick={handleGoBack}
                        />
                        <span className="fs-13">/</span>
                        <p className="m-0 flex left dc__gap-6">
                            {icon}
                            <span className="fs-13 lh-20 fw-6 cn-9 dc__truncate">{name}</span>
                        </p>
                    </div>
                </div>
                <div className="divider__secondary--horizontal" />
                <div className="flexbox-col flex-grow-1 dc__overflow-auto create-app-modal__template">
                    <div className="create-app-modal__template__loader">
                        <Progressing size={32} />
                    </div>
                    <div className="create-app-modal__template__content flexbox-col dc__gap-20 flex-grow-1 bg__secondary dc__overflow-auto p-20">
                        <ApplicationInfoForm
                            formState={formState}
                            handleFormStateChange={handleFormStateChange}
                            formErrorState={formErrorState}
                            handleTagErrorChange={handleTagErrorChange}
                            isJobView={isJobView}
                            selectedCreationMethod={selectedCreationMethod}
                            isTagsAccordionExpanded={isTagsAccordionExpanded}
                            toggleIsTagsAccordionExpanded={toggleIsTagsAccordionExpanded}
                        />
                        {selectedCreationMethod === CreationMethodType.template && (
                            <UpdateTemplateConfig
                                formState={formState}
                                isJobView={isJobView}
                                handleFormStateChange={handleFormStateChange}
                                formErrorState={formErrorState}
                            />
                        )}
                    </div>
                </div>
            </>
        )
    }

    return !formState.cloneAppConfig && !formState.templateConfig ? renderSelectionList() : renderAppInfoForm()
}
