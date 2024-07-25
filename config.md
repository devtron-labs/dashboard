# DASHBOARD CONFIG PARAMETER

| Key                               | Value     | Description                                     |
|-----------------------------------|-----------|-------------------------------------------------|
| APPLICATION_METRICS_ENABLED        | "true"    | Show application metrics button                |
| HIDE_APPLICATION_GROUPS            | "false"   | Hide application group from Devtron UI         |
| HIDE_DISCORD                       | "true"    | Hide Discord button from UI                    |
| HIDE_GITOPS_OR_HELM_OPTION         | "false"   | Enable GitOps and Helm option                 |
| HOTJAR_ENABLED                     | "false"   | Hotjar integration status                      |
| POSTHOG_ENABLED                    | "true"    | PostHog integration status                     |
| POSTHOG_TOKEN                      | XXXXXXXX  | PostHog API token                        |
| SENTRY_ENV                         | stage     | Sentry environment                              |
| SENTRY_ERROR_ENABLED               | false     |  To send uncaught errors to sentry             |
| SENTRY_PERFORMANCE_ENABLED         | false     |  To send persormance sentry      |
| SENTRY_DSN                         | ''        | SENTRY Data Source Name |
| SENTRY_TRACES_SAMPLE_RATE          | 0.2       | Rate at which data send to sentry.(min=0 max=1)|
| ENABLE_RESTART_WORKLOAD            | "false"    | Show restart pods option in app details page   |
| ENABLE_BUILD_CONTEXT               | "true"    | Enable build context in Devtron UI             |
| FORCE_SECURITY_SCANNING            | "false"   | Force security scanning                         |
| GA_ENABLED                         | "true"    | Enable Google Analytics (GA)                   |
| GA_TRACKING_ID                     | G-XXXXXXXX | Google Analytics tracking ID                 |
| ENABLE_SCOPED_VARIABLES            | "false" | For enabling scoped variable from UI, also need to enable it in backend.          |
| RECOMMEND_SECURITY_SCANNING        | "false"    | Recommend security scanning                  |
| FORCE_SECURITY_SCANNING            | "false"    |  Force Security Scanning                |
| CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL     | 7000    |  Interval for checking connection with cluster terminal.     |
| LOGIN_PAGE_IMAGE                   | ""         | Login page image url                          |
| LOGIN_PAGE_IMAGE_BG                | ""         | Login page image background color code        |
| DEFAULT_CI_TRIGGER_TYPE_MANUAL     | "false"    | Change default trigger behaviour of newly created ci-pipeline to manual |
| GLOBAL_API_TIMEOUT                  |  60000  | Default timeout for all API requests in DASHBOARD  |
| TRIGGER_API_TIMEOUT                 |  60000  | Default timeout for all API requests for Trigger calls (Deploy artifacts, charts) in DASHBOARD  |
| LOGIN_DT_LOGO                      | ""         | Devtron logo for login page     |
| SIDEBAR_DT_LOGO                    | ""         | Devtron logo for sidebar (would work if ORGANIZATION_NAME is not given)       |
| SERVICE_WORKER_TIMEOUT                    | "1"         | Timeout value (in minutes) to fetch update for dashboard, change it cautiously as might hamper your update cycle       |
| ENABLE_RESOURCE_SCAN                    | false         | Enable image scan for resources        |
| ENABLE_RESOURCE_SCAN_V2            | true      | Enable image scan for resources (v2)          |
| ORGANIZATION_NAME                      | ""         | Name of the organization     |
| FEATURE_STEP_WISE_LOGS_ENABLE                      | true         | Would segregate logs into tasks     |
# DASHBOARD CONFIG SECRET
