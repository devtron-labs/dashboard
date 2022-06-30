This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### `commit process`

-   Now before commiting lint will run and check for errors.
-   It will not allow to commit if there are lint errors.
-   To fix them run `yarn lint-fix` (check package.json). It is not capable of fixing everything so some fixes has to be done manually.

### Do's

-   Try to make only one state per page rest every thing shall be pure.
-   A method should do one and only one thing.
-   Do function and variable namings so good you don't need comments.
-   While making smaller Components make them reusable.
-   Do most of the heavy lifting tasks inside smaller components not in the state component.
-   Do all the parsing and error handling on service state component should not get anything more than (success and data) or (error and data).
-   Use BEM to name CSS classes and structure it.

### Don'ts

-   Don't add if else on render add functions which render checks on smaller functions.
-   Don't add IDs for CSS if done correctly you never need ids.
-   Don't add unnecessary Indentations it doesn't improve readability.
-   Never add checks on the basis of text.
-   Don't use float use display instead, use display flex-box, inline, inline-block.
-   Don't use mix type methods in a class

### Sentry Config

-   SENTRY_AUTH_TOKEN=""
-   SENTRY_ORG="devtron-labs"
-   SENTRY_PROJECT="dashboard"
-   DSN=""
-   SENTRY_TRACES_SAMPLE_RATE="0.2"

### Sentry sourcemap upload

```console
foo@bar:~$ sh sentry.sh
```

### Set custom sentry environment during production deployment, default is staging

```console
foo@bar~$ docker run -p 3000:80 -e SENTRY_ENV=my-custom-env -t artifact/tag
```

### Disable sentry error logging during production deployment, default enabled

```console
foo@bar~$ docker run -p 3000:80 -e SENTRY_ERROR_ENABLED=false -t artifact/tag
```

### Disable sentry performance monitoring during production deployment, default enabled

```console
foo@bar~$ docker run -p 3000:80 -e SENTRY_PERFORMANCE_ENABLED=false -t artifact/tag
```

### Enable Hotjar during production deployment, default disabled

```console
foo@bar~$ docker run -p 3000:80 -e HOTJAR_ENABLED=false -t artifact/tag
```

### Enable google analytics during production deployment, default disabled

```console
foo@bar~$ docker run -p 3000:80 -e GA_ENABLED=true -t artifact/tag
```

### Create test coverage report and save summary in report.txt

```console
foo@bar~$ npm run test -- --coverage --watchAll=false > report.txt
```

### Upload Summary on slack

```console
foo@bar~$ python uploadTestReport.py
```

### Run Following Scripts after release

```console
foo@bar~$ sh sentry.sh
foo@bar~$ npm run test -- --coverage --watchAll=false > report.txt
foo@bar~$ python uploadTestReport.py
```

### Development setup with proxy.

#### **`src/setupProxy.js`**

```js
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        '/orchestrator',
        createProxyMiddleware({
            target: 'http://demo.devtron.info:32080',
            changeOrigin: true,
            logLevel: 'info',
        }),
    )
}
```

#### **`.env.development`**

```console
GRAFANA_ORG_ID=2
REACT_APP_EDITOR=code
REACT_APP_ORCHESTRATOR_ROOT=/orchestrator
REACT_APP_PASSWORD=argocd-server-74b7b94945-nxxnh
```

### Development setup without proxy.

#### **`.env.development`**

```console
GRAFANA_ORG_ID=2
REACT_APP_EDITOR=code
REACT_APP_ORCHESTRATOR_ROOT=http://demo.devtron.info:32080/orchestrator
REACT_APP_PASSWORD=argocd-server-74b7b94945-nxxnh
```

## How do I make a contribution?

Never made an open source contribution before? Wondering how contributions work in our project? Here's a quick rundown!

-   Find an issue that you are interested in addressing or a feature that you would like to add.
-   Fork the repository https://github.com/devtron-labs/dashboard.git to your local GitHub organization. This means that you will have a copy of the repository under your-GitHub-username/repository-name.
-   Clone the repository to your local machine using
    `git clone https://github.com/github-username/dashboard.git.`
-   Create a new branch for your fix using `git checkout -b branch-name-here`.
-   Make the appropriate changes for the issue you are trying to address or the feature that you want to add.
-   Use `git add insert-paths-of-changed-files-here` to add the file contents of the changed files to the "snapshot" git uses to manage the state of the project, also known as the index.
-   Use `git commit -m ‘Insert a short message of the changes made here’` to store the contents of the index with a descriptive message.
-   Push the changes to the remote repository using `git push origin branch-name-here`.
-   Submit a pull request to the upstream repository.
-   Title the pull request with a short description of the changes made and the issue or bug number associated with your change. For example, you can title an issue like so "Added failsafe check to resolve #1423".
-   In the description of the pull request, explain the changes that you made, any issues you think exist with the pull request you made, and any questions you have for the maintainer. It's OK if your pull request is not perfect (no pull request is), the reviewer will be able to help you fix any problems and improve it!
-   Wait for the pull request to be reviewed by a maintainer.
-   Make changes to the pull request if the reviewing maintainer recommends them.
-   Celebrate your success after your pull request is merged!

## How do I run it locally?

First you need to have the backend project up and running and the dashboard repo cloned on your machine after that follow the below process:

-   Run yarn in the dashboard repo root
-   Open the project in your preferred IDE
-   Open the `setupProxy.js` file
-   Change the target URL of the orchestrator. Replace it with the URL of your orchestrator
-   Save the file
-   Run `npm run start`
-   Go to `localhost:3000`
-   Click Login as administrator
-   Provide Admin as username and password from Devtron BE
-   After login, you will be able to see the dashboard running on your local machine

## Code walkthrough/Project structure

We have a `src` folder at the root level which holds everything related to the dashboard

-   `src/assets` have all the image folders like logo, icons, gif etc. These folders have, the related files
-   `src/components` have all the components used in the project further divided into folder component specific folders. Specific component folders hold their local CSS file specific to that component, service file specific to that component, and some required child component.tsx as well
-   `src/config` has config files like constants, route, etc which holds all the constants, route path constants respectively
-   `src/css has` the common CSS files
-   `src/services` have the common services used across projects
