<!-- AUTO-GENERATED-CONTENT:START (COMPONENT_HEADER) -->
# AWS Sdk Node

AWS SDK for Node.js Serverless Component
<!-- AUTO-GENERATED-CONTENT:END -->

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [Input Types](#input-types)
- [Output Types](#output-types)
- [Example](#example)
<!-- AUTO-GENERATED-CONTENT:END -->

<!-- AUTO-GENERATED-CONTENT:START (COMPONENT_INPUT_TYPES) -->
## Input Types
| Name | Type | Description |
|:------ |:-----|:-----------------|
| **region**| `string` | AWS region for the service
| **credentials**| `object` | AWS credentials for the service
| **serviceName**| `string`<br/>*required* | AWS service interface object name

<!-- AUTO-GENERATED-CONTENT:END -->

<!-- AUTO-GENERATED-CONTENT:START (COMPONENT_OUTPUT_TYPES) -->
## Output Types
| Name | Type | Description |
|:------ |:-----|:-----------------|
| **Service**| `object` | service object

<!-- AUTO-GENERATED-CONTENT:END -->

<!-- AUTO-GENERATED-CONTENT:START (COMPONENT_EXAMPLES) -->
## Example
```yml
type: my-application
components:
  myAwsSdkNode:
    type: aws-sdk-node
    inputs:
      region: us-east-1
      credentials:
        accessKeyId: ABCDACCESKEYID
        secretAccessKey: ABCDSECRETACCESSKEY
      serviceName: s3

```
<!-- AUTO-GENERATED-CONTENT:END -->
