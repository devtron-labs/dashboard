const fs = require('fs');

const ENV_FILE_PATH = '.env.secrets';
const DEVTRON_HOST = 'https://dev-staging.devtron.info';

// Function to read environment variables from .env.secrets file
const readEnvFile = () => {
    try {
        const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        return envVars;
    } catch (error) {
        console.error(`Error reading ${ENV_FILE_PATH}:`, error.message);
        return {};
    }
};

const writeIngressHostToEnv = async (token, namespace) => {
    const cookie = `argocd.token=${token}`;

    const ingressBody = {
        appId: "",
        clusterId: 1,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: "networking.k8s.io",
                    Version: "v1",
                    Kind: "Ingress"
                },
                namespace,
            }
        }
    };

    const { result: { data: [ingress] } } = await fetch(`${DEVTRON_HOST}/orchestrator/k8s/resource/list`, {
        "headers": {
            "cookie": cookie,
        },
        "body": JSON.stringify(ingressBody),
        "method": "POST"
    }).then(response => response.json());

    const ingressDetailBody = {
        appId: "",
        clusterId: 1,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: "networking.k8s.io",
                    Version: "v1",
                    Kind: "Ingress"
                },
                namespace,
                name: ingress.name
            }
        }
    };

    const { result: { manifestResponse: { manifest: { spec: { rules: [ { host } ] } } } }} = await fetch(`${DEVTRON_HOST}/orchestrator/k8s/resource`, {
        "headers": {
            "cookie": cookie,
        },
        "body": JSON.stringify(ingressDetailBody),
        "method": "POST"
    }).then(response => response.json());

    // Read existing .env file or create empty string if it doesn't exist
    let envContent = '';
    try {
        envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    } catch (error) {
        // File doesn't exist, will create it
    }

    // Check if VITE_TARGET_URL already exists and update or add it
    if (envContent.includes('VITE_TARGET_URL=')) {
        // Replace existing value
        envContent = envContent.replace(/VITE_TARGET_URL=.*$/m, `VITE_TARGET_URL=https://${host}`);
        console.log('VITE_TARGET_URL updated in .env.secrets file');
    } else {
        // Add new entry
        const newLine = envContent.length > 0 && !envContent.endsWith('\n') ? '\n' : '';
        envContent += `${newLine}VITE_TARGET_URL=https://${host}\n`;
        console.log('VITE_TARGET_URL added to .env.secrets file');
    }

    fs.writeFileSync(ENV_FILE_PATH, envContent);
};

const main = async () => {
    if (!process.argv[2]) {
        console.error('Please provide a namespace as an argument.');
        process.exit(1);
    }

    const namespace = process.argv[2];

    // Read token from .env.secrets file
    const envVars = readEnvFile();
    const token = envVars.DEV_STAGING_TOKEN;

    if (!token) {
        console.error('DEV_STAGING_TOKEN not found in .env.secrets file');
        process.exit(1);
    }

    const cookie = `argocd.token=${token}`

    const secretsBody = {
        appId: "",
        clusterId: 1,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: "",
                    Version: "v1",
                    Kind: "Secret"
                },
                namespace,
                name: "orchestrator-secret"
            }
        }
    }

    const { result: { manifestResponse: { manifest: { data: { ADMIN_PASSWORD } } } }} = await fetch(`${DEVTRON_HOST}/orchestrator/k8s/resource`, {
        "headers": {
            "cookie": cookie,
        },
        "body": JSON.stringify(secretsBody),
        "method": "POST"
    }).then(response => response.json());

    // Read existing .env file or create empty string if it doesn't exist
    let envContent = '';
    try {
        envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    } catch (error) {
        // File doesn't exist, will create it
    }

    // Decode the base64 encoded ADMIN_PASSWORD
    const decodedPassword = Buffer.from(ADMIN_PASSWORD, 'base64').toString('utf8');

    // Check if VITE_ADMIN_PASSWORD already exists and update or add it
    if (envContent.includes('VITE_ADMIN_PASSWORD=')) {
        // Replace existing value
        envContent = envContent.replace(/VITE_ADMIN_PASSWORD=.*$/m, `VITE_ADMIN_PASSWORD=${decodedPassword}`);
        console.log('VITE_ADMIN_PASSWORD updated in .env.secrets file');
    } else {
        // Add new entry
        const newLine = envContent.length > 0 && !envContent.endsWith('\n') ? '\n' : '';
        envContent += `${newLine}VITE_ADMIN_PASSWORD=${decodedPassword}\n`;
        console.log('VITE_ADMIN_PASSWORD added to .env.secrets file');
    }

    fs.writeFileSync(ENV_FILE_PATH, envContent);

    await writeIngressHostToEnv(token, namespace);
}

main()