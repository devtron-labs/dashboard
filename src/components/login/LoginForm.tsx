import { REQUIRED_FIELD_MSG } from '@Config/constantMessaging'
import {
    CustomInput,
    PasswordField,
    Button,
    ComponentSizeType,
    ButtonComponentType,
    URLS,
    ButtonVariantType,
    ServerErrors,
    showError,
    useUserEmail,
    URLS as CommonURL,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { importComponentFromFELibrary } from '@Components/common'
import { DOCUMENTATION } from '@Config/constants'
import { loginAsAdmin } from './login.service'
import { LoginFormType } from './login.types'

export const LoginForm = ({ loginList }: LoginFormType) => {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        username: 'admin',
        password: '',
    })
    const [errorMessage, setErrorMessage] = useState({
        username: {
            message: '',
            isValid: true,
        },
        password: {
            message: '',
            isValid: true,
        },
    })

    const { setEmail } = useUserEmail()
    const history = useHistory()
    const location = useLocation()

    const NetworkStatusInterface = !importComponentFromFELibrary('NetworkStatusInterface', null, 'function')

    const getDefaultRedirectionURL = () => {
        const queryString = history.location.search.split('continue=')[1]
        if (queryString) {
            return queryString
        }

        if (!window._env_.HIDE_NETWORK_STATUS_INTERFACE && !!NetworkStatusInterface) {
            return CommonURL.NETWORK_STATUS_INTERFACE
        }

        // NOTE: we don't have serverMode therefore defaulting to flag value
        return window._env_.FEATURE_DEFAULT_LANDING_RB_ENABLE ? URLS.RESOURCE_BROWSER : URLS.APP
    }

    const onSubmitLogin = (e): void => {
        e.preventDefault()
        const data = form
        setLoading(true)
        loginAsAdmin(data)
            .then((response) => {
                if (response.result.token) {
                    setLoading(false)
                    const url = getDefaultRedirectionURL()
                    setEmail(data.username)
                    history.push(url)
                    localStorage.setItem('isAdminLogin', 'true')
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setLoading(false)
            })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.persist()

        const { name, value } = e.target
        setErrorMessage((prevState) => ({
            ...prevState,
            [name]: {
                message: value ? '' : REQUIRED_FIELD_MSG,
                isValid: !!value,
            },
        }))

        setForm({
            ...form,
            [name]: value,
        })
    }

    return (
        <form className="flexbox-col p-36 dc__gap-32" autoComplete="on" onSubmit={onSubmitLogin} noValidate>
            <div className="flexbox-col dc__gap-16">
                <CustomInput
                    placeholder="Enter username"
                    value={form.username}
                    name="username"
                    onChange={handleChange}
                    label="User ID"
                    required
                    error={errorMessage.username.message}
                />
                <div className="flexbox-col dc__gap-4">
                    <PasswordField
                        placeholder="Enter password"
                        value={form.password}
                        name="password"
                        onChange={handleChange}
                        label="Password"
                        required
                        shouldShowDefaultPlaceholderOnBlur={false}
                        autoFocus
                        error={errorMessage.password.message}
                    />

                    <div className="flex left dc__gap-4">
                        <Icon name="ic-help-outline" color="B500" size={12} />

                        <a
                            className="anchor fs-11 cb-5"
                            rel="noreferrer noopener"
                            target="_blank"
                            href={DOCUMENTATION.ADMIN_PASSWORD}
                        >
                            What is my admin password?
                        </a>
                    </div>
                </div>
            </div>
            <div className="flexbox-col dc__gap-12">
                <Button
                    disabled={loading || !form.password}
                    isLoading={loading}
                    dataTestId="login-button"
                    text="Login"
                    fullWidth
                    size={ComponentSizeType.xl}
                    buttonProps={{
                        type: 'submit',
                    }}
                />

                {loginList.length > 0 && (
                    <Button
                        dataTestId="sso-login"
                        text="Login using SSO service"
                        component={ButtonComponentType.link}
                        linkProps={{
                            to: `${URLS.LOGIN_SSO}${location.search}`,
                        }}
                        variant={ButtonVariantType.text}
                    />
                )}
            </div>
        </form>
    )
}
