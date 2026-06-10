# S3 product images (dev)

**Managed in Terraform** (`gamya-couture-infra` → `modules/product-media-cdn` → `environments/dev`).

| Setting | Value |
|---------|-------|
| Bucket | `gamya-couture-dev-media` |
| CloudFront | `https://d2568bpd35bq6a.cloudfront.net` |
| EC2 IAM | Attached via Terraform (`product_media_upload` policy) |

Do **not** apply `bucket-policy.example.json` (public `Principal: *`). The bucket stays private; CloudFront OAC reads objects via bucket policy managed by Terraform.

`ec2-instance-policy.example.json` is reference only — the live EC2 role policy is provisioned by Terraform.

After `terraform apply`:

```bash
terraform output product_media_ec2_env_hint
terraform output product_media_vercel_env_hint
```
