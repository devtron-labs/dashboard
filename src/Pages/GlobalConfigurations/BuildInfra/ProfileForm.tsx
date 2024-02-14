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
    BUILD_INFRA_TEXT,
} from '@devtron-labs/devtron-fe-common-lib'
import './styles.scss'

const ProfileForm: FunctionComponent = () => {
    const { breadcrumbs } = useBreadcrumb(BUILD_INFRA_BREADCRUMB)
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
    } = useBuildInfraForm({ name: DEFAULT_PROFILE_NAME, editProfile: true })
    // Would use this to disable the save button, if all keys in profileInputErrors are null or undefined, then there are no errors
    // Empty string means isRequired but no need to show error below input field
    const formErrorCount = useMemo(
        () =>
            Object.keys(profileInputErrors).filter(
                (item) => profileInputErrors[item] !== null && profileInputErrors[item] !== undefined,
            ).length,
        [profileInputErrors],
    )

    const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault()
        }
    }

    const showActionItems = !isLoading && !responseError && profileInput?.configurations

    return (
        <form
            className="h-100 flexbox-col build-infra pl pr pt pb dc__content-space bcn-0"
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
        >
            <div className="flexbox-col dc__gap-24 pt pr pb pl h-100 dc__overflow-scroll">
                <BuildInfraDescriptor breadCrumbs={breadcrumbs} />

                <APIResponseHandler
                    isLoading={isLoading}
                    progressingProps={{
                        pageLoader: true,
                    }}
                    error={responseError}
                    reloadProps={{
                        reload: reloadRequest,
                    }}
                    notFoundText={{
                        title: BUILD_INFRA_TEXT.PROFILE_NOT_FOUND.title,
                        subTitle: BUILD_INFRA_TEXT.PROFILE_NOT_FOUND.subTitle,
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
                <BuildInfraFooter disabled={formErrorCount !== 0} editProfile loading={loadingActionRequest} />
            )}
        </form>
    )
}

export default ProfileForm
