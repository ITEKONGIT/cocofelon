---
title: "CWL Cloud Breaker — Initial Access"
date: "2026-06-15"
slug: cwl-cloud-breaker-initial-access
series: "Cloud Breaker Chronicles"
part: 1
difficulty: "Intermediate"
---

When you find an exposed AWS credential in a public repo, the game begins.

```bash
# Enumerate the account
aws sts get-caller-identity --profile found-creds

# List all S3 buckets
aws s3 ls --profile found-creds

# Check IAM permissions
aws iam list-attached-user-policies --user-name target-user --profile found-creds
```

The user had **AdministratorAccess** attached. Game over.


<span class="redacted" data-redacted="The exact repository where the credentials were found cannot be disclosed at this time">████████████</span>