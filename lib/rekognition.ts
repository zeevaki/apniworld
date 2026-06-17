import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition'

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function isSafe(s3Key: string): Promise<{ safe: boolean; reason?: string }> {
  const command = new DetectModerationLabelsCommand({
    Image: {
      S3Object: {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Name: s3Key,
      },
    },
    MinConfidence: 70,
  })

  const response = await rekognition.send(command)
  const labels = response.ModerationLabels ?? []

  if (labels.length === 0) return { safe: true }

  const topLabel = labels[0].Name ?? 'inappropriate content'
  return { safe: false, reason: topLabel }
}
