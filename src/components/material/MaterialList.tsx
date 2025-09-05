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
import { useEffect } from 'react'

import {
    AppListConstants,
    ComponentSizeType,
    DocLink,
    ErrorScreenManager,
    Progressing,
    sortCallback,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Folder } from '@Icons/ic-folder-filled.svg'
import { ReactComponent as PlayMedia } from '@Icons/ic-play-outline.svg'
import { ReactComponent as GitHub } from '@Icons/ic-sample-app.svg'
import { GitAccountDTO } from '@Services/service.types'

import { DEVTRON_NODE_DEPLOY_VIDEO } from '../../config'
import { getGitProviderListAuth, getSourceConfig } from '../../services/service'
import { GitMaterialType, MaterialListProps } from './material.types'
import MaterialForm from './MaterialForm'

import './material.scss'

const MaterialList = ({
    appId,
    isTemplateView,
    isJobView,
    isCreateAppView,
    handleGitMaterialsChange,
    respondOnSuccess,
    toggleRepoSelectionTippy,
    setRepo,
}: MaterialListProps) => {
    const getInitialData = () =>
        Promise.all([getSourceConfig(appId, null, isTemplateView), getGitProviderListAuth(appId)])

    const {
        isLoading: isLoadingInitialResponse,
        data: initialResponse,
        error: initialDataError,
        refetch: refetchInitialData,
    } = useQuery<
        Awaited<ReturnType<typeof getInitialData>>,
        { materials: GitMaterialType[]; providers: GitAccountDTO[] },
        [string, string, boolean],
        false
    >({
        queryKey: ['material-list-init-data', appId, isTemplateView],
        queryFn: getInitialData,
        select: ([sourceConfigRes, providersRes]) => {
            const provs = structuredClone(providersRes?.result) || []
            const mats = (sourceConfigRes.result.material || []).map<GitMaterialType>((mat) => ({
                ...mat,
                includeExcludeFilePath: mat.filterPattern?.length ? mat.filterPattern.join('\n') : '',
                gitProvider: provs.find((p) => mat.gitProviderId === p.id),
                isExcludeRepoChecked: !!mat.filterPattern?.length,
            }))

            return {
                materials: mats.sort((a, b) => sortCallback('id', a, b)),
                providers: providersRes?.result || [],
            }
        },
    })

    const { materials, providers } = initialResponse || { materials: [], providers: [] }

    useEffect(() => {
        if (handleGitMaterialsChange) {
            handleGitMaterialsChange(materials, false)
        }
    }, [materials])

    const refreshMaterials = async () => {
        if (materials.length < 1) {
            respondOnSuccess()
        }

        await refetchInitialData()
    }

    const isCheckoutPathValid = (checkoutPath: string) => {
        if (materials.length >= 1) {
            // Multi git
            if (!checkoutPath.length) {
                return 'This is a required field'
            }
            if (!checkoutPath.startsWith('./')) {
                return "Invalid Path. Checkout path should start with './'"
            }
            return undefined
        }
        if (checkoutPath.length && !checkoutPath.startsWith('./')) {
            return "Invalid Path. Checkout path should start with './'"
        }
        return undefined
    }

    const handleSingleGitMaterialUpdate = (id: GitMaterialType['id']) => (updatedMaterial, isError) => {
        if (handleGitMaterialsChange) {
            handleGitMaterialsChange(
                materials.map((mat) => (mat.id === id ? updatedMaterial : mat)),
                isError,
            )
        }
    }

    const renderPageHeader = () => (
        <>
            <h2
                className="form__title form__title--artifacts"
                data-testid={`${isJobView ? 'source-code-heading' : 'git-repositories-heading'}`}
            >
                {isJobView ? 'Source code' : 'Git Repositories'}
            </h2>
            <div className="flexbox dc__gap-8 mb-16">
                <p className="m-0 fs-12 lh-20 cn-6">
                    Manage source code repositories for this {isJobView ? 'job' : 'application'}.
                </p>
                <DocLink
                    dataTestId="git-repo-doc-link"
                    docLinkKey={isJobView ? 'JOB_SOURCE_CODE' : 'GLOBAL_CONFIG_GIT'}
                    fontWeight="normal"
                    size={ComponentSizeType.small}
                />
            </div>
        </>
    )

    const renderSampleApp = () => (
        <div className="sample-repo-container br-8 p-16 flexbox">
            <span className="mr-16 icon-container">
                <GitHub />
            </span>
            <div>
                <h2 className="sample-title fs-14 fw-6">Looking to deploy a sample application?</h2>
                <div className="flex left cb-5 fs-13">
                    <a
                        rel="noreferrer noopener"
                        target="_blank"
                        className="flex left dc__link mr-16"
                        href={AppListConstants.SAMPLE_NODE_REPO_URL}
                    >
                        <Folder className="icon-dim-16 mr-4 scb-5" />
                        View sample app git repository
                    </a>
                    <a
                        rel="noreferrer noopener"
                        target="_blank"
                        className="flex left dc__link"
                        href={DEVTRON_NODE_DEPLOY_VIDEO}
                    >
                        <PlayMedia className="icon-dim-16 scb-5 mr-4" />
                        Watch how to configure sample application
                    </a>
                </div>
            </div>
        </div>
    )

    if (isLoadingInitialResponse) {
        return <Progressing pageLoader />
    }
    if (initialDataError) {
        return <ErrorScreenManager code={initialDataError?.code} reload={refetchInitialData} />
    }
    return (
        <div className={!isCreateAppView ? 'form__app-compose' : 'flexbox-col dc__gap-16'}>
            {!isCreateAppView && (
                <>
                    {renderPageHeader()}
                    {!isJobView && !materials.length && renderSampleApp()}
                    <MaterialForm
                        key="create-material-form"
                        appId={Number(appId)}
                        isMultiGit={materials.length > 0}
                        providers={providers}
                        refreshMaterials={refreshMaterials}
                        isCheckoutPathValid={isCheckoutPathValid}
                        reload={refetchInitialData}
                        isJobView={isJobView}
                        isTemplateView={isTemplateView}
                    />
                </>
            )}
            {materials.map((mat) => (
                <MaterialForm
                    key={mat.id}
                    appId={Number(appId)}
                    isMultiGit={materials.length > 0}
                    preventRepoDelete={materials.length === 1}
                    providers={providers}
                    material={mat}
                    refreshMaterials={refreshMaterials}
                    isCheckoutPathValid={isCheckoutPathValid}
                    reload={refetchInitialData}
                    toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                    setRepo={setRepo}
                    isJobView={isJobView}
                    isTemplateView={isTemplateView}
                    isCreateAppView={isCreateAppView}
                    handleSingleGitMaterialUpdate={handleSingleGitMaterialUpdate(mat.id)}
                />
            ))}
        </div>
    )
}

export default MaterialList
