# Gamya Couture — Low-Cost CI/CD Implementation Plan

**Target infra repository:** `gamya-couture-infra`  
**Application repository:** `gamya-boutique` (monorepo: Spring Boot backend + Next.js frontend)

This document defines an extremely low-cost, production-safe CI/CD architecture using GitHub Actions and AWS OIDC—without Jenkins, Kubernetes, ECS, CodeBuild, or CodeDeploy.

---

## Table of contents

1. [Architecture](#1-architecture)
2. [GitHub Actions strategy](#2-github-actions-strategy)
3. [Branch strategy](#3-branch-strategy)
4. [Deployment flow](#4-deployment-flow)
5. [Rollback strategy](#5-rollback-strategy)
6. [Security approach](#6-security-approach)
7. [Implementation phases](#7-implementation-phases)
8. [Open decisions](#8-open-decisions)

---

## 1. Architecture

### High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub                                   │
│  PR → tests only          main merge → build + deploy           │
│         │                          │                             │
│         └──────── GitHub Actions ────┘                             │
│                    OIDC (no long-lived keys)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
      ┌──────┐          ┌────────┐         ┌────────────┐
      │ ECR  │          │  EC2   │         │ S3 + CF    │
      │images│─────────▶│Compose │         │static site │
      └──────┘          │+ Postgres        └────────────┘
                        └────────┘
                             ▲
                      Users ─┴─ www (CloudFront) / api (EC2)
```

### Repository roles

| Repository | Responsibility |
|------------|----------------|
| **gamya-couture-infra** | Terraform/IaC: VPC-lite, EC2, ECR, S3, CloudFront, IAM OIDC roles, SSM parameters, security groups, bootstrap user-data, production `docker-compose.prod.yml`, deploy scripts |
| **gamya-boutique** | Application source, `Dockerfile`, GitHub Actions workflows (build, test, deploy on `main`) |

Infra changes are rare and reviewed separately; application deploys run on every merge to `main`.

### Backend — Spring Boot on EC2

- **Single EC2 instance** (e.g. `t4g.small` or `t3.small`): Docker Engine + Docker Compose.
- Services:
  - `app` — image from **ECR**, tagged by git SHA
  - `postgres` — data on **EBS volume** (not ephemeral instance storage)
- **No ALB** (cost savings): API via Elastic IP or Route 53 (`api.gamyacouture.com` → EC2).
- **ECR** with lifecycle policy (e.g. retain last 10 images).
- Health gate: `/actuator/health` before marking deploy successful.

**Cost tradeoff:** Postgres on the same EC2 avoids RDS (~$15+/month). Mitigate with automated `pg_dump` to S3 and a tested restore runbook.

### Frontend — Next.js static export

- Build with `output: 'export'` in `next.config.ts`.
- **Private S3 bucket** + **CloudFront OAC** (no public bucket ACLs).
- CloudFront **PriceClass_100**; ACM certificate in `us-east-1` for CloudFront.
- Recommended DNS: `www` → CloudFront → S3; `api` → EC2 (direct, not through CloudFront unless WAF is needed later).

### Deliberately avoided services

| Avoided | Replacement |
|---------|-------------|
| ECS / EKS | EC2 + Docker Compose |
| CodeBuild / CodeDeploy | GitHub Actions |
| Jenkins | GitHub Actions |
| Long-lived IAM access keys | IAM OIDC for GitHub |
| NAT Gateway (optional) | Public subnet EC2 + restrictive security groups |

### Estimated monthly cost (early production)

| Component | Approx. cost |
|-----------|----------------|
| EC2 + 20–30 GB EBS | $15–25 |
| ECR | $1–3 |
| S3 + CloudFront (low traffic) | $1–10 |
| Route 53 | ~$0.50 |
| GitHub Actions | $0 within free-tier limits |

**Total target:** ~$20–40/month (excluding domain).

---

## 2. GitHub Actions strategy

### Workflow placement

| Workflow | Repository | Trigger | Production deploy |
|----------|------------|---------|-------------------|
| `ci-backend.yml` | gamya-boutique (backend paths) | PR + push to `main` | Only on push to `main` |
| `ci-frontend.yml` | gamya-boutique (frontend paths) | PR + push to `main` | Only on push to `main` |
| `infra-plan.yml` | gamya-couture-infra | Pull request | Plan only |
| `infra-apply.yml` | gamya-couture-infra | Push to `main` | Apply (with environment approval) |

Use **path filters** so backend and frontend workflows do not run unnecessarily.

### OIDC authentication

1. Create IAM OIDC identity provider: `token.actions.githubusercontent.com`.
2. Create IAM role(s) with trust policy restricted to:
   - `repo:ORG/REPO:ref:refs/heads/main`
   - Optional: GitHub Environment `production`
3. Use `aws-actions/configure-aws-credentials` with `role-to-assume`.

**Split roles (least privilege):**

| Role | Workflow | Permissions (examples) |
|------|----------|------------------------|
| `github-deploy-backend` | Backend | ECR push; SSM `SendCommand` on prod instance |
| `github-deploy-frontend` | Frontend | S3 sync; CloudFront `CreateInvalidation` |
| `github-infra` | Infra | Terraform state + scoped resource CRUD |

EC2 uses an **instance profile** for ECR pull only—not GitHub credentials.

### Backend pipeline (`main` only for deploy)

1. `mvn -B verify` (Java 21, Maven cache).
2. Docker build (multi-stage) → tags `:${{ github.sha }}` and `:latest`.
3. OIDC → ECR push.
4. Deploy via **SSM Run Command** on EC2:
   - `docker login` to ECR
   - `docker compose pull app`
   - `docker compose up -d`
   - Poll `/actuator/health` until healthy or timeout.
5. Fail the job if health check fails.

### Frontend pipeline (`main` only for deploy)

1. `npm ci` → `npm run build` (static export).
2. Set `NEXT_PUBLIC_API_URL` from GitHub **Variables**.
3. `aws s3 sync ./out s3://BUCKET --delete`.
4. CloudFront invalidation (`/*` or targeted paths).

### PR pipelines (no deploy)

- Backend: `mvn verify`; optional `docker build` without push.
- Frontend: `npm run build` to validate static export.
- Infra: `terraform plan` on PR.

**Deploy condition:**

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

Do not deploy on `pull_request` unless a separate, explicitly gated workflow is added later.

### Cost controls

- Maven, npm, and Docker layer caching in Actions.
- ECR lifecycle policy.
- `paths-ignore` for documentation-only commits.

### Secrets and configuration

| Item | Storage |
|------|---------|
| `JWT_SECRET`, `DB_PASSWORD` | SSM SecureString on EC2 (not in GitHub) |
| `NEXT_PUBLIC_*` | GitHub Variables |
| Terraform state | S3 backend + DynamoDB lock table |

---

## 3. Branch strategy

| Branch | Purpose | CI | Deploy to production |
|--------|---------|----|----------------------|
| `main` | Production source of truth | Full test + deploy | **Yes** (on push) |
| `feature/*` | Feature development | Test/build only | **No** |
| `fix/*` | Hotfixes | Test/build only | **No** (until merged to `main`) |

**Rules:**

- Branch protection on `main`: require PR, review, and passing status checks.
- Production releases = merge (squash or merge commit—pick one convention).
- Infra repo: only `main` runs `terraform apply`; PRs are plan-only.

---

## 4. Deployment flow

### Happy path

1. Developer merges PR to `main`.
2. **Backend workflow** (if backend paths changed):
   - Test → build image → push to ECR with SHA tag.
   - SSM deploy script on EC2 pulls image and recreates `app` service.
   - Health check passes → job succeeds.
3. **Frontend workflow** (if frontend paths changed):
   - Static export → `s3 sync` → CloudFront invalidation.
4. **Flyway** runs on app startup; migrations must be backward-compatible (expand/contract).

### Infra changes

1. PR → `terraform plan`.
2. Merge to `main` → `terraform apply` with GitHub Environment approval.
3. EC2 user-data is one-time bootstrap; routine deploys do not reprovision the instance.

### Zero-downtime expectation

Single EC2 + Compose recreate implies **brief downtime** (seconds). True zero-downtime requires a second instance or load balancer (higher cost). Document this tradeoff for stakeholders.

---

## 5. Rollback strategy

### Backend

| Method | When | Action |
|--------|------|--------|
| Redeploy previous image | Bad release, DB OK | Deploy `IMAGE_TAG=<previous-sha>` via workflow input or SSM |
| Git revert | Bad commit on `main` | Revert merge → push `main` → pipeline redeploys |
| On-box pin | Emergency | SSM: set image digest in `.env`, `compose up -d` |

Always deploy **immutable SHA tags**, not only `latest`.

### Frontend

| Method | Action |
|--------|--------|
| Git revert | Revert on `main` → workflow republishes prior assets |
| S3 versioning | Restore previous object versions + invalidation |

### Database

- Scheduled `pg_dump` to S3 (retention 7–30 days).
- Restore runbook: stop app → restore dump → start app on previous image.
- Quarterly restore drill.

### Infra

- Revert Terraform commit and `terraform apply`; avoid destroying EC2 (EIP, EBS, downtime).

---

## 6. Security approach

### Identity and access

- OIDC only for GitHub → AWS; trust scoped to org, repo, and `refs/heads/main`.
- Separate IAM roles per workflow.
- EC2 instance profile: ECR read, SSM core, optional CloudWatch—no broad admin.
- **No SSH (port 22) open to 0.0.0.0/0** — use SSM Session Manager.

### Network

- Security groups: restrict 80/443; Postgres not exposed on host ports in production Compose.
- HTTPS at edge (ACM on CloudFront; ACM or reverse proxy on EC2 for API).

### Application

- Production `JWT_SECRET` from SSM; disable default credentials.
- CORS limited to production frontend origin.
- Disable dev admin seed in production profile.

### Supply chain

- Dependabot/Renovate for Maven and npm.
- Pin GitHub Actions to commit SHAs where practical.
- Enable ECR image scanning on push.

### Monitoring (minimal cost)

- CloudWatch Logs on EC2.
- CloudWatch alarm on EC2 status check + SNS email.
- GitHub Actions history as deploy audit trail.

### Branch protection

- Required checks: `backend-test`, `frontend-build`.
- GitHub Environment `production` for infra apply (optional manual approval for first deploys).

---

## 7. Implementation phases

| Phase | gamya-couture-infra | gamya-boutique |
|-------|---------------------|----------------|
| 0 | Repo layout, README, naming | — |
| 1 | Terraform: ECR, EC2, SG, EIP, S3, CloudFront, OIDC, SSM | — |
| 2 | Bootstrap, `docker-compose.prod.yml`, deploy script | `Dockerfile`, health-ready image |
| 3 | — | Backend workflow: test, ECR push, SSM deploy |
| 4 | — | Next static export + frontend workflow |
| 5 | Backup cron, alarms, runbooks | — |
| 6 | DR test documentation | — |

---

## 8. Open decisions

Confirm before implementation:

1. Monorepo (`gamya-boutique`) vs split API/web repositories.
2. API DNS: direct to EC2 vs CloudFront origin to EC2.
3. Postgres on EC2 vs Amazon RDS.
4. Terraform vs OpenTofu (default: Terraform + S3 backend).
5. Domain and ACM certificate ownership (Route 53 in same AWS account?).

---

## Hard constraints (checklist)

- [x] GitHub repository + GitHub Actions
- [x] Deploy automatically from `main` only
- [x] Cheapest practical architecture
- [x] Production-safe patterns (health checks, backups, least privilege)
- [x] Simple to maintain
- [x] No Jenkins, Kubernetes, ECS, CodeBuild, CodeDeploy
- [x] AWS IAM OIDC—no long-lived access keys

---

*Last updated: 2026-05-23*
