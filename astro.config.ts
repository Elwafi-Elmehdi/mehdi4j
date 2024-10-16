import { defineConfig } from "astro/config";
// import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";


// https://astro.build/config
export default defineConfig({
	site: "https://mehdij4.com",
	experimental: {
		contentCollections: true,
	},
	markdown: {
		shikiConfig: {
			theme: "dracula",
			wrap: true,
		},
	},
	integrations: [
		// mdx({}),
		tailwind({
			config: {
				applyBaseStyles: false,
			},
		}),
		image({
			serviceEntryPoint: "@astrojs/image/sharp",
		}),
		sitemap(),
		prefetch(),
	],
});
// import { defineConfig } from 'astro/config';
// import netlify from '@astrojs/netlify/functions';
// export default defineConfig({
// 	output: 'server',
// 	adapter: netlify()
// });