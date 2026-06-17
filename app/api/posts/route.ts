import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { supabase } from '@/lib/supabase'
import { s3 } from '@/lib/s3'
import { isSafe } from '@/lib/rekognition'

export async function GET() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { image_url, s3_key, message } = await req.json()

  // Scan with AWS Rekognition before saving
  const { safe, reason } = await isSafe(s3_key)

  if (!safe) {
    // Delete the offensive image from S3 immediately
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3_key,
    }))

    return NextResponse.json(
      { error: `This image was flagged as inappropriate (${reason}) and could not be posted.` },
      { status: 400 }
    )
  }

  // Image is clean — save to Supabase
  const { data, error } = await supabase
    .from('posts')
    .insert({ image_url, message })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
