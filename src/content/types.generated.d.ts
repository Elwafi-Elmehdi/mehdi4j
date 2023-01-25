declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof typeof entryMap> =
		typeof entryMap[C][keyof typeof entryMap[C]] & Render;

	type BaseCollectionConfig<S extends import('astro/zod').ZodRawShape> = {
		schema?: S;
		slug?: (entry: {
			id: CollectionEntry<keyof typeof entryMap>['id'];
			defaultSlug: string;
			collection: string;
			body: string;
			data: import('astro/zod').infer<import('astro/zod').ZodObject<S>>;
		}) => string | Promise<string>;
	};
	export function defineCollection<S extends import('astro/zod').ZodRawShape>(
		input: BaseCollectionConfig<S>
	): BaseCollectionConfig<S>;

	export function getEntry<C extends keyof typeof entryMap, E extends keyof typeof entryMap[C]>(
		collection: C,
		entryKey: E
	): Promise<typeof entryMap[C][E] & Render>;
	export function getCollection<
		C extends keyof typeof entryMap,
		E extends keyof typeof entryMap[C]
	>(
		collection: C,
		filter?: (data: typeof entryMap[C][E]) => boolean
	): Promise<(typeof entryMap[C][E] & Render)[]>;

	type InferEntrySchema<C extends keyof typeof entryMap> = import('astro/zod').infer<
		import('astro/zod').ZodObject<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type Render = {
		render(): Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			injectedFrontmatter: Record<string, any>;
		}>;
	};

	const entryMap: {
		"post": {
"clear-terraform-cert.md": {
  id: "clear-terraform-cert.md",
  slug: "clear-terraform-cert",
  body: string,
  collection: "post",
  data: InferEntrySchema<"post">
},
"deploy-mariadb-server.md": {
  id: "deploy-mariadb-server.md",
  slug: "deploy-mariadb-server",
  body: string,
  collection: "post",
  data: InferEntrySchema<"post">
},
"terraform-cli-vs-cloud-workspaces.md": {
  id: "terraform-cli-vs-cloud-workspaces.md",
  slug: "terraform-cli-vs-cloud-workspaces",
  body: string,
  collection: "post",
  data: InferEntrySchema<"post">
},
"terraform-s3-backend-with-encryption-state-locking.md": {
  id: "terraform-s3-backend-with-encryption-state-locking.md",
  slug: "terraform-s3-backend-with-encryption-state-locking",
  body: string,
  collection: "post",
  data: InferEntrySchema<"post">
},
"terraform-your-proxmox.md": {
  id: "terraform-your-proxmox.md",
  slug: "terraform-your-proxmox",
  body: string,
  collection: "post",
  data: InferEntrySchema<"post">
},
},

	};

	type ContentConfig = typeof import("./config");
}
