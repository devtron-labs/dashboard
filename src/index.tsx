import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as Sentry from '@sentry/browser';
import { CaptureConsole } from '@sentry/integrations';
import { BrowserRouter } from 'react-router-dom';

interface customEnv {
    SENTRY_ENV?: string,
    SENTRY_ENABLED?: boolean,
    SENTRY_DSN?: string;
    HOTJAR_ENABLED?: boolean;
    CLUSTER_NAME?: boolean;
    APPLICATION_METRICS_ENABLED?: boolean;
    GA_ENABLED?: boolean;
    GA_TRACKING_ID?: string;
    RECOMMEND_SECURITY_SCANNING?: boolean;
    FORCE_SECURITY_SCANNING?: boolean;
    HIDE_DISCORD?: boolean;
    POSTHOG_ENABLED?: boolean;
    POSTHOG_TOKEN?: string;
}
declare global {
    interface Window {
        _env_: customEnv;
        hj: any;
        _hjSettings: any;
        Worker: any;
    }
}

const root = document.getElementById('root');
if (process.env.NODE_ENV === 'production' && window._env_ && window._env_.SENTRY_ENABLED) {
    Sentry.init({
        beforeBreadcrumb(breadcrumb, hint) {
            if (breadcrumb.category === 'console') {
                if (breadcrumb.level === 'warning') {
                    return null
                }
            }
            else if (['xhr', 'fetch', 'post', 'put', 'delete'].includes(breadcrumb.category)) {
                if (breadcrumb.data && breadcrumb.data.status_code === 200) {
                    return null
                }
            }
            return breadcrumb
        },
        dsn: window._env_.SENTRY_DSN || 'https://e6afdd3e57c74b24ac5ae7128391726e@o1147089.ingest.sentry.io/6232011',
        integrations: [new CaptureConsole({ levels: ['error'] })],
        ...(process.env.REACT_APP_GIT_SHA ? { release: `dashboard@${process.env.REACT_APP_GIT_SHA}` } : {}),
        environment: window._env_ && window._env_.SENTRY_ENV ? window._env_.SENTRY_ENV : 'staging',
    });
}


if (!window || !window._env_ ) {
    window._env_ = {
        SENTRY_ENV: "staging",
        SENTRY_ENABLED: false,
        HOTJAR_ENABLED: false,
        GA_ENABLED: false,
        APPLICATION_METRICS_ENABLED: false,
        POSTHOG_ENABLED: false,
        POSTHOG_TOKEN: "",
        RECOMMEND_SECURITY_SCANNING: false,
        FORCE_SECURITY_SCANNING: false,
        HIDE_DISCORD: true,
    }
}

ReactDOM.render(
    <React.StrictMode>
        {window.top === window.self
            ?
            <BrowserRouter basename={`${process.env.PUBLIC_URL}/`}>
                <App />
            </BrowserRouter>
            : null
        }
    </React.StrictMode>,
    root);

if (process.env.NODE_ENV === 'development') {
    (module as any).hot.accept()
}
