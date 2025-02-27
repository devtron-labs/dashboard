import { PRIVACY_POLICY } from '@Config/constants'
import { ReactComponent as DevtronLogo } from '@Icons/logo/logo-dt.svg'
import { LoginCardProps } from './login.types'

export const LoginCard = ({ renderContent }: LoginCardProps) => {
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
                <DevtronLogo />
            )}

            <p className="fs-16 lh-20 m-0 w-300 dc__align-self-center">
                Your tool for Rapid, Reliable & Repeatable deployments
            </p>
        </div>
    )

    const renderTermsAndConditions = () => (
        <div className="dc__border-top flex dc__gap-4 p-12">
            <p className="m-0">By logging in, you agree to our </p>
            <a href={PRIVACY_POLICY} target="blank">
                Terms of Service
            </a>
        </div>
    )

    return (
        <div className="login-card__wrapper br-12 mw-420">
            <div className="flexbox-col dc__gap-32 p-36">
                {renderDevtronLogo()}
                {renderContent()}
            </div>
            {renderTermsAndConditions()}
        </div>
    )
}
