<div align="center">
  
![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)
![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=flat-square&logo=graphql&logoColor=white)

# Mülakat101 ***(Interview101)***

</div>

<div align="justify">
  
A serverless blog platform built with AWS AppSync, GraphQL API, and AWS serverless services. Frontend developed with Next.js and Tailwind CSS.

</div>

### Services
- **Authentication:** Amazon Cognito
- **API Management:** AWS AppSync with GraphQL
- **Database:** Amazon DynamoDB
- **File Storage:** Amazon S3
- **Functions:** AWS Lambda
- **Monitoring:** Amazon CloudWatch
- **Frontend Framework:** Next.js with Tailwind CSS

## About

This platform brings interview experiences together in one clean, accessible space. Perfect for anyone who wants to share or learn from real interview journeys that are typically scattered across different sources.

<div align="center">
  
![project](https://github.com/user-attachments/assets/41737b43-9298-40eb-821f-d2241f544b4a)
  
</div>

## Setup
1. Clone the repository:

```
git clone https://github.com/miraygurbuz/AppSync-Mulakat101.git
cd Appsync-Mulakat101
```

2. Install dependencies and Amplify CLI:

```
npm install
npm install -g @aws-amplify/cli
```

3. Initialize Amplify:

```
amplify init
```

4. Add necessary Amplify resources:

```
amplify add auth        # Adds Cognito authentication
amplify add api         # Adds AppSync GraphQL API
amplify add storage     # Adds S3 storage for images
amplify add function    # Adds Lambda function for content moderation
```

5. Deploy Amplify resources:

```
amplify push
```

6. Run the application:

```
npm run dev
```

## System Flow

- Users register and authenticate through AWS Cognito, receiving JWT tokens for API access
- The frontend built with Next.js and Tailwind CSS provides a responsive user interface
- Users can browse, post, and interact with the content
- Content is stored in DynamoDB while image files are stored in S3
- GraphQL API (AppSync) enables efficient data querying
- Lambda functions handle content moderation
- CloudWatch monitors system performance and provides real-time metrics

## Technology Benefits

- **Serverless Architecture:** Eliminates the need for server management, reducing operational overhead
- **GraphQL API:** Provides flexible data queries, reducing unnecessary data transfers
- **Scalability:** Automatic scaling based on demand without manual intervention

## Access

For demo requests or more information, please contact directly via [creating a GitHub issue](https://github.com/miraygurbuz/AppSync-Mulakat101/issues/new)
