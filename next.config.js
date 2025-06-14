/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next.js 13+ uses App Router by default
    // No need to explicitly enable it

    // Disable the Pages Router completely
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,

    // Next.js automatically detects the src directory
    distDir: '.next',

    // Image configuration with added domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn-icons-png.flaticon.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
                port: '',
                pathname: '/**',
            },
        ],
    },

    // Fix for Node.js modules not found error
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Don't resolve Node.js modules on the client to prevent errors
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                http2: false,
                http: false,
                https: false,
                zlib: false,
                path: false,
                stream: false,
                crypto: false,
                os: false,
                util: false,
                assert: false,
                constants: false,
                child_process: false,
                dgram: false,
                dns: false,
                events: false,
                querystring: false,
                url: false,
                buffer: false,
                string_decoder: false,
                async_hooks: false,
            };
        }

        // Handle node: protocol imports
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};

        // Map node: protocol imports to their polyfills or empty modules
        const nodeBuiltins = [
            'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants',
            'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https',
            'module', 'net', 'os', 'path', 'punycode', 'process', 'querystring', 'readline',
            'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty', 'url',
            'util', 'vm', 'zlib'
        ];

        nodeBuiltins.forEach(builtin => {
            // Handle both with and without the node: prefix
            config.resolve.alias[`node:${builtin}`] = 'empty-module';
            if (!isServer) {
                config.resolve.alias[builtin] = 'empty-module';
            }
        });

        // Add a rule to resolve empty-module
        config.module = config.module || {};
        config.module.rules = config.module.rules || [];
        config.module.rules.push({
            test: /empty-module$/,
            use: {
                loader: 'val-loader',
                options: {
                    executableFile: require.resolve('./node-polyfill-empty.js')
                }
            }
        });

        return config;
    },
};

module.exports = nextConfig;
