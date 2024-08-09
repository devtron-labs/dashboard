import { SSOProvider } from './constants'
import { SSOTabIconsTypes } from './ssoConfig.types'
import { ReactComponent as GitHub } from '../../../../assets/icons/git/github.svg'
import { ReactComponent as Microsoft } from '../../../../assets/icons/ic-microsoft.svg'
import { ReactComponent as LDAP } from '../../../../assets/icons/ic-ldap.svg'
import { ReactComponent as OIDC } from '../../../../assets/icons/ic-oidc.svg'
import { ReactComponent as Openshift } from '../../../../assets/icons/ic-openshift.svg'
import { ReactComponent as GitLab } from '../../../../assets/icons/git/gitlab.svg'
import { ReactComponent as Google } from '../../../../assets/icons/ic-google.svg'

export const SSOTabIcons = ({ provider }: SSOTabIconsTypes) => {
    switch (provider) {
        case SSOProvider.google:
            return <Google />
        case SSOProvider.github:
            return <GitHub />
        case SSOProvider.gitlab:
            return <GitLab />
        case SSOProvider.microsoft:
            return <Microsoft />
        case SSOProvider.ldap:
            return <LDAP />
        case SSOProvider.oidc:
            return <OIDC />
        case SSOProvider.openshift:
            return <Openshift />
        default:
            return null
    }
}

export default SSOTabIcons
