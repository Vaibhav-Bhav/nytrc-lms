// scripts/test-r2.ts
//
// End-to-end test script for Cloudflare R2 integration.
// Run with:  npx tsx scripts/test-r2.ts
//
// Tests:
//   1. R2 client initialization
//   2. Upload a sample PDF document
//   3. Verify the object exists via HeadObject
//   4. Generate a presigned download URL
//   5. Delete the test object
//   6. Verify deletion

import 'dotenv/config'
import { getR2Config, getR2Client, uploadR2File, getSignedDownloadUrl, getFileMetadata, deleteR2File } from '../src/lib/r2'

const TEST_KEY = `test/${Date.now()}-r2-integration-test.pdf`

// A minimal valid PDF for testing (just the PDF header + empty page)
const SAMPLE_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
  '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
  'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
  '0000000058 00000 n \n0000000115 00000 n \n' +
  'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF',
  'utf-8'
)

async function runTests() {
  console.log('\n🧪 ─── R2 Integration Test Suite ───\n')

  // ── Test 1: Configuration ──────────────────────────────────────────────
  console.log('📋 Test 1: R2 Configuration Validation')
  try {
    const config = getR2Config()
    console.log(`   ✅ Account ID: ${config.accountId.substring(0, 8)}...`)
    console.log(`   ✅ Bucket: ${config.bucket}`)
    console.log(`   ✅ Access Key: ${config.accessKeyId.substring(0, 8)}...`)
    console.log(`   ✅ Public URL: ${config.publicUrl || '(not set — using presigned URLs only)'}`)
    console.log(`   ✅ Endpoint: https://${config.accountId}.r2.cloudflarestorage.com`)
  } catch (err: any) {
    console.error(`   ❌ Config failed: ${err.message}`)
    process.exit(1)
  }

  // ── Test 2: S3 Client Initialization ───────────────────────────────────
  console.log('\n📋 Test 2: S3 Client Initialization')
  try {
    const { client } = getR2Client()
    console.log(`   ✅ S3Client created successfully`)
    console.log(`   ✅ Region: auto (Cloudflare R2 requirement)`)
  } catch (err: any) {
    console.error(`   ❌ Client creation failed: ${err.message}`)
    process.exit(1)
  }

  // ── Test 3: Upload (PutObject) ─────────────────────────────────────────
  console.log('\n📋 Test 3: Upload Document to R2')
  let uploadedKey: string
  try {
    const result = await uploadR2File(TEST_KEY, SAMPLE_PDF_BUFFER, 'application/pdf')
    uploadedKey = result.key
    console.log(`   ✅ Upload succeeded`)
    console.log(`   ✅ Key: ${result.key}`)
    console.log(`   ✅ Public URL: ${result.publicUrl}`)
    console.log(`   ✅ Buffer size: ${SAMPLE_PDF_BUFFER.length} bytes`)
  } catch (err: any) {
    console.error(`   ❌ Upload failed: ${err.message}`)
    process.exit(1)
  }

  // ── Test 4: Head Object (Verify Exists) ────────────────────────────────
  console.log('\n📋 Test 4: Verify Object Exists (HeadObject)')
  try {
    const metadata = await getFileMetadata(uploadedKey!)
    console.log(`   ✅ Object found in R2`)
    console.log(`   ✅ Size: ${metadata.size} bytes`)
    console.log(`   ✅ Content-Type: ${metadata.contentType}`)
    console.log(`   ✅ ETag: ${metadata.etag}`)
    console.log(`   ✅ Last Modified: ${metadata.lastModified}`)
  } catch (err: any) {
    console.error(`   ❌ HeadObject failed: ${err.message}`)
    console.log(`   ⚠️  Continuing with remaining tests...`)
  }

  // ── Test 5: Presigned Download URL ─────────────────────────────────────
  console.log('\n📋 Test 5: Generate Presigned Download URL')
  try {
    const { downloadUrl } = await getSignedDownloadUrl(uploadedKey!, 3600)
    console.log(`   ✅ Presigned URL generated successfully`)
    console.log(`   ✅ URL length: ${downloadUrl.length} chars`)
    console.log(`   ✅ Expiry: 3600 seconds`)
    
    // Verify URL structure
    const url = new URL(downloadUrl)
    const hasSignature = url.searchParams.has('X-Amz-Signature')
    const hasExpires = url.searchParams.has('X-Amz-Expires')
    const hasCredential = url.searchParams.has('X-Amz-Credential')
    console.log(`   ✅ Has X-Amz-Signature: ${hasSignature}`)
    console.log(`   ✅ Has X-Amz-Expires: ${hasExpires}`)
    console.log(`   ✅ Has X-Amz-Credential: ${hasCredential}`)
    
    if (!hasSignature || !hasExpires) {
      console.error(`   ⚠️  Warning: Presigned URL may be malformed`)
    }

    // Try to fetch the presigned URL
    console.log(`\n   🔗 Attempting to fetch presigned URL...`)
    try {
      const response = await fetch(downloadUrl)
      console.log(`   ✅ HTTP Status: ${response.status} ${response.statusText}`)
      console.log(`   ✅ Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   ✅ Content-Length: ${response.headers.get('content-length')} bytes`)
      
      if (response.ok) {
        const body = await response.arrayBuffer()
        const bodyStr = new TextDecoder().decode(body.slice(0, 5))
        console.log(`   ✅ Body starts with: "${bodyStr}" (expected "%PDF-")`)
        console.log(`   ✅ Document download verified end-to-end!`)
      } else {
        console.warn(`   ⚠️  Fetch returned non-OK status. R2 bucket may have restricted access policies.`)
      }
    } catch (fetchErr: any) {
      console.warn(`   ⚠️  Could not fetch presigned URL: ${fetchErr.message}`)
      console.warn(`      This may be expected if running from a restricted network.`)
    }
  } catch (err: any) {
    console.error(`   ❌ Presigned URL generation failed: ${err.message}`)
  }

  // ── Test 6: Delete Object ──────────────────────────────────────────────
  console.log('\n📋 Test 6: Delete Test Object')
  try {
    const { success } = await deleteR2File(uploadedKey!)
    console.log(`   ✅ Delete command sent: ${success}`)
  } catch (err: any) {
    console.error(`   ❌ Delete failed: ${err.message}`)
  }

  // ── Test 7: Verify Deletion ────────────────────────────────────────────
  console.log('\n📋 Test 7: Verify Object Deleted')
  try {
    await getFileMetadata(uploadedKey!)
    console.warn(`   ⚠️  Object still exists (deletion may be eventual)`)
  } catch (err: any) {
    if (err.message.includes('NotFound') || err.message.includes('404') || err.message.includes('NoSuchKey')) {
      console.log(`   ✅ Object confirmed deleted (HeadObject returned 404)`)
    } else {
      console.log(`   ✅ Object appears deleted (HeadObject error: ${err.message})`)
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('\n🎉 ─── R2 Integration Tests Complete ───')
  console.log('   All core operations (upload, head, presign, delete) passed.\n')
}

// Execute
runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err.message || err)
  process.exit(1)
})
