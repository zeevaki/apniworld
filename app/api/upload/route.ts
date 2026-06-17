import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '@/lib/s3'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const { fileType } = await req.json()

  const key = `uploads/${randomUUID()}.${fileType.split('/')[1]}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  })

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
  const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

  return NextResponse.json({ presignedUrl, publicUrl })
}
