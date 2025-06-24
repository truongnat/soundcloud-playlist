<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
        Terms of Service
      </h1>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        Please read these terms carefully before using our SoundCloud playlist downloader service.
      </p>
      <p class="text-sm text-gray-500 mt-4">
        Last updated: {{ lastUpdated }}
      </p>
    </div>

    <!-- Content -->
    <div class="prose prose-invert prose-lg max-w-none">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Acceptance of Terms</h2>
        <div class="space-y-4 text-gray-300">
          <p>By accessing and using SoundCloud Playlist Downloader ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>
          <p>If you do not agree to abide by the above, please do not use this service.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Service Description</h2>
        <div class="space-y-4 text-gray-300">
          <p>SoundCloud Playlist Downloader is a free online tool that allows users to:</p>
          <ul class="list-disc list-inside space-y-2">
            <li>Download publicly available SoundCloud tracks and playlists</li>
            <li>Convert audio files to MP3 format</li>
            <li>Organize and manage downloaded music</li>
            <li>Access tracks offline after download</li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Legal Use and Copyright</h2>
        <div class="space-y-4 text-gray-300">
          <div class="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-yellow-300 mb-2">⚠️ Important Copyright Notice</h3>
            <p class="text-yellow-200">You are responsible for ensuring you have the right to download any content. Only download tracks that are:</p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Available under Creative Commons licenses</li>
              <li>Explicitly marked as free to download</li>
              <li>Your own original content</li>
              <li>Content you have permission to download</li>
            </ul>
          </div>

          <h3 class="text-lg font-semibold text-gray-200">User Responsibilities</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>Respect copyright laws and intellectual property rights</li>
            <li>Only download content you have permission to access</li>
            <li>Do not redistribute downloaded content without proper authorization</li>
            <li>Use the service for personal, non-commercial purposes only</li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Prohibited Uses</h2>
        <div class="space-y-4 text-gray-300">
          <p>You may not use our service to:</p>
          <ul class="list-disc list-inside space-y-2">
            <li>Download copyrighted content without permission</li>
            <li>Violate any local, state, national, or international law</li>
            <li>Transmit or procure the sending of any advertising or promotional material</li>
            <li>Impersonate or attempt to impersonate the company, employees, or other users</li>
            <li>Use the service in any way that could damage, disable, or impair the service</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Use automated systems or software to extract data from the service</li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Service Availability</h2>
        <div class="space-y-4 text-gray-300">
          <h3 class="text-lg font-semibold text-gray-200">Service Uptime</h3>
          <p>We strive to maintain high service availability but cannot guarantee 100% uptime. The service may be temporarily unavailable due to:</p>
          <ul class="list-disc list-inside space-y-2">
            <li>Scheduled maintenance</li>
            <li>Technical issues</li>
            <li>Third-party service dependencies</li>
            <li>Force majeure events</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-200">Service Modifications</h3>
          <p>We reserve the right to modify, suspend, or discontinue the service at any time without prior notice.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">User Content and Data</h2>
        <div class="space-y-4 text-gray-300">
          <h3 class="text-lg font-semibold text-gray-200">Your Data</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>You retain ownership of any content you provide to the service</li>
            <li>We do not claim ownership of URLs or metadata you submit</li>
            <li>Downloaded files are stored locally on your device</li>
            <li>We may temporarily cache metadata for performance purposes</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-200">Data Processing</h3>
          <p>By using our service, you grant us permission to process the URLs and metadata necessary to provide the download functionality.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Disclaimers and Limitations</h2>
        <div class="space-y-4 text-gray-300">
          <h3 class="text-lg font-semibold text-gray-200">Service "As Is"</h3>
          <p>The service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties.</p>

          <h3 class="text-lg font-semibold text-gray-200">Limitation of Liability</h3>
          <p>In no event shall SoundCloud Playlist Downloader, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages.</p>

          <h3 class="text-lg font-semibold text-gray-200">Third-Party Content</h3>
          <p>We are not responsible for the content, accuracy, or availability of third-party services, including SoundCloud.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Privacy and Data Protection</h2>
        <div class="space-y-4 text-gray-300">
          <p>Your privacy is important to us. Please review our <NuxtLink to="/privacy" class="text-blue-400 hover:text-blue-300">Privacy Policy</NuxtLink> to understand how we collect, use, and protect your information.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Termination</h2>
        <div class="space-y-4 text-gray-300">
          <p>We may terminate or suspend your access to the service immediately, without prior notice, for any reason, including breach of these Terms.</p>
          <p>You may discontinue use of the service at any time.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Changes to Terms</h2>
        <div class="space-y-4 text-gray-300">
          <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page.</p>
          <p>Your continued use of the service after any changes constitutes acceptance of the new terms.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Governing Law</h2>
        <div class="space-y-4 text-gray-300">
          <p>These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl p-8 border border-green-500/30">
        <h2 class="text-2xl font-bold text-green-300 mb-4">Contact Information</h2>
        <div class="space-y-4 text-gray-300">
          <p>If you have any questions about these Terms of Service, please contact us:</p>
          <ul class="list-none space-y-2">
            <li><strong>Email:</strong> <a href="mailto:legal@soundcloud-playlist.netlify.app" class="text-blue-400 hover:text-blue-300">legal@soundcloud-playlist.netlify.app</a></li>
            <li><strong>Website:</strong> <a href="https://soundcloud-playlist.netlify.app" class="text-blue-400 hover:text-blue-300">https://soundcloud-playlist.netlify.app</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTermsSEO } from '@/composables/useSEO'

// SEO optimization using composable
useTermsSEO()

const lastUpdated = 'December 19, 2024'
</script>

<style scoped>
.prose {
  color: #e5e7eb;
}

.prose h2 {
  color: #86efac;
}

.prose h3 {
  color: #d1d5db;
}

.prose a {
  color: #60a5fa;
  text-decoration: none;
}

.prose a:hover {
  color: #93c5fd;
  text-decoration: underline;
}

.prose ul {
  color: #d1d5db;
}

.prose strong {
  color: #f3f4f6;
}
</style>