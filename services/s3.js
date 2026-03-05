import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ profile: "vikas" });

export const createUploadSignedUrl = async ({ key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: "vikas-storage-app-123",
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    // signableHeaders: new Set(["content-type"]),
  });

  return url;
};

export const createGetSignedUrl = async ({
  key,
  download = false,
  filename,
}) => {
  const command = new GetObjectCommand({
    Bucket: "vikas-storage-app-123",
    Key: key,
    ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename=${encodeURIComponent(filename)}`,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  return url;
};

export const getS3FileMetaData = async (key) => {
  console.log({key});
  const command = new HeadObjectCommand({
    Bucket: "vikas-storage-app-123",
    Key: key,
  });

  return await s3Client.send(command);
};

export const deleteS3File = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: "vikas-storage-app-123",
    Key: key,
  });

  return await s3Client.send(command);
};

export const deleteS3Files = async (keys) => {
  const command = new DeleteObjectsCommand({
    Bucket: "vikas-storage-app-123",
    Delete: {
      Objects: keys,
      Quiet: false, // set true to skip individual delete responses
    },
  });

  return await s3Client.send(command);
};
