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
- Now before commiting lint will run and check for errors.
- It will not allow to commit if there are lint errors.
- To fix them run `yarn lint-fix` (check package.json). It is not capable of fixing everything so some fixes has to be done manually.

### Do's
- Try to make only one state per page rest every thing shall be pure.
- A method should do one and only one thing.
- Do function and variable namings so good you don't need comments.
- While making smaller Components make them reusable.
- Do most of the heavy lifting tasks inside smaller components not in the state component.
- Do all the parsing and error handling on service state component should not get anything more than (success and data) or (error and data).
- Use BEM to name CSS classes and structure it.


### Don'ts
- Don't add if else on render add functions which render checks on smaller functions.
- Don't add IDs for CSS if done correctly you never need ids.
- Don't add unnecessary Indentations it doesn't improve readability.
- Never add checks on the basis of text.
- Don't use float use display instead, use display flex-box, inline, inline-block.
- Don't use mix type methods in a class

### Sentry Config
- SENTRY_AUTH_TOKEN=""
- SENTRY_ORG="devtron-labs"
- SENTRY_PROJECT="dashboard"
- DSN=""

### Sentry sourcemap upload
```console
foo@bar:~$ sh sentry.sh
```

### Set custom sentry environment during production deployment, default is staging
```console
foo@bar~$ docker run -p 3000:80 -e SENTRY_ENV=my-custom-env -t artifact/tag
```

### Disable sentry during production deployment, default enabled
```console
foo@bar~$ docker run -p 3000:80 -e SENTRY_ENABLED=false -t artifact/tag
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
``` js
const {createProxyMiddleware} = require('http-proxy-middleware')

module.exports = function(app){
    app.use("/orchestrator", createProxyMiddleware(
        { 
            target: 'http://demo.devtron.info:32080',
            changeOrigin: true,
            logLevel:   'info'
        }
    )) 
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
