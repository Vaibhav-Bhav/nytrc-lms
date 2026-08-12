// src/lib/r2.ts
//
// Reusable Cloudflare R2 S3-compatible storage integration layer.
// Uses official AWS S3 v4 client and presigner for Cloudflare R2.
//

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value.trim()
}

/**
 * Resolves and validates Cloudflare R2 configuration at runtime.
 * Throws configuration errors if required variables are missing.
 */
export function getR2Config() {
  const accountId = getRequiredEnv('R2_ACCOUNT_ID')
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY')
  const bucket = getRequiredEnv('R2_BUCKET')
  const publicUrlEnv = process.env['R2_PUBLIC_URL'] || process.env['R2_PUBLIC_BASE_URL'] || ''
  const publicUrl = publicUrlEnv.trim().replace(/\/$/, '') || null

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl,
  }
}

/**
 * Instantiates an S3Client configured for Cloudflare R2 S3-compatible storage.
 */
export function getR2Client() {
  const config = getR2Config()
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
  return { client, config }
}

// -----------------------------------------------------------------------
// Typed interfaces
// -----------------------------------------------------------------------

export type R2ObjectMetadata = {
  key: string
  size: number
  contentType: string
  etag: string
  lastModified: string
}

// -----------------------------------------------------------------------
// Storage Operations
// -----------------------------------------------------------------------

/**
 * Uploads raw binary file buffer data to Cloudflare R2 via PutObjectCommand.
 * Retains 100% backward compatibility with invoice PDF uploads and lesson documents.
 */
export async function uploadR2File(
  key: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<{ key: string; publicUrl: string }> {
  const { client, config } = getR2Client()
  const cleanKey = key.replace(/^\//, '')

  try {
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: cleanKey,
      Body: fileBuffer,
      ContentType: contentType,
    })

    await client.send(command)
  } catch (err: any) {
    if (err.message?.startsWith('Missing required environment variable')) {
      throw err
    }
    console.error(`[r2] PutObjectCommand failed for key ${cleanKey}:`, err)
    throw new Error(`R2 upload failed for key ${cleanKey}: ${err.message}`)
  }

  return {
    key: cleanKey,
    publicUrl: config.publicUrl ? `${config.publicUrl}/${cleanKey}` : cleanKey,
  }
}

/**
 * Deletes an object from Cloudflare R2 via DeleteObjectCommand.
 */
export async function deleteR2File(key: string): Promise<{ success: boolean }> {
  const { client, config } = getR2Client()
  const cleanKey = key.replace(/^\//, '')

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: cleanKey,
    })

    await client.send(command)
    return { success: true }
  } catch (err: any) {
    if (err.message?.startsWith('Missing required environment variable')) {
      throw err
    }
    console.error(`[r2] DeleteObjectCommand failed for key ${cleanKey}:`, err)
    throw new Error(`R2 deletion failed for key ${cleanKey}: ${err.message}`)
  }
}

/**
 * Generates a genuine AWS/R2 cryptographically presigned GET URL for protected files.
 * Default expiration is 3600 seconds (1 hour).
 */
export async function getSignedDownloadUrl(
  key: string,
  expirationSeconds = 3600,
): Promise<{ downloadUrl: string }> {
  const { client, config } = getR2Client()
  const cleanKey = key.replace(/^\//, '')

  try {
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: cleanKey,
    })

    const downloadUrl = await getSignedUrl(client, command, {
      expiresIn: expirationSeconds,
    })

    return { downloadUrl }
  } catch (err: any) {
    if (err.message?.startsWith('Missing required environment variable')) {
      throw err
    }
    console.error(`[r2] getSignedUrl failed for key ${cleanKey}:`, err)
    throw new Error(`Failed to generate R2 presigned URL for key ${cleanKey}: ${err.message}`)
  }
}

/**
 * Retrieves file metadata information directly from Cloudflare R2 via HeadObjectCommand.
 */
export async function getFileMetadata(key: string): Promise<R2ObjectMetadata> {
  const { client, config } = getR2Client()
  const cleanKey = key.replace(/^\//, '')

  try {
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: cleanKey,
    })

    const res = await client.send(command)
    return {
      key: cleanKey,
      size: res.ContentLength ?? 0,
      contentType: res.ContentType ?? 'application/octet-stream',
      etag: res.ETag ?? '',
      lastModified: (res.LastModified ?? new Date(0)).toISOString(),
    }
  } catch (err: any) {
    if (err.message?.startsWith('Missing required environment variable')) {
      throw err
    }
    console.error(`[r2] HeadObjectCommand failed for key ${cleanKey}:`, err)
    throw new Error(`Failed to fetch metadata for R2 object ${cleanKey}: ${err.message}`)
  }
}
