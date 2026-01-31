import AWS from "../config/AWS.js";
import errorHandler from "../utils/errorHandler.js";
const comprehend = new AWS.Comprehend();

const analyzeText = async (text) => {
  const params = {
    LanguageCode: "en",
    Text: text,
  };

  try {
    const [
      entities,
      sentiment,
      keyPhrases,
      syntax,
      piiEntities,
      targetedSentiment,
    ] = await Promise.all([
      comprehend.detectEntities(params).promise(),
      comprehend.detectSentiment(params).promise(),
      comprehend.detectKeyPhrases(params).promise(),
      comprehend.detectSyntax(params).promise(),
      comprehend.detectPiiEntities(params).promise(),
      comprehend.detectTargetedSentiment(params).promise(),
    ]);

    // Detect dominant language (doesn't take LanguageCode)
    const dominantLanguage = await comprehend
      .detectDominantLanguage({ Text: text })
      .promise();

    return {
      entities,
      sentiment,
      keyPhrases,
      syntax,
      piiEntities,
      targetedSentiment,
      dominantLanguage,
    };
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(
        errorHandler(
          500,
          "Internal Server Error",
          "Server Error While Analyzing Text Using Comprehend"
        )
      );
  }
};

export default { analyzeText };
