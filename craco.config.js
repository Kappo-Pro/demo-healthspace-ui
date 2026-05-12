const CracoEsbuildPlugin = require('craco-esbuild')
// const CracoAntDesignPlugin = require('craco-antd') // Removed: Not compatible with antd v5
const { CracoAliasPlugin } = require('react-app-alias')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { InjectManifest } = require('workbox-webpack-plugin')
const webpack = require("webpack");
const path = require('path');

module.exports = {
	eslint: {
		enable: false,
	},
	typescript: {
		enableTypeChecking: false,
	},
	jest: {
		configure: {
			moduleNameMapper: {
				'^@test-utils$': '<rootDir>/src/test-utils',
				'^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
				'^@strapi$': '<rootDir>/src/Strapi.ts',
			},
			transformIgnorePatterns: [
				'node_modules/(?!(axios|uuid|jsonwebtoken)/)',
			],
			coveragePathIgnorePatterns: [
				'/node_modules/',
				'/deprecated/',
			],
		},
	},
	style: {
		postcss: {
			loaderOptions: (postcssLoaderOptions) => {
				// Define path alias mappings (from tsconfig.json)
				const pathAliases = {
					'@atoms': path.resolve(__dirname, 'src/components/atoms'),
					'@molecules': path.resolve(__dirname, 'src/components/molecules'),
					'@organisms': path.resolve(__dirname, 'src/components/organisms'),
					'@pages': path.resolve(__dirname, 'src/components/pages'),
					'@templates': path.resolve(__dirname, 'src/components/templates'),
					'@vitalflow-icons': path.resolve(__dirname, 'src/icons'),
					'@controller': path.resolve(__dirname, 'src/poseestimator/controller'),
					'@assets': path.resolve(__dirname, 'src/poseestimator/assets'),
					'@performance': path.resolve(__dirname, 'src/poseestimator/performance'),
					'@rom': path.resolve(__dirname, 'src/poseestimator/rom'),
					'@rehab': path.resolve(__dirname, 'src/poseestimator/rehab'),
					'@services': path.resolve(__dirname, 'src/services'),
					'@stores': path.resolve(__dirname, 'src/stores'),
					'@screens': path.resolve(__dirname, 'src/screens'),
					'@common': path.resolve(__dirname, 'src/common'),
					'@utils': path.resolve(__dirname, 'src/utils'),
					'@routers': path.resolve(__dirname, 'src/routers'),
					'@hooks': path.resolve(__dirname, 'src/hooks'),
					'@contexts': path.resolve(__dirname, 'src/contexts'),
					'@constants': path.resolve(__dirname, 'src/constants'),
					'@styles': path.resolve(__dirname, 'src/styles'),
					'@config': path.resolve(__dirname, 'src/config'),
					'@components': path.resolve(__dirname, 'src/components'),
					'@providers': path.resolve(__dirname, 'src/providers'),
					'@types': path.resolve(__dirname, 'src/types'),
					'@sdk': path.resolve(__dirname, 'src/sdk'),
					'@demo': path.resolve(__dirname, 'src/demo'),
				};

				// Custom resolver for postcss-import to handle path aliases
				const resolveAlias = (id, basedir) => {
					// Check if the import starts with any of our aliases
					for (const [alias, aliasPath] of Object.entries(pathAliases)) {
						if (id.startsWith(alias + '/')) {
							// Replace alias with actual path
							const relativePath = id.substring(alias.length + 1);
							return path.resolve(aliasPath, relativePath);
						}
					}
					// Return original id if no alias match (let postcss-import handle it normally)
					return id;
				};

        postcssLoaderOptions.postcssOptions.plugins = [
          require('postcss-import')({
						resolve: resolveAlias,
					}),
          require('tailwindcss/nesting'),
          require('tailwindcss')('./tailwind/tailwind.config.js'),
        ];

        return postcssLoaderOptions;
      },
		},
	},
	plugins: [
		{
			plugin: CracoEsbuildPlugin,
			options: {
				esbuildLoaderOptions: {
					loader: 'tsx',
					target: 'es2022',
				},
				esbuildMinimizerOptions: {
					target: 'es2022',
					css: true,
				},
				esbuildJestOptions: {
					loaders: {
						'.ts': 'ts',
						'.tsx': 'tsx',
						'.js': 'js',
						'.json': 'json',
					},
				},
			},
		},
		// Removed CracoAntDesignPlugin - not compatible with antd v5
		{
			plugin: CracoAliasPlugin,
		},
	],
	webpack: {
		plugins: {
			add: [
				new CopyWebpackPlugin({
					patterns: [
						{
							from: 'node_modules/@mediapipe/holistic',
							to: 'holistic'
						},
						{
							from: 'node_modules/@mediapipe/pose',
							to: 'pose'
						},
						{
							from: 'node_modules/@tensorflow/tfjs-backend-wasm/dist/*.wasm',
							to: 'static/js/[name][ext]'
						}
					]
				}),
				new webpack.DefinePlugin({
          process: { browser: {} },
        }),
				// Bundle analyzer - only in analyze mode
				...(process.env.ANALYZE === 'true' ? [
					new BundleAnalyzerPlugin({
						analyzerMode: 'static',
						reportFilename: '../bundle-analyzer-report.html',
						openAnalyzer: false,
						generateStatsFile: true,
						statsFilename: '../bundle-stats.json',
					})
				] : []),
				// Service Worker for offline support (Story 4.3: AC5)
				// Disabled temporarily - causing build issues with Workbox InjectManifest
				// TODO: Re-enable after investigating Workbox + esbuild compatibility
				// ...(process.env.NODE_ENV === 'production' ? [
				// 	new InjectManifest({
				// 		swSrc: path.resolve(__dirname, 'src/service-worker.js'),
				// 		swDest: 'service-worker.js',
				// 		exclude: [
				// 			/\.map$/,
				// 			/\.wasm$/,
				// 			/\.chunk\.js$/,
				// 			/^manifest.*\.js$/,
				// 		],
				// 		maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
				// 		compileSrc: true,
				// 	})
				// ] : []),
			]
		},
		configure: (webpackConfig, { env }) => {
			// Web Worker support: Use 'self' instead of 'window' for workers
			webpackConfig.output.globalObject = 'self';

			// Disable source maps in production to prevent conflicts with Workbox
			// Workbox InjectManifest creates its own compilation and source maps can conflict
			if (process.env.NODE_ENV === 'production') {
				webpackConfig.devtool = false;
			}

			// Ignore warnings from node_modules
			webpackConfig.ignoreWarnings = [
				function ignoreSourcemapsloaderWarnings(warning) {
					return (
						warning.module &&
						warning.module.resource.includes("node_modules")
					);
				},
			];

			// Remove React Refresh plugin for Web Worker compatibility
			// Trade-off: Full page reloads instead of Fast Refresh in development
			// Benefit: Workers can use ES modules without runtime conflicts
			// Context: React Refresh injects runtime code that conflicts with ES module workers
			//          Exclusion patterns failed to prevent this, so complete removal is needed
			if (env === 'development') {
				webpackConfig.plugins = webpackConfig.plugins.filter(
					plugin => plugin.constructor.name !== 'ReactRefreshPlugin'
				);
				console.log('[CRACO] React Refresh disabled for Web Worker compatibility');
			}

			// Exclude service worker from main webpack compilation
			// It will be handled by Workbox InjectManifest plugin
			if (process.env.NODE_ENV === 'production') {
				const serviceWorkerPath = path.resolve(__dirname, 'src/service-worker.js');

				// Exclude service worker from webpack entry points
				if (webpackConfig.entry) {
					// Ensure service worker is not included in any entry points
					const originalEntry = webpackConfig.entry;
					if (Array.isArray(originalEntry)) {
						webpackConfig.entry = originalEntry.filter(e => !e.includes('service-worker'));
					} else if (typeof originalEntry === 'object') {
						Object.keys(originalEntry).forEach(key => {
							if (Array.isArray(originalEntry[key])) {
								originalEntry[key] = originalEntry[key].filter(e => !e.includes('service-worker'));
							}
						});
					}
				}

				// Add exclude rule for service worker to prevent double compilation
				const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
				if (oneOfRule && oneOfRule.oneOf) {
					oneOfRule.oneOf.forEach(rule => {
						// Only add exclusion to JavaScript file loaders
						if (rule.test && rule.test.toString().includes('jsx?')) {
							if (!rule.exclude) {
								rule.exclude = [];
							}
							if (Array.isArray(rule.exclude)) {
								rule.exclude.push(serviceWorkerPath);
							} else {
								rule.exclude = [rule.exclude, serviceWorkerPath];
							}
						}
					});
				}
			}

			// Resolve configuration
			webpackConfig.resolve = {
				...webpackConfig.resolve,
				alias: {
					...webpackConfig.resolve.alias,
					'@sdk': path.resolve(__dirname, 'src/sdk'),
					'@demo': path.resolve(__dirname, 'src/demo'),
					'@workers': path.resolve(__dirname, 'src/workers'),
				},
				fallback: {
					fs: false,
					tls: false,
					net: false,
					path: false,
					zlib: false,
					http: false,
					https: false,
					stream: false,
					crypto: false,
					buffer: false,
				},
			};

			// Enable Web Worker support (Webpack 5 native)
			// Workers can be imported using: new Worker(new URL('./worker.ts', import.meta.url))
			// No additional loader needed - Webpack 5 handles this automatically
			if (!webpackConfig.module.parser) {
				webpackConfig.module.parser = {};
			}
			webpackConfig.module.parser.javascript = {
				...webpackConfig.module.parser.javascript,
				worker: ['Worker', 'SharedWorker', 'ServiceWorker'],
			};

			// Disable worker chunk loading in development to prevent importScripts() injection
			// ES module workers don't support importScripts() for code splitting
			if (env === 'development') {
				webpackConfig.output.workerChunkLoading = false;
			}

			// Optimize bundle splitting (Story 4.3: Advanced Code Splitting)
			// Preserve CRA's default splitChunks but enhance it
			if (webpackConfig.optimization && webpackConfig.optimization.splitChunks) {
				const defaultCacheGroups = webpackConfig.optimization.splitChunks.cacheGroups || {};

				webpackConfig.optimization.splitChunks = {
					...webpackConfig.optimization.splitChunks,
					chunks: 'all',
					maxInitialRequests: 25,
					maxAsyncRequests: 30,
					minSize: 20000,
					cacheGroups: {
						...defaultCacheGroups,
						// Override/add specific vendor bundles
						antd: {
							test: /[\\/]node_modules[\\/]antd[\\/]/,
							name: 'vendor-antd',
							priority: 40,
							reuseExistingChunk: true,
						},
						tensorflow: {
							test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
							name: 'vendor-tensorflow',
							priority: 40,
							reuseExistingChunk: true,
						},
						mediapipe: {
							test: /[\\/]node_modules[\\/]@mediapipe[\\/]/,
							name: 'vendor-mediapipe',
							priority: 40,
							reuseExistingChunk: true,
						},
						reactVendor: {
							test: /[\\/]node_modules[\\/](react|react-dom|react-redux|@reduxjs)[\\/]/,
							name: 'vendor-react',
							priority: 30,
							reuseExistingChunk: true,
						},
					},
				};
			}

			return webpackConfig;
		}
	},
	devServer: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			// Changed from 'require-corp' to 'credentialless' to allow Azure CDN images
			// 'credentialless' enables cross-origin isolation without requiring CORP headers
			'Cross-Origin-Embedder-Policy': 'credentialless'
		},
		onBeforeSetupMiddleware: (devServer) => {
			if (!devServer) {
				throw new Error('webpack-dev-server is not defined');
			}
			devServer.app.get('*.wasm', (req, res, next) => {
				res.setHeader('Content-Type', 'application/wasm');
				next();
			});
		}
	}
}
