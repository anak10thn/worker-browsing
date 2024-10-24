import * as cheerio from 'cheerio';

const removeUnwantedElements = (_cheerio) => {
	const elementsToRemove = [
		'footer',
		'header',
		'nav',
		'script',
		'style',
		'link',
		'meta',
		'noscript',
		'img',
		'picture',
		'video',
		'audio',
		'iframe',
		'object',
		'embed',
		'param',
		'track',
		'source',
		'canvas',
		'map',
		'area',
		'svg',
		'math',
	];

	elementsToRemove.forEach((element) => _cheerio(element).remove());
};

const fetchAndCleanContent = async (url) => {
	const response = await fetch(url);
	const html = await response.text();

	const $ = cheerio.load(html);
	const title = $('title').text();

	removeUnwantedElements($);
	const content = $.text().replace(/(\r\n|\r|\n|\n \n){2,}/g, '$1\n') || '';

	return {
		title,
		content,
		html: $.html() || '',
		url,
	};
};

export default {
	async fetch(request, env, ctx) {
		try {
			const url = new URL(request.url).searchParams.get('url');

			if (!url) {
				return new Response('Missing URL parameter', {
					status: 400,
				});
			}

			if (request.method !== 'GET') {
				return new Response('Method not allowed', {
					status: 405,
				});
			}

			const content = await fetchAndCleanContent(url);

			return new Response(JSON.stringify(content), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		} catch (error) {
			console.error('Error processing request:', error);
			return new Response(JSON.stringify({ error: 'Failed to process content' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	},
};