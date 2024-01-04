import aws from "aws-sdk";
import { nanoid } from "nanoid";

export const s3 = new aws.S3({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const generateUploadUrl = async () => {
  // Create name of the file
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;
  const uploadUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: "eblog-bucket",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });

  return uploadUrl;
};
