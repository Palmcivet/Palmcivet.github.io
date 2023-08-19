import { defineUserConfig, viteBundler } from 'vuepress';
import { anchorPlugin } from '@vuepress/markdown';
import { PalmcivetTheme } from 'vuepress-theme-palmcivet';
import type { PalmcivetThemeOptions } from 'vuepress-theme-palmcivet';

export default defineUserConfig({
  base: '/',
  lang: 'zh-CN',
  title: '方寸天地',
  description: '方寸天地，心怀寰宇',
  dest: 'dist',
  head: [
    [
      'link',
      { rel: 'icon', type: 'image/ico', sizes: '16x16', href: `/favicons/16x16.ico` },
    ],
    [
      'link',
      { rel: 'icon', type: 'image/ico', sizes: '32x32', href: `/favicons/32x32.ico` },
    ],
    [
      'link',
      { rel: 'icon', type: 'image/ico', sizes: '48x48', href: `/favicons/48x48.ico` },
    ],
  ],
  locales: {},
  theme: PalmcivetTheme({
    logo: '/logo.png',
    profile: {
      owner: 'Palm Civet',
      avatar: '/avatar.png',
      motto: '曾梦想仗剑走天涯，后来因为满课就没有去。',
      introduction: '全沾工程师。',
      repository: '//github.com/palmcivet/vuepress-theme-palmcivet/',
      social: {
        qq: {
          id: '2143899558',
          name: 'Palm Civet',
        },
        email: {
          id: 'palmcivet_email#qq.com',
          name: 'palmcivet_email#qq.com',
        },
        github: {
          id: 'palmcivet',
          name: 'Palm Civet',
        },
        zhihu: {
          id: 'P3lm_C1vet',
          name: 'Palm Civet',
        },
      },
    },
    footer: {
      sinceFrom: '2019',
    },
    status: {
      statisticsProvider: 'busuanzi',
      showSitePv: true,
      showSiteUv: true,
      showPv: true,
    },
    banner: {
      cover: {
        source: ['https://api.dujin.org/bing/1920.php'],
      },
    },
    plugins: {
      mediumZoom: {
        delay: 0,
        zoomOptions: {
          margin: 80,
        },
      },
      icon: {
        iconName: 'carbon',
        iconPath: 'carbon-icons-v7.0.7.svg',
      },
      highlight: {
        processor: 'shiki',
        theme: 'material-theme-lighter',
        darkTheme: 'material-theme-palenight',
      },
      pinyin: {},
      resolve: {
        pageTailor(page) {
          return {
            date: page.date,
            links: page.links,
            pathLocale: page.pathLocale,
            permalink: page.permalink,
            slug: page.slug,
            key: page.key,
            path: page.path,
            title: page.title,
            frontmatter: page.frontmatter,
          };
        },
        menu: [
          {
            icon: 'ri:home-8-line',
            url: '/home',
            locales: {
              '/zh/': {
                label: '首页',
              },
              '/en/': {
                label: 'Home',
              },
            },
            type: 'path',
            layout: 'Home',
            pagination: true,
            pageSorter(prev, next) {
              if (prev.frontmatter.pin && !next.frontmatter.pin) return -1;
              if (!prev.frontmatter.pin && next.frontmatter.pin) return 1;

              if (!next.frontmatter.date) return 1;
              if (!prev.frontmatter.date) return -1;

              return (
                new Date(next.frontmatter.date).getTime() -
                new Date(prev.frontmatter.date).getTime()
              );
            },
          },
          {
            icon: 'ri:price-tag-3-line',
            url: '/tags',
            locales: {
              '/zh/': {
                label: '标签',
              },
              '/en/': {
                label: 'Tags',
              },
            },
            type: 'path',
            layout: 'Tags',
            classifier(page) {
              const { tags } = page.frontmatter;
              return tags && Array.isArray(tags) ? (tags as Array<string>) : [];
            },
          },
          {
            icon: 'ri:footprint-line',
            url: '/timeline',
            locales: {
              '/zh/': {
                label: '时间轴',
              },
              '/en/': {
                label: 'Timeline',
              },
            },
            type: 'path',
            layout: 'Timeline',
          },
          {
            icon: 'ri:link',
            url: '/links',
            locales: {
              '/zh/': {
                label: '链接',
              },
              '/en/': {
                label: 'Links',
              },
            },
            type: 'path',
            layout: 'Links',
          },
          {
            icon: 'ri:body-scan-line',
            url: '/about',
            locales: {
              '/zh/': {
                label: '关于',
              },
              '/en/': {
                label: 'About',
              },
            },
            layout: 'About',
            type: 'path',
          },
        ],
      },
      copyright: {
        author: 'Palm Civet',
        canonical: 'https://palmcivet.tech',
      },
      feed: {
        hostname: 'https://palmcivet.tech',
        atom: true,
        rss: true,
        json: true,
      },
      seo: {
        hostname: 'https://palmcivet.tech',
      },
      sitemap: {
        hostname: 'https://palmcivet.tech',
      },
      readingTime: {},
      copyCode: {
        selector: '.palmcivet-renderer [class^=language] pre code',
      },
      mdEnhance: {
        tabs: true,
        attrs: true,
        footnote: true,
        figure: true,
        imgLazyload: true,
        imgMark: true,
        imgSize: true,
        container: true,
        tasklist: true,
      },
    },
  } as PalmcivetThemeOptions),
  markdown: {
    headers: {
      level: [2, 3, 4, 5, 6],
    },
    toc: {
      level: [2, 3, 4, 5, 6],
    },
    anchor: {
      permalink: anchorPlugin.permalink.ariaHidden({
        class: 'header-anchor',
        symbol: '¶',
        space: true,
        placement: 'before',
      }),
    },
  },
  bundler: viteBundler({
    viteOptions: {
      server: {
        port: 9090,
      },
    },
  }),
  extendsPage(page) {
    const { categories, toc, top, img, summary, ...others } = page.frontmatter;

    page.frontmatter = others;
    page.frontmatter.pin = top as boolean;
    page.frontmatter.cover = img as string;
    page.frontmatter.description = summary as string;
  },
});
