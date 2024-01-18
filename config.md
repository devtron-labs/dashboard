# DASHBOARD CONFIG PARAMETER

| Key                               | Value     | Description                                     |
|-----------------------------------|-----------|-------------------------------------------------|
| VITE_APPLICATION_METRICS_ENABLED        | "true"    | Show application metrics button                |
| VITE_HIDE_APPLICATION_GROUPS            | "false"   | Hide application group from Devtron UI         |
| VITE_HIDE_DISCORD                       | "true"    | Hide Discord button from UI                    |
| VITE_HIDE_DEPLOYMENT_GROUPS         | "false"   | Enable GitOps and Helm option                 |
| VITE_HOTJAR_ENABLED                     | "false"   | Hotjar integration status                      |
| VITE_POSTHOG_ENABLED                    | "true"    | PostHog integration status                     |
| VITE_POSTHOG_TOKEN                      | XXXXXXXX  | PostHog API token                        |
| SENTRY_ENABLED                     | "false"   | Sentry integration status                      |
| VITE_SENTRY_ENV                         | stage     | Sentry environment                              |
| VITE_SENTRY_ERROR_ENABLED               | false     |  To send uncaught errors to sentry             |
| VITE_SENTRY_PERFORMANCE_ENABLED         | false     |  To send persormance sentry      |
| VITE_SENTRY_DSN                         | ''        | SENTRY Data Source Name |
| VITE_SENTRY_TRACES_SAMPLE_RATE          | 0.2       | Rate at which data send to sentry.(min=0 max=1)|
| VITE_USE_V2                             | "true"    | Use the v2 APIs                                 |
| VITE_ENABLE_RESTART_WORKLOAD            | "false"    | Show restart pods option in app details page   |
| VITE_ENABLE_BUILD_CONTEXT               | "true"    | Enable build context in Devtron UI             |
| VITE_FORCE_SECURITY_SCANNING            | "false"   | Force security scanning                         |
| VITE_GA_ENABLED                         | "true"    | Enable Google Analytics (GA)                   |
| VITE_GA_TRACKING_ID                     | G-XXXXXXXX | Google Analytics tracking ID                 |
| VITE_ENABLE_SCOPED_VARIABLES            | "false" | For enabling scoped variable from UI, also need to enable it in backend.          |
| VITE_RECOMMEND_SECURITY_SCANNING        | "false"    | Recommend security scanning                  |
| VITE_FORCE_SECURITY_SCANNING            | "false"    |  Force Security Scanning                |
| VITE_CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL     | 7000    |  Interval for checking connection with cluster terminal.     |
| VITE_LOGIN_PAGE_IMAGE                   | ""         | Login page image url                          |
| VITE_LOGIN_PAGE_IMAGE_BG                | ""         | Login page image background color code        |
| VITE_DEFAULT_CI_TRIGGER_TYPE_MANUAL     | "false"    | Change default trigger behaviour of newly created ci-pipeline to manual |
| VITE_GLOBAL_API_TIMEOUT    |  60000  | Default timeout for all API requests in DASHBOARD  |
| VITE_TRIGGER_API_TIMEOUT   |  60000  | Default timeout for all API requests for Trigger calls (Deploy artifacts, charts) in DASHBOARD  |

# DASHBOARD CONFIG SECRET
