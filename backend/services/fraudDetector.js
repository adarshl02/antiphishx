import AWS from '../config/AWS.js'
const fraudDetector = new AWS.FraudDetector();

const getFraudVerdict = async (textAnalysis) => {
  try {
    const params = {
      detectorId: "PhishingDetector",
      detectorVersionId: "1",
      eventId: `event-${Date.now()}`,
      eventTypeName: "phishing_event",
      entities: [{ entityType: "user", entityId: "123" }],
      eventTimestamp: new Date().toISOString(),
      eventVariables: {
        sentiment: textAnalysis.sentiment.Sentiment,
        entitiesCount: textAnalysis.entities.Entities.length.toString(),
      },
    };

    const result = await fraudDetector.getEventPrediction(params).promise();

    return result.ruleResults;
  } catch (err) {
    throw new Error("Fraud Detector error: " + err.message);
  }
};

export default { getFraudVerdict };