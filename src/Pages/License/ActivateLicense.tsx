import {
    useTheme,
    LicensingErrorCodes,
    Button,
    ButtonVariantType,
    DevtronLicenseCard,
    DevtronProgressing,
    ENTERPRISE_SUPPORT_LINK,
    ErrorScreenManager,
    Icon,
    InfoBlock,
    LoginBanner,
    URLS,
    useAsync,
    getHandleOpenURL,
    CONTACT_SUPPORT_LINK,
    ActivateLicenseDialog,
    ICDevtronWithBorder,
    API_STATUS_CODES,
} from '@devtron-labs/devtron-fe-common-lib'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { getDevtronLicenseInfo } from './service'

const ActivateLicense = () => {
    const history = useHistory()
    const [isLoading, licenseData, licenseDataError, reloadLicenseData] = useAsync(getDevtronLicenseInfo, [])
    const [showActivateDialog, setShowActivateDialog] = useState<boolean>(false)
    const { appTheme } = useTheme()

    const redirectToLogin = () => {
        history.replace(URLS.LOGIN_SSO)
    }

    useEffect(() => {
        if (isLoading) {
            return
        }

        // licenseDataError.code === 404 means, oss and licensing does not exist
        //  In case licenseStatusError is null, license is valid
        if (licenseDataError?.code === API_STATUS_CODES.NOT_FOUND || !licenseData.licenseStatusError) {
            redirectToLogin()
            return
        }

        if (licenseData.licenseStatusError.code === LicensingErrorCodes.LicKeyNotFound) {
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
                    <div className="fs-16 lh-1-5 cr-5 fw-4">Your license key is no longer valid</div>
                </div>
            </div>
            {licenseData.licenseStatusError &&
            licenseData.licenseStatusError.code !== LicensingErrorCodes.LicenseExpired ? (
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
                        onClick: getHandleOpenURL(CONTACT_SUPPORT_LINK),
                        dataTestId: 'contact-support',
                        startIcon: <Icon name="ic-chat-circle-dots" color="B500" size={16} />,
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
                    appTheme={appTheme}
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
