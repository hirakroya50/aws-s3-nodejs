require("dotenv").config();
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
async function putObject(fileName, contentType) {
  console.log(contentType);

  const command = new PutObjectCommand({
    Bucket: process.env.PRIVET_BUCKET_NAME,
    Key: `uploads_hirak/user-uploads/${fileName}`, // Correct path formatting
    ContentType: contentType, // Pass the ContentType dynamically
  });

  // Generate the signed URL
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
  return url;
}
async function getOpjectURL(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.PRIVET_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 10 });

  return url;
}

async function listObject(params) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.PRIVET_BUCKET_NAME,
    key: "/",
  });
  const result = await s3Client.send(command);
  console.log(result);
}
async function deleteObjectCommand(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.PRIVET_BUCKET_NAME,
    Key: key,
  });
  return await s3Client.send(command);
}
async function init() {
  //   listObject();
  //   console.log(
  //     "urlfor :",
  //     await getOpjectURL("uploads_hirak/user-uploads/photo1734179370128.png")
  //   );
  //   console.log(
  //     "url_foruploading:",
  //     await putObject(`photo${Date.now()}.png`, "image/png")
  //   );
  console.log(await deleteObjectCommand("uploads_hirak"));
}
init();
