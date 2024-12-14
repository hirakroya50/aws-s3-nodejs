const express = require("express");
const multer = require("multer");
require("dotenv").config();

const app = express();
const PORT = 4000;
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
const upload = multer({ storage: multer.memoryStorage() });

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

  const url = await getSignedUrl(s3Client, command);

  return url;
}

async function listObject(params) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.PRIVET_BUCKET_NAME,
    key: "/",
  });
  const result = await s3Client.send(command);
  return result;
}
async function deleteObjectCommand(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.PRIVET_BUCKET_NAME,
    Key: key,
  });
  return await s3Client.send(command);
}

app.get("/", async (req, res) => {
  try {
    const files = await listObject();
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list files" });
  }
});

app.get("/file", async (req, res) => {
  const key = req.params.key;
  try {
    const signedUrl = await getOpjectURL(
      `${"uploads_hirak/user-uploads/video1734178843219.mp4"}`
    );
    console.log(signedUrl);
    res.json({ signedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate access URL" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// async function init() {
//   //   listObject();
//   //   console.log(
//   //     "urlfor :",
//   //     await getOpjectURL("uploads_hirak/user-uploads/photo1734179370128.png")
//   //   );
//   //   console.log(
//   //     "url_foruploading:",
//   //     await putObject(`photo${Date.now()}.png`, "image/png")
//   //   );
//   //   console.log(await deleteObjectCommand("uploads_hirak"));
// }
// // init();
