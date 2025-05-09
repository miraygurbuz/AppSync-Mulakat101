/* Amplify Params - DO NOT EDIT
	API_SERVERLESSBLOG_GRAPHQLAPIENDPOINTOUTPUT
	API_SERVERLESSBLOG_GRAPHQLAPIIDOUTPUT
	API_SERVERLESSBLOG_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT *//**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    const { text } = event.arguments;
    
    const badWords = ['filtre'];
    const hasBadWords = badWords.some(badWord => text.toLowerCase().includes(badWord));
    
    return { clean: !hasBadWords };
  };
