export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://soundcloud-playlist.netlify.app'

  // Define all the URLs for the sitemap
  const urls = [
    {
      loc: siteUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
      images: [
        {
          loc: `${siteUrl}/og-image.png`,
          title: 'SoundCloud Playlist Downloader',
          caption: 'Free SoundCloud playlist downloader tool'
        }
      ]
    },
    {
      loc: `${siteUrl}/track`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
      images: [
        {
          loc: `${siteUrl}/track-download-preview.png`,
          title: 'Track Download Interface',
          caption: 'Download individual SoundCloud tracks'
        }
      ]
    },
    {
      loc: `${siteUrl}/privacy`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.3
    },
    {
      loc: `${siteUrl}/terms`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.3
    }
  ]

  return urls
})