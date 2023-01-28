import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import remarkMermaid from 'astro-diagram/remark-mermaid';



// https://astro.build/config
export default defineConfig({
	site: "https://www.mehdi4j.online",
	experimental: {
		contentCollections: true,
	},
	markdown: {
		remarkPlugins: [
			// remarkGfm,

			remarkMermaid,

			// ...
		],
		shikiConfig: {
			theme: "dracula",
			wrap: true,
		},
	},
	integrations: [
		mdx({}),
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