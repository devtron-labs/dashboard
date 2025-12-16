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

import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    activateLicense,
    ActivateLicenseDialog,
    API_STATUS_CODES,
    Button,
    ButtonComponentType,
    ButtonVariantType,
    CONTACT_SUPPORT_LINK,
    DevtronLicenseCard,
    DevtronProgressing,
    ENTERPRISE_SUPPORT_LINK,
    ErrorScreenManager,
    ICDevtronWithBorder,
    Icon,
    InfoBlock,
    LICENSE_KEY_QUERY_PARAM,
    LicensingErrorCodes,
    LoginBanner,
    showError,
    URLS,
    useAsync,
    useSearchString,
    useTheme,
} from '@devtron-labs/devtron-fe-common-lib'

import { getDevtronLicenseInfo } from './service'

const ActivateLicense = () => {
    const history = useHistory()
    const { searchParams } = useSearchString()
    const [isLoading, licenseData, licenseDataError, reloadLicenseData] = useAsync(getDevtronLicenseInfo, [])
    const [showActivateDialog, setShowActivateDialog] = useState<boolean>(false)
    const { appTheme } = useTheme()

    const redirectToLogin = () => {
        history.replace(URLS.LOGIN_SSO)
    }

    const handleActivateLicense = async () => {
        const license = searchParams[LICENSE_KEY_QUERY_PARAM]
        if (license) {
            try {
                await activateLicense(license)
                redirectToLogin()
                return true
            } catch (error) {
                showError(error)
            }
        }

        return false
    }

    useEffect(() => {
        if (isLoading) {
            return
        }

        // licenseDataError.code === 404 means, oss and licensing does not exist
        //  In case licenseStatusError is null, license is valid
        if (licenseDataError?.code === API_STATUS_CODES.NOT_FOUND || !licenseData?.licenseStatusError) {
            redirectToLogin()
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleActivateLicense()

        if (licenseData?.licenseStatusError?.code === LicensingErrorCodes.LicKeyNotFound) {
            setShowActivateDialog(true)
        }
    }, [isLoading, licenseData])

    if (isLoading) {
        return <DevtronProgressing parentClasses="bg__primary flex full-height-width" classes="icon-dim-80" />
    }

    if (licenseDataError) {
        return (
            <div className="full-height-width bg__tertiary">
                <ErrorScreenManager code={licenseDataError?.code} reload={reloadLicenseData} />
            </div>
        )
    }

    const handleChangeLicense = () => {
        setShowActivateDialog(true)
    }

    const renderInvalidLicenseDialog = () => (
        <div className="flexbox-col p-36 dc__gap-32 w-400 border__primary br-12">
            <div className="flexbox-col dc__gap-20">
                <ICDevtronWithBorder />
                <div className="flexbox-col dc__gap-4">
                    <div className="fs-20 lh-1-5 fw-7 cn-9 font-merriweather dc__truncate">
                        {licenseData.enterpriseName}
                    </div>
                    <div className="fs-16 lh-1-5 cr-5 fw-4">
                        {licenseData.isFreemium &&
                        licenseData.licenseStatusError?.code === LicensingErrorCodes.ClusterLimitExceeded
                            ? 'Freemium Limit Reached'
                            : 'Your license key is no longer valid'}
                    </div>
                </div>
            </div>
            {licenseData.licenseStatusError &&
            licenseData.licenseStatusError.code !== LicensingErrorCodes.LicenseExpired &&
            licenseData.licenseStatusError.code !== LicensingErrorCodes.ClusterLimitExceeded ? (
                <InfoBlock
                    heading="Need help?"
                    description={
                        <span>
                            For further details mail us at&nbsp;
                            <a href={`mailto:${ENTERPRISE_SUPPORT_LINK}`}>{ENTERPRISE_SUPPORT_LINK}</a> or contact
                            Devtron Support
                        </span>
                    }
                    variant="help"
                    buttonProps={{
                        text: 'Contact Support',
                        variant: ButtonVariantType.text,
                        component: ButtonComponentType.anchor,
                        dataTestId: 'contact-support',
                        startIcon: <Icon name="ic-chat-circle-dots" color="B500" size={16} />,
                        anchorProps: { href: CONTACT_SUPPORT_LINK },
                    }}
                    layout="column"
                />
            ) : (
                <DevtronLicenseCard
                    enterpriseName={licenseData.enterpriseName}
                    expiryDate={licenseData.expiryDate}
                    ttl={licenseData.ttl}
                    licenseStatus={licenseData.licenseStatus}
                    isTrial={licenseData.isTrial}
                    licenseSuffix={licenseData.licenseSuffix}
                    isFreemium={licenseData.isFreemium}
                    appTheme={appTheme}
                    licenseStatusError={licenseData.licenseStatusError}
                    // FIXME: For now, need to set false until saas instance detection is implemented
                    isSaasInstance={false}
                />
            )}
            <div className="flex dc__content-space">
                <span>Have another license key?</span>
                <Button
                    dataTestId="change-license"
                    text="Change license"
                    variant={ButtonVariantType.text}
                    onClick={handleChangeLicense}
                />
            </div>
        </div>
    )

    return (
        <div className="full-height-width bg__secondary dc__grid-half">
            <div className="flexbox p-16">
                <LoginBanner />
            </div>
            <div className="flex">
                {showActivateDialog ? (
                    <ActivateLicenseDialog
                        fingerprint={licenseData.fingerprint || ''}
                        enterpriseName={licenseData.enterpriseName}
                        handleLicenseActivateSuccess={redirectToLogin}
                    />
                ) : (
                    renderInvalidLicenseDialog()
                )}
            </div>
        </div>
    )
}

export default ActivateLicense
