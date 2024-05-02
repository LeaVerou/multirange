// import markdownIt from "markdown-it";
// import markdownItAttrs from "markdown-it-attrs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import * as filters from "./filters.js";

// let md = markdownIt({
// 	html: true,
// 	linkify: true,
// 	typographer: true,
// })
// .disable("code")
// .use(markdownItAttrs);

export default config => {
	let data = {
		"layout": "page.njk",
		"permalink": "{{ page.filePathStem | replace('README', '') | replace('index', '') }}/index.html",
	};

	for (let p in data) {
		config.addGlobalData(p, data[p]);
	}

	config.setDataDeepMerge(true);

	for (let f in filters) {
		config.addFilter(f, filters[f]);
	}

	// config.setLibrary("md", md);

	// config.addPairedShortcode("md", children => {
	// 	return md.render(children);
	// });

	return {
		markdownTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
		dir: {
			output: ".",
		},
	};
};
