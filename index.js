const express = require("express");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(express.json());
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
    Key: `${fileName}`, // Correct path formatting
    ContentType: contentType, // Pass the ContentType dynamically
  });

  // Generate the signed URL
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
  return url;
}
async function getOjectURL(key) {
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

app.get("/delete", async (req, res) => {
  const { fileKey } = req.body;
  try {
    if (!fileKey) {
      res.json({
        status: 0,
        msg: "plese provide key",
      });
    }
    let deleteFile = await deleteObjectCommand(fileKey);

    res.json({
      status: 1,
      deleteFile,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: "error",
      error,
    });
  }
});

app.get("/getSignUrlForUpload", async (req, res) => {
  const { format, fileType } = req.body;
  // console.log(req.body);
  // console.log(req.query);
  try {
    let url = await putObject(`photo${Date.now()}.${format}`, fileType);
    res.json({
      msg: "make a put request to this url . with the body binary and chouse a file ",
      format,
      fileType,
      url,
    });
  } catch (error) {
    res.json({
      data: "sjsjsj",
    });
  }
});

app.get("/", async (req, res) => {
  try {
    const files = await listObject();
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list files" });
  }
});

app.get("/getobject", async (req, res) => {
  const { fileKey } = req.body;

  try {
    // let fileKey = req.params.key;
    if (!fileKey) {
      res.json({
        status: 0,
        msg: "plese provide key",
      });
    }

    let signedUrl = await getOjectURL(fileKey);
    res.json({
      status: 1,
      signedUrl,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      msg: "error",
      error,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
