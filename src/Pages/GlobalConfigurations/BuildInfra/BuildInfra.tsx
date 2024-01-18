import React, { FunctionComponent, useMemo } from 'react'
import {
    BUILD_INFRA_BREADCRUMB,
    BuildInfraDescriptor,
    BuildInfraFooter,
    useBreadcrumb,
    BuildInfraConfigForm,
    useBuildInfraForm,
    DEFAULT_PROFILE_NAME,
    APIResponseHandler,
    ErrorScreenNotAuthorized,
} from '@devtron-labs/devtron-fe-common-lib'
import { BuildInfraProps } from './types'
import './styles.scss'

const BuildInfra: FunctionComponent<BuildInfraProps> = ({ isSuperAdmin }) => {
    const { breadcrumbs } = useBreadcrumb(BUILD_INFRA_BREADCRUMB)
    // Sending isSuperAdmin since don't even want to send API Request for that case
    const {
        isLoading,
        profileResponse,
        responseError,
        reloadRequest,
        profileInput,
        profileInputErrors,
        handleProfileInputChange,
        loadingActionRequest,
        handleSubmit,
    } = useBuildInfraForm({ name: DEFAULT_PROFILE_NAME, isSuperAdmin, editProfile: true })
    // Would use this to disable the save button, if all keys in profileInputErrors are null, then there are no errors
    // Might enhance this check later for other operations
    const formErrorCount = useMemo(
        () => Object.keys(profileInputErrors).filter((item) => profileInputErrors[item]).length,
        [profileInputErrors],
    )
    const showActionItems = isSuperAdmin && !isLoading && !responseError && profileInput?.configurations

    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }

    return (
        <form className="h-100 flexbox-col build-infra pl pr pt pb dc__content-space bcn-0" onSubmit={handleSubmit}>
            <div className="flexbox-col dc__gap-24 pt pr pb pl h-100 dc__overflow-scroll">
                <BuildInfraDescriptor breadCrumbs={breadcrumbs} />

                <APIResponseHandler
                    isLoading={isLoading}
                    progressingProps={{
                        pageLoader: true,
                    }}
                    error={responseError}
                    notAuthorized={!isSuperAdmin}
                    reloadProps={{
                        reload: reloadRequest,
                    }}
                >
                    <BuildInfraConfigForm
                        profileInput={profileInput}
                        profileInputErrors={profileInputErrors}
                        handleProfileInputChange={handleProfileInputChange}
                        isDefaultProfile
                        unitsMap={profileResponse?.configurationUnits}
                    />
                </APIResponseHandler>
            </div>

            {showActionItems && (
                <BuildInfraFooter
                    disabled={formErrorCount !== 0}
                    hideCancelButton
                    editProfile
                    loading={loadingActionRequest}
                />
            )}
        </form>
    )
}

export default BuildInfra
