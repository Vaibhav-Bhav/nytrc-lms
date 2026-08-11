// scripts/test-bunny.ts
import 'dotenv/config'
import { getBunnyConfig, createBunnyVideo, uploadBunnyVideo, getBunnyVideo, deleteBunnyVideo, generateSignedPlaybackUrl } from '../src/lib/bunny'

async function runTests() {
  console.log('\n🧪 ─── Bunny Stream Integration Test Suite ───\n')

  console.log('📋 Test 1: Configuration Validation')
  let config;
  try {
    config = getBunnyConfig()
    console.log(`   ✅ API Key: ${config.apiKey.substring(0, 8)}...`)
    console.log(`   ✅ Library ID: ${config.libraryId}`)
    console.log(`   ✅ Stream Hostname: ${config.streamHostname}`)
    console.log(`   ✅ Token Key: ${config.tokenKey ? config.tokenKey.substring(0, 8) + '...' : '(not set)'}`)
  } catch (err: any) {
    console.error(`   ❌ Config failed: ${err.message}`)
    process.exit(1)
  }

  console.log('\n📋 Test 2: Fetching video library details / video list')
  try {
    const url = `https://video.bunnycdn.com/library/${config.libraryId}/videos?page=1&itemsPerPage=5`
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        AccessKey: config.apiKey,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      throw new Error(`API error (${res.status}): ${res.statusText}`)
    }
    const data = await res.json()
    console.log(`   ✅ Successfully fetched video list`)
    console.log(`   ✅ Total items: ${data.totalItems}`)
    console.log(`   ✅ Videos in current page: ${data.items.length}`)
  } catch (err: any) {
    console.error(`   ❌ Failed to fetch video list: ${err.message}`)
    process.exit(1)
  }

  console.log('\n📋 Test 3: Creating a video placeholder')
  let videoId: string;
  try {
    const result = await createBunnyVideo({ title: 'Integration Test Video' })
    videoId = result.videoId
    console.log(`   ✅ Video placeholder created`)
    console.log(`   ✅ Video ID: ${videoId}`)
  } catch (err: any) {
    console.error(`   ❌ Failed to create video: ${err.message}`)
    process.exit(1)
  }

  console.log('\n📋 Test 4: Uploading video data')
  try {
    // 1-byte dummy buffer to test the upload endpoint
    const dummyVideoData = Buffer.from([0x00])
    const uploadResult = await uploadBunnyVideo(videoId, dummyVideoData)
    console.log(`   ✅ Video data uploaded: ${uploadResult.success}`)
  } catch (err: any) {
    console.error(`   ❌ Failed to upload video data: ${err.message}`)
    process.exit(1)
  }

  console.log('\n📋 Test 5: Fetching video metadata')
  try {
    const metadata = await getBunnyVideo(videoId)
    console.log(`   ✅ Video metadata fetched`)
    console.log(`   ✅ Title: ${metadata.title}`)
    console.log(`   ✅ Status: ${metadata.status}`)
  } catch (err: any) {
    console.error(`   ❌ Failed to fetch video metadata: ${err.message}`)
  }

  console.log('\n📋 Test 6: Generating secure SHA256 signed embed token URL')
  try {
    const { streamUrl, isSigned } = generateSignedPlaybackUrl(videoId, 3600)
    console.log(`   ✅ Signed URL generated: ${isSigned}`)
    console.log(`   ✅ URL: ${streamUrl}`)
    
    const urlObj = new URL(streamUrl)
    console.log(`   ✅ Token parameter exists: ${urlObj.searchParams.has('token')}`)
    console.log(`   ✅ Expires parameter exists: ${urlObj.searchParams.has('expires')}`)
  } catch (err: any) {
    console.error(`   ❌ Failed to generate signed URL: ${err.message}`)
  }

  console.log('\n📋 Test 7: Cleaning up (Deleting video)')
  try {
    const delResult = await deleteBunnyVideo(videoId)
    console.log(`   ✅ Video deleted successfully: ${delResult.success}`)
  } catch (err: any) {
    console.error(`   ❌ Failed to delete video: ${err.message}`)
  }

  console.log('\n🎉 ─── Bunny Stream Integration Tests Complete ───\n')
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err.message || err)
  process.exit(1)
})
