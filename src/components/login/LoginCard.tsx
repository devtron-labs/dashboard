import { EULA_LINK, PREVIEW_DEVTRON, PRIVACY_POLICY } from '@Config/constants'
import { importComponentFromFELibrary } from '@Components/common'
import { Icon } from '@devtron-labs/devtron-fe-common-lib'
import { LoginCardProps } from './login.types'

export const LoginCard = ({ renderContent }: LoginCardProps) => {
    const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

    const renderDevtronLogo = () => (
        <div className="flex column dc__gap-16 dc__text-center">
            {window._env_.LOGIN_DT_LOGO ? (
                <img
                    src={window._env_.LOGIN_DT_LOGO}
                    alt="login-dt-logo"
                    width="170px"
                    height="120px"
                    className="flexbox dc__align-self-center fcb-5"
                />
            ) : (
                <Icon name="ic-login-devtron-logo" color={null} size={null} />
            )}

            <p className="fs-16 lh-20 m-0 w-300 dc__align-self-center cn-9">
                Your tool for Rapid, Reliable & Repeatable deployments
            </p>
        </div>
    )

    const renderTermsAndConditions = () => (
        <div className="border-top__secondary flex dc__gap-4 p-12 cn-7">
            <p className="m-0 lh-18">By logging in, you agree to our </p>
            <a
                href={window.location.origin === PREVIEW_DEVTRON ? PRIVACY_POLICY : EULA_LINK}
                target="blank"
                rel="noreferrer"
                className="anchor lh-18"
            >
                {window.location.origin === PREVIEW_DEVTRON ? 'Privacy Policy' : 'User License'}
            </a>
        </div>
    )

    return (
        <div className="login-card__wrapper br-12 mw-420 bg__primary dc__border">
            <div className="flexbox-col dc__gap-32 p-36">
                {renderDevtronLogo()}
                {renderContent()}
            </div>
            {isFELibAvailable && renderTermsAndConditions()}
        </div>
    )
}
