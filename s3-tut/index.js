const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIASK5MCBLICTLUAFXV",
    secretAccessKey: "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",
  },
});

async function getOpjectURL(key) {
  const command = new GetObjectCommand({
    Bucket: "privet-bucket-s3-nodejs",
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command);

  return url;
}

console.log("urlfor :", getOpjectURL("1708289711822.jpeg"));
