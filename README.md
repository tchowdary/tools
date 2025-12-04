# Tools

| Tool | URL |
|------|-----|
| JSON Formatter | https://gistpreview.github.io/?3f5b536312f1b852483fe62f96cbbe77 |
| Base64 and Hex Converter | https://gistpreview.github.io/?a99aa91cafe640cfa580864236a06529 |
| Epoch Timestamp Converter | https://gistpreview.github.io/?97a78bb5bb8dd5fafb16a885ab8f2b45 |
| JWT Decoder | https://gistpreview.github.io/?060b0d0375f6844e47138db665949f12 |
| Text Diff | https://gistpreview.github.io/?e96ecdb4e05b9a7cd810c22c426fcb9d |


> [!NOTE]
> Is my text secure?
>
> Yes, all text is processed client-side and never leaves your browser.

## AWS Deployment

This project is deployed to AWS using S3 and CloudFront. The deployment is automated via GitHub Actions.

### Architecture

- **S3 Bucket**: Hosts the static website files
- **CloudFront**: CDN distribution with HTTPS and caching
- **Route53**: DNS records pointing to CloudFront
- **ACM**: SSL/TLS certificate for HTTPS

### Prerequisites

Before deploying, you need to configure the following:

1. **AWS Role for GitHub Actions**
   - Add `AWS_ROLE_TO_ASSUME` secret in your GitHub repository
   - The role should have permissions for S3, CloudFront, CloudFormation, Route53, and ACM

2. **Route53 Hosted Zone**
   - Update `HostedZoneId` in `infrastructure/cloudfront/template.yaml`
   - Update the hosted zone ID in `samconfig.toml`

3. **Domain Configuration**
   - Update domain name in `infrastructure/cloudfront/template.yaml` Settings mapping
   - Default: `devtools.dev.website.com`

### Configuration Files

| File | Description |
|------|-------------|
| `samconfig.toml` | Environment-specific deployment configuration |
| `cloudformation.txt` | CloudFormation stack deployment order |
| `infrastructure/s3-bucket/template.yaml` | S3 bucket CloudFormation template |
| `infrastructure/cloudfront/template.yaml` | CloudFront distribution CloudFormation template |

### Deployment

#### Automatic Deployment

On merge to `main` branch, the GitHub Actions workflow automatically:
1. Syncs static files from `dev-utils/` to S3
2. Invalidates the CloudFront cache

#### Manual Deployment

To deploy infrastructure or trigger a manual deployment:

1. Go to **Actions** > **Deploy DevTools**
2. Click **Run workflow**
3. Select environment: `dev`
4. Check **Deploy infrastructure stacks** if deploying infrastructure for the first time

#### Initial Setup

For first-time deployment:

```bash
# 1. Deploy the S3 bucket stack
aws cloudformation deploy \
  --template-file infrastructure/s3-bucket/template.yaml \
  --stack-name devtools-s3-bucket \
  --parameter-overrides EnvironmentRegion=dev-us-east-1 \
  --capabilities CAPABILITY_IAM

# 2. Deploy the CloudFront stack
aws cloudformation deploy \
  --template-file infrastructure/cloudfront/template.yaml \
  --stack-name devtools-cloudfront \
  --parameter-overrides \
    EnvironmentRegion=dev-us-east-1 \
    HostedZoneId=YOUR_HOSTED_ZONE_ID \
  --capabilities CAPABILITY_IAM

# 3. Sync static files to S3
aws s3 sync dev-utils/ s3://devtools-dev-static-website/ --delete
```

### GitHub Repository Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ROLE_TO_ASSUME` | ARN of the IAM role for GitHub Actions to assume |

### GitHub Repository Variables (Optional)

| Variable | Description |
|----------|-------------|
| `HOSTED_ZONE_ID` | Route53 Hosted Zone ID for DNS records |
