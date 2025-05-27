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
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'

import {
    AnimatePresence,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    getCookie,
    Host,
    Icon,
    LoginBanner,
    MotionDiv,
    SSOProviderIcon,
    ToastManager,
    ToastVariantType,
    URLS as CommonURL,
    useAsync,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { getSSOConfigList } from '@Pages/GlobalConfigurations/Authorization/SSOLoginServices/service'

import { TOKEN_COOKIE_NAME, URLS } from '../../config'
import { dashboardAccessed } from '../../services/service'
import { LOGIN_CARD_ANIMATION_VARIANTS, SSOProvider } from './constants'
import { LoginForm } from './LoginForm'

import './login.scss'

const NetworkStatusInterface = !importComponentFromFELibrary('NetworkStatusInterface', null, 'function')

const getTermsAndConditions = importComponentFromFELibrary('getTermsAndConditions', null, 'function')

const Login = () => {
    const [continueUrl, setContinueUrl] = useState('')

    const { searchParams } = useSearchString()
    const location = useLocation()
    const history = useHistory()

    const [ssoListLoading, ssoListResponse] = useAsync(getSSOConfigList, [])

    const loginList = ssoListResponse?.result ?? []

    const setLoginNavigationURL = () => {
        let queryParam = searchParams.continue

        // 1. TOKEN_COOKIE_NAME= 'argocd.token', is the only token unique to a user generated as Cookie when they log in,
        // If a user is still at login page for the first time and getCookie(TOKEN_COOKIE_NAME) becomes false.
        // queryParam is '/' for first time login, queryParam != "/" becomes false at login page. Hence toast won't appear
        // at the time of first login.
        // 2. Also if the cookie is deleted/changed after some time from the database at backend then getCookie(TOKEN_COOKIE_NAME)
        // becomes false but queryParam != "/" will be true and queryParam is also not null hence redirecting users to the
        // login page with Please login again toast appearing.

        if (queryParam && (getCookie(TOKEN_COOKIE_NAME) || queryParam !== '/')) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please login again',
            })
        }
        if (queryParam && queryParam.includes('login')) {
            queryParam =
                window._env_.HIDE_NETWORK_STATUS_INTERFACE || !NetworkStatusInterface
                    ? URLS.APP
                    : CommonURL.NETWORK_STATUS_INTERFACE
            const url = `${location.pathname}?continue=${queryParam}`
            history.push(url)
        }
        if (!queryParam) {
            queryParam = ''
        }

        setContinueUrl(encodeURI(`${window.location.origin}/orchestrator${window.__BASE_URL__}${queryParam}`))
    }

    useEffect(() => {
        setLoginNavigationURL()
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dashboardAccessed()
    }, [])

    const onClickSSO = () => {
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('isSSOLogin', 'true')
        }

        const url = `${window.location.origin}${Host}${URLS.AUTHENTICATE}?return_url=${continueUrl}`
        window.location.replace(url)
    }

    const renderSSOLoginPage = () => (
        <div className="flexbox-col dc__gap-12 p-36">
            {ssoListLoading && !loginList.length && (
                <Button
                    variant={ButtonVariantType.secondary}
                    text="Checking SSO"
                    dataTestId="checking-sso"
                    style={ButtonStyleType.neutral}
                    startIcon={<Icon name="ic-circle-loader" color={null} />}
                    fullWidth
                    size={ComponentSizeType.xl}
                    disabled
                />
            )}
            {loginList
                .filter((sso) => sso.active)
                .map((item) => (
                    <div key={item.name}>
                        <Button
                            variant={ButtonVariantType.secondary}
                            text={`Login with ${item.name}`}
                            key={item.name}
                            onClick={onClickSSO}
                            dataTestId={`login-with-${item.name}`}
                            style={ButtonStyleType.neutral}
                            startIcon={<SSOProviderIcon provider={item.name as SSOProvider} />}
                            fullWidth
                            size={ComponentSizeType.xl}
                        />
                    </div>
                ))}
            <div className="flex">
                <Button
                    component={ButtonComponentType.link}
                    variant={ButtonVariantType.text}
                    linkProps={{
                        to: `${URLS.LOGIN_ADMIN}${location.search}`,
                    }}
                    text="Login as administrator"
                    dataTestId="login-as-admin"
                />
            </div>
        </div>
    )

    const renderAdminLoginPage = () => <LoginForm loginList={loginList} />

    const renderDevtronLogo = () => (
        <div className="flexbox-col dc__align-items-center bg__secondary px-36 py-32 dc__gap-20">
            <div className="flex p-6 border__primary br-8 dc__w-fit-content bg__white">
                <Icon name="ic-devtron" color={null} size={40} />
            </div>
            <div className="flexbox-col dc__gap-4">
                <span className="cn-9 text-center font-merriweather fs-20 fw-7 lh-1-5">Devtron</span>
                <span className="cn-8 fs-16 fw-4 lh-1-5">Login to Devtron dashboard</span>
            </div>
        </div>
    )

    const renderLoginContent = () => (
        <Switch location={location}>
            <Route path={URLS.LOGIN_SSO} component={renderSSOLoginPage} />
            <Route path={URLS.LOGIN_ADMIN} component={renderAdminLoginPage} />
            <Redirect to={URLS.LOGIN_SSO} />
        </Switch>
    )

    return (
        <div className="full-height-width dc__grid-half bg__secondary">
            <div className="flexbox p-12">
                {window._env_.LOGIN_PAGE_IMAGE ? (
                    <div
                        style={{
                            backgroundImage: `url(${window._env_.LOGIN_PAGE_IMAGE})`,
                        }}
                        className="login-image-container flex br-12 border__primary bg__primary h-100 w-100"
                    />
                ) : (
                    <LoginBanner />
                )}
            </div>
            <div className="flex">
                <div className="shadow__overlay dc__overflow-hidden br-12 mw-420 bg__primary dc__border">
                    <div className="flexbox-col">
                        {renderDevtronLogo()}
                        <AnimatePresence>
                            <MotionDiv
                                key={location.pathname}
                                variants={LOGIN_CARD_ANIMATION_VARIANTS}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                className="dc__overflow-hidden"
                            >
                                {renderLoginContent()}
                            </MotionDiv>
                        </AnimatePresence>
                    </div>
                    {getTermsAndConditions && getTermsAndConditions()}
                </div>
            </div>
        </div>
    )
}

export default Login
