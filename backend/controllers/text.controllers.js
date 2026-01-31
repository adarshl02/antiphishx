import AWS from "../config/AWS.js";
import comprehendService from "../services/comprehend.js";
import fraudService from "../services/fraudDetector.js";
import dynamoDb from "../config/dynamoDb.js";
import errorHandler from "../utils/errorHandler.js";
import { getVerdictFromComprehend } from "../services/getVerdict.js";
import { generateId } from "../utils/generateId.js";

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

export const analyzeText = async (req, res) => {
  try {
    const { userId } = req.user;

    const { text } = req.body;

    const analysis = await comprehendService.analyzeText(text);
    const verdict = getVerdictFromComprehend(analysis, text);

    const params = {
      TableName: "UsersHistory",
      Item: {
        id: generateId("USERHIS"),
        userId,
        timestamp: Date.now(),
        text,
        analysis,
        verdict,
      },
    };

    await dynamoDb.put(params).promise();
    return res.status(200).send({
      response: {
        data: { params },
        title: "Text And Verdict Successfull",
        message: "Text and verdict Stored Successfully",
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(
        errorHandler(
          500,
          "Internal Server Error",
          "Server Error While Storing Text And Verdict"
        )
      );
  }
};

export const analyzeImage = async (req, res) => {
  try {
    const { userId } = req.user;

    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .send(errorHandler(400, "No File", "No file uploaded"));
    }

    const fileId = generateId("FILE");
    const BUCKET_NAME = "antiphishxbucket960422538080";
    const fileKey = `${userId}_${fileId}_${Date.now()}${
      file.originalname ? "_" + file.originalname : ""
    }`;

    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    const textResponse = await rekognition
      .detectText({
        Image: { S3Object: { Bucket: BUCKET_NAME, Name: fileKey } },
      })
      .promise();

    const detectedText = textResponse.TextDetections.filter(
      (t) => t.Type === "LINE"
    )
      .map((t) => t.DetectedText)
      .join(" ");

    const labelsResponse = await rekognition
      .detectLabels({
        Image: { S3Object: { Bucket: BUCKET_NAME, Name: fileKey } },
        MaxLabels: 15,
        MinConfidence: 70,
      })
      .promise();

    const analysis = await comprehendService.analyzeText(detectedText);
    const verdict = getVerdictFromComprehend(analysis, detectedText);

    const suspiciousReasons = [];
    if (
      labelsResponse.Labels.some((l) =>
        ["Screenshot", "Monitor", "Display"].includes(l.Name)
      )
    ) {
      suspiciousReasons.push("Looks like a screenshot");
    }
    if (
      labelsResponse.Labels.some((l) =>
        ["Blurry", "Low Resolution"].includes(l.Name)
      )
    ) {
      suspiciousReasons.push("Low-quality image (possible tampering)");
    }

    if (suspiciousReasons.length > 0) {
      verdict.isPhishing = true;
      verdict.riskScore += 2;
      verdict.reasons.push(...suspiciousReasons);
    }

    const params = {
      TableName: "UsersHistory",
      Item: {
        id: generateId("IMGHIS"),
        userId,
        timestamp: Date.now(),
        imageKey: fileKey,
        bucket: BUCKET_NAME,
        text: detectedText,
        labels: labelsResponse,
        analysis,
        verdict,
      },
    };

    await dynamoDb.put(params).promise();

    return res.status(200).send({
      response: {
        data: { params },
        title: "Image Analysis Successful",
        message: "Image uploaded, analyzed and stored successfully",
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(
        errorHandler(
          500,
          "Internal Server Error",
          "Server Error While Analyzing Image"
        )
      );
  }
};

export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.user;

    const params = {
      TableName: "UsersHistory",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
      ScanIndexForward: false, // newest first if using timestamp as sort key
    };
    const result = await dynamoDb.query(params).promise();

    const filteredHistory = result.Items.map((item) => ({
      id: item.id,
      text: item.text,
      verdict: item.verdict,
      sentiment: item.analysis?.sentiment,
      s3BucketUrl: item.imageKey
        ? `https://${item.bucket}.s3.amazonaws.com/${item.imageKey}`
        : null,
    }));

    return res.status(200).send({
      response: {
        data: filteredHistory,
        title: "User History Fetched",
        message: "User history fetched successfully",
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(
        errorHandler(
          500,
          "Internal Server Error",
          "Server Error While Fetching User History"
        )
      );
  }
};
