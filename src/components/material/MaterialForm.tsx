import { useEffect, useState } from 'react'

import { isAWSCodeCommitURL, showError, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'

import { createMaterial, updateMaterial } from './material.service'
import { MaterialFormProps } from './material.types'
import { MaterialView } from './MaterialView'
import { getInitialMaterialFormState, getUpsertMaterialPayload, isGitProviderValid } from './utils'

const MaterialForm = ({
    appId,
    isMultiGit,
    preventRepoDelete,
    material,
    providers,
    isCheckoutPathValid,
    refreshMaterials,
    reload,
    toggleRepoSelectionTippy,
    setRepo,
    isJobView,
    isTemplateView,
    isCreateAppView,
    handleSingleGitMaterialUpdate,
}: MaterialFormProps) => {
    const [formMaterial, setFormMaterial] = useState(getInitialMaterialFormState(material))
    const [isCollapsed, setIsCollapsed] = useState(!!material || !!isMultiGit)
    const [isChecked, setIsChecked] = useState(!!material)
    const [isLearnHowClicked, setIsLearnHowClicked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState({
        gitProvider: undefined,
        url: undefined,
        checkoutPath: undefined,
    })

    useEffect(() => {
        if (material) {
            setFormMaterial(getInitialMaterialFormState(material))
            setIsCollapsed(true)
            setIsLoading(false)
        }
    }, [material])

    useEffect(() => {
        if (handleSingleGitMaterialUpdate && material) {
            handleSingleGitMaterialUpdate(formMaterial, !!(isError.gitProvider || isError.url))
        }
    }, [formMaterial.gitProvider, formMaterial.url, isError.gitProvider, isError.url])

    const isGitUrlValid = (url: string, selectedId: number): string | undefined => {
        if (!url.length) {
            return 'This is a required field'
        }
        if (isAWSCodeCommitURL(formMaterial?.gitProvider?.url)) {
            if (isAWSCodeCommitURL(url)) {
                return undefined
            }
            return 'Git Repo URL must follow this pattern: git-codecommit.<aws_region>.amazonaws.com'
        }
        const res = providers?.filter((provider) => provider?.id === selectedId)
        if (res[0]?.authMode !== 'SSH' && !url.startsWith('http')) {
            return "Git Repo URL must start with 'http' or 'https'"
        }
        if (res[0]?.authMode === 'SSH' && !url.includes('@')) {
            return 'URL must contain @'
        }
        return undefined
    }

    const handleProviderChange = (selectedProvider, url: string) => {
        setFormMaterial((prev) => ({
            ...prev,
            gitProvider: selectedProvider,
        }))
        setIsError((prev) => ({
            ...prev,
            gitProvider: isGitProviderValid(selectedProvider),
            url: isGitUrlValid(url, selectedProvider.id),
        }))
    }

    const handlePathChange = (event) => {
        setFormMaterial((prev) => ({
            ...prev,
            checkoutPath: event.target.value,
        }))
        setIsError((prev) => ({
            ...prev,
            checkoutPath: isCheckoutPathValid(event.target.value),
        }))
    }

    const handleFileChange = (event) => {
        setFormMaterial((prev) => ({
            ...prev,
            includeExcludeFilePath: event.target.value,
        }))
    }

    const handleUrlChange = (event) => {
        setFormMaterial((prev) => ({
            ...prev,
            url: event.target.value,
        }))
        setIsError((prev) => ({
            ...prev,
            url: isGitUrlValid(event.target.value, formMaterial.gitProvider?.id),
        }))
    }

    const handleCheckoutPathCheckbox = () => {
        setIsChecked((prev) => !prev)
    }

    const handleExcludeRepoCheckbox = () => {
        setFormMaterial((prev) => ({
            ...prev,
            isExcludeRepoChecked: !prev.isExcludeRepoChecked,
        }))
    }

    const handleLearnHowClick = () => {
        setIsLearnHowClicked((prev) => !prev)
    }

    const handleSubmoduleCheckbox = () => {
        setFormMaterial((prev) => ({
            ...prev,
            fetchSubmodules: !prev.fetchSubmodules,
        }))
    }

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev)
    }

    const save = async () => {
        const newIsError = {
            gitProvider: isGitProviderValid(formMaterial.gitProvider),
            url: isGitUrlValid(formMaterial.url, formMaterial.gitProvider?.id),
            checkoutPath: isCheckoutPathValid(formMaterial.checkoutPath),
        }

        setIsError(newIsError)
        setIsChecked(true)

        if (newIsError.url || newIsError.gitProvider || newIsError.checkoutPath) {
            return
        }

        setIsLoading(true)

        const payload = getUpsertMaterialPayload(appId, formMaterial, !material)
        const service = material ? updateMaterial : createMaterial

        try {
            await service({ request: payload, isTemplateView })
            refreshMaterials()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Material Saved Successfully',
            })
        } catch (error) {
            showError(error)
        } finally {
            setIsLoading(false)
        }
    }

    const cancel = () => {
        setIsCollapsed(true)
        setIsLoading(false)

        setFormMaterial(getInitialMaterialFormState(material))

        setIsError(
            material
                ? {
                      gitProvider: isGitProviderValid(material.gitProvider),
                      url: isGitUrlValid(material.url, formMaterial?.gitProvider?.id),
                      checkoutPath: isCheckoutPathValid(material.checkoutPath),
                  }
                : {
                      gitProvider: undefined,
                      url: undefined,
                      checkoutPath: undefined,
                  },
        )
    }

    return (
        <MaterialView
            material={formMaterial}
            isError={isError}
            isCollapsed={isCollapsed}
            isChecked={isChecked}
            isLearnHowClicked={isLearnHowClicked}
            handleLearnHowClick={handleLearnHowClick}
            isLoading={isLoading}
            isMultiGit={isMultiGit}
            providers={providers}
            handleCheckoutPathCheckbox={handleCheckoutPathCheckbox}
            handleExcludeRepoCheckbox={handleExcludeRepoCheckbox}
            handleProviderChange={handleProviderChange}
            handleUrlChange={handleUrlChange}
            handlePathChange={handlePathChange}
            handleFileChange={handleFileChange}
            toggleCollapse={toggleCollapse}
            save={save}
            cancel={cancel}
            handleSubmoduleCheckbox={handleSubmoduleCheckbox}
            appId={appId}
            reload={reload}
            preventRepoDelete={preventRepoDelete}
            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
            setRepo={setRepo}
            isJobView={isJobView}
            isTemplateView={isTemplateView}
            isCreateAppView={isCreateAppView}
        />
    )
}

export default MaterialForm
