import path from 'node:path';
import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

const isDev = process.env.NODE_ENV !== 'production';
let inlineEditPlugin, editModeDevPlugin;

if (isDev) {
	inlineEditPlugin = (await import('./plugins/visual-editor/vite-plugin-react-inline-editor.js')).default;
	editModeDevPlugin = (await import('./plugins/visual-editor/vite-plugin-edit-mode.js')).default;
}

// Origenes permitidos para postMessage al editor Horizons. Evita '*' para no
// filtrar errores/runtime a cualquier ventana que embeba este dev server.
const HORIZONS_ALLOWED_ORIGINS = [
	'https://horizons.hostinger.com',
	'https://horizons.hostinger.dev',
	'https://horizons-frontend-local.hostinger.dev',
	'http://localhost:4000',
];
const HORIZONS_ALLOWED_ORIGINS_JSON = JSON.stringify(HORIZONS_ALLOWED_ORIGINS);

// Exponemos los helpers en `window` porque cada <script type="module"> tiene
// scope propio: sin esto, los otros modulos inyectados (error overlay, fetch
// monkey-patch, etc.) no ven `postToHorizonsParent` y lanzan ReferenceError
// desde dentro del `console.error`, lo que rechaza la promesa del fetch
// (p. ej. rompe el flujo de errores 4xx de supabase-js).
const horizonsPostMessageHelpers = `
const HORIZONS_ALLOWED_ORIGINS = new Set(${HORIZONS_ALLOWED_ORIGINS_JSON});
window.__horizonsGetParentOrigin = function getHorizonsParentOrigin() {
	if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
		const o = window.location.ancestorOrigins[0];
		if (HORIZONS_ALLOWED_ORIGINS.has(o)) return o;
	}
	if (document.referrer) {
		try {
			const o = new URL(document.referrer).origin;
			if (HORIZONS_ALLOWED_ORIGINS.has(o)) return o;
		} catch (_) {}
	}
	return null;
};
window.postToHorizonsParent = function postToHorizonsParent(payload) {
	const origin = window.__horizonsGetParentOrigin();
	if (!origin) return;
	try { window.parent.postMessage(payload, origin); } catch (_) {}
};
`;

const configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		postToHorizonsParent({
			type: 'horizons-vite-error',
			error,
		});
	}
}
`;

const configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
	const errorDetails = errorObj ? JSON.stringify({
		name: errorObj.name,
		message: errorObj.message,
		stack: errorObj.stack,
		source,
		lineno,
		colno,
	}) : null;

	postToHorizonsParent({
		type: 'horizons-runtime-error',
		message,
		error: errorDetails
	});
};
`;

const configHorizonsConsoleErrroHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
	}

	postToHorizonsParent({
		type: 'horizons-console-error',
		error: errorString
	});
};
`;

const configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/\.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;

const addTransformIndexHtml = {
	name: 'add-transform-index-html',
	apply: 'serve',
	transformIndexHtml(html) {
		return {
			html,
			tags: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: horizonsPostMessageHelpers,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsRuntimeErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsViteErrorHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configHorizonsConsoleErrroHandler,
					injectTo: 'head',
				},
				{
					tag: 'script',
					attrs: { type: 'module' },
					children: configWindowFetchMonkeyPatch,
					injectTo: 'head',
				},
			],
		};
	},
};

console.warn = () => { };

const logger = createLogger()
const loggerError = logger.error

logger.error = (msg, options) => {
	if (options?.error?.toString().includes('CssSyntaxError: [postcss]')) {
		return;
	}

	loggerError(msg, options);
}

export default defineConfig({
	customLogger: logger,
	plugins: [
		...(isDev ? [inlineEditPlugin(), editModeDevPlugin()] : []),
		react(),
		addTransformIndexHtml
	],
	server: {
		// Dev: acceso limitado a localhost + hosts Horizons. Para abrir a otros,
		// definir VITE_DEV_ALLOWED_HOSTS="host1,host2" antes de `npm run dev`.
		cors: { origin: [
			'http://localhost:4000',
			'http://localhost:5173',
			'https://horizons.hostinger.com',
			'https://horizons.hostinger.dev',
			'https://horizons-frontend-local.hostinger.dev',
		] },
		headers: {
			'Cross-Origin-Embedder-Policy': 'unsafe-none',
		},
		allowedHosts: [
			'localhost',
			'127.0.0.1',
			'.hostinger.com',
			'.hostinger.dev',
			...((process.env.VITE_DEV_ALLOWED_HOSTS || '').split(',').filter(Boolean)),
		],
	},
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json',],
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
		dedupe: ['react', 'react-dom', 'three'],
	},
	build: {
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			external: [
				'@babel/parser',
				'@babel/traverse',
				'@babel/generator',
				'@babel/types'
			],
			output: {
				manualChunks(id) {
					if (!id.includes('node_modules')) {
						return undefined;
					}
					// 3D / Three.js stack — usado solo por sistema-solar, célula-animal/vegetal, visualizador-3d
					if (id.includes('three') || id.includes('@react-three')) {
						return 'three';
					}
					// LLM on-device (muy grande y solo usado en algunas apps)
					if (id.includes('@mlc-ai/web-llm')) {
						return 'webllm';
					}
					// Motor de física (matter-js)
					if (id.includes('matter-js')) {
						return 'matter';
					}
					// Animaciones y confetti
					if (id.includes('framer-motion') || id.includes('confetti')) {
						return 'animations';
					}
					// Supabase
					if (id.includes('@supabase')) {
						return 'supabase';
					}
					// React + React DOM + Router + Radix + iconos + resto de node_modules
					// Todo junto en un solo chunk para evitar dependencias circulares
					return 'vendor';
				}
			}
		}
	}
});