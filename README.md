# Dashboard

<p align="start">
<a href="https://github.com/devtron-labs/devtron/releases"><img src="https://img.shields.io/github/v/release/devtron-labs/devtron"></a>
<a href="https://discord.gg/jsRG5qx2gp"><img src="https://img.shields.io/discord/687207715902193673?logo=discord&label=Discord&color=5865F2&logoColor=white" alt="Join Discord"></a>
</p>

This is the client side web app for [devtron](https://github.com/devtron-labs/devtron).
This web app is written in [React](https://react.dev/) frontend-library. Uses a typescript + vite for setup.

## How to run?

This project uses `pnpm` as package manager. To install all dependencies and initialize the project just run the command `pnpm install`.

To start a dev server run `pnpm start`.
The above command will start a dev vite server at [http://localhost:3000](http://localhost:3000).

By default the backend pointed to by this dev server will be [https://preview.devtron.ai](https://preview.devtron.ai).
Check out our amazing project at [https://preview.devtron.ai](https://preview.devtron.ai).

If you have a local devtron instance running through minikube/kind/microK8s, you can have that be your backend by changing the `TARGET_URL`
in `/apps/web/vite.config.mts` to that instance's url.

Check out `package.json` for more scripts.

### `commit process`

- We use husky to run compile and lint-staged before commit staged changes
- If husky finds any errors during either the compilation stage or linting stage, the attempt to commit will fail
- If you see fixable issues. You can run `pnpm -r lint-fix`. None auto-fixable issues will have to be resolved by you manually

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
-   Open the `vite.config.ts` file
-   Change the target URL of the orchestrator. Replace it with the URL of your orchestrator
-   Save the file
-   Run `yarn start`
-   Go to `localhost:3000`
-   Click Login as administrator
-   Provide Admin as username and password from Devtron BE
-   After login, you will be able to see the dashboard running on your local machine

## Code walkthrough/Project structure

This is a monorepo. Apps that run are located in `apps/` folder while supporting libraries are placed under `packages/`.
