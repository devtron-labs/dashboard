import { importComponentFromFELibrary } from '@Components/common'
import { Icon } from '@devtron-labs/devtron-fe-common-lib'
import { LoginCardProps } from './login.types'

const getTermsAndConditions = importComponentFromFELibrary('getTermsAndConditions', null, 'function')

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
                <Icon name="ic-login-devtron-logo" color={null} size={null} />
            )}

            <p className="fs-16 lh-20 m-0 w-300 dc__align-self-center cn-9">
                Your tool for Rapid, Reliable & Repeatable deployments
            </p>
        </div>
    )

    return (
        <div className="login-card__wrapper br-12 mw-420 bg__primary dc__border">
            <div className="flexbox-col dc__gap-32 p-36">
                {renderDevtronLogo()}
                {renderContent()}
            </div>
            {getTermsAndConditions && getTermsAndConditions()}
        </div>
    )
}
