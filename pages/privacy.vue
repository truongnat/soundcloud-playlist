<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
        Privacy Policy
      </h1>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        Your privacy is important to us. Learn how we protect your data when using our SoundCloud downloader.
      </p>
      <p class="text-sm text-gray-500 mt-4">
        Last updated: {{ lastUpdated }}
      </p>
    </div>

    <!-- Content -->
    <div class="prose prose-invert prose-lg max-w-none">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Information We Collect</h2>
        <div class="space-y-4 text-gray-300">
          <h3 class="text-lg font-semibold text-gray-200">Information You Provide</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>SoundCloud URLs you submit for downloading</li>
            <li>Usage preferences and settings</li>
            <li>Feedback and support communications</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-200">Automatically Collected Information</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>Browser type and version</li>
            <li>Operating system information</li>
            <li>IP address (anonymized)</li>
            <li>Usage statistics and performance metrics</li>
            <li>Error logs for troubleshooting</li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">How We Use Your Information</h2>
        <div class="space-y-4 text-gray-300">
          <ul class="list-disc list-inside space-y-2">
            <li><strong>Service Provision:</strong> To process your download requests and provide our services</li>
            <li><strong>Performance Optimization:</strong> To improve download speeds and user experience</li>
            <li><strong>Technical Support:</strong> To troubleshoot issues and provide customer support</li>
            <li><strong>Service Improvement:</strong> To analyze usage patterns and enhance our features</li>
            <li><strong>Security:</strong> To protect against abuse and ensure service stability</li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Data Storage and Security</h2>
        <div class="space-y-4 text-gray-300">
          <h3 class="text-lg font-semibold text-gray-200">Local Processing</h3>
          <p>Most of our processing happens directly in your browser. Downloaded files are saved directly to your device and are not stored on our servers.</p>

          <h3 class="text-lg font-semibold text-gray-200">Temporary Data</h3>
          <p>We may temporarily cache metadata and thumbnails to improve performance. This data is automatically deleted within 24 hours.</p>

          <h3 class="text-lg font-semibold text-gray-200">Security Measures</h3>
          <ul class="list-disc list-inside space-y-2">
            <li>HTTPS encryption for all data transmission</li>
            <li>Regular security audits and updates</li>
            <li>Limited data retention policies</li>
            <li>No storage of personal identification information</li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Third-Party Services</h2>
        <div class="space-y-4 text-gray-300">
          <h3 class="text-lg font-semibold text-gray-200">SoundCloud API</h3>
          <p>We use SoundCloud's public API to fetch track information. Please refer to <a href="https://soundcloud.com/pages/privacy" class="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener">SoundCloud's Privacy Policy</a> for their data practices.</p>

          <h3 class="text-lg font-semibold text-gray-200">Analytics</h3>
          <p>We use privacy-focused analytics to understand usage patterns. No personal information is collected or shared with third parties.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Your Rights and Choices</h2>
        <div class="space-y-4 text-gray-300">
          <ul class="list-disc list-inside space-y-2">
            <li><strong>Data Access:</strong> Request information about data we have collected</li>
            <li><strong>Data Deletion:</strong> Request deletion of your data from our systems</li>
            <li><strong>Opt-Out:</strong> Disable analytics and tracking features</li>
            <li><strong>Browser Controls:</strong> Use browser settings to control cookies and local storage</li>
          </ul>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Cookies and Local Storage</h2>
        <div class="space-y-4 text-gray-300">
          <h3 class="text-lg font-semibold text-gray-200">Essential Cookies</h3>
          <p>We use essential cookies to maintain your session and preferences. These are necessary for the service to function.</p>

          <h3 class="text-lg font-semibold text-gray-200">Local Storage</h3>
          <p>We store your preferences and download history locally in your browser. This data never leaves your device unless you explicitly share it.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Children's Privacy</h2>
        <div class="space-y-4 text-gray-300">
          <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
        </div>
      </div>

      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-8">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Changes to This Policy</h2>
        <div class="space-y-4 text-gray-300">
          <p>We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/30">
        <h2 class="text-2xl font-bold text-blue-300 mb-4">Contact Us</h2>
        <div class="space-y-4 text-gray-300">
          <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
          <ul class="list-none space-y-2">
            <li><strong>Email:</strong> <a href="mailto:privacy@soundcloud-dl.com" class="text-blue-400 hover:text-blue-300">privacy@soundcloud-dl.com</a></li>
            <li><strong>Website:</strong> <a href="https://soundcloud-dl.com" class="text-blue-400 hover:text-blue-300">https://soundcloud-dl.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO optimization using composable
usePrivacySEO()

const lastUpdated = 'December 19, 2024'
</script>

<style scoped>
.prose {
  color: #e5e7eb;
}

.prose h2 {
  color: #93c5fd;
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