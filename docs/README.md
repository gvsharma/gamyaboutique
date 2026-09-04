# Documentation Index

| Document | Read time | Audience |
|----------|-----------|----------|
| [../README.md](../README.md) | 5 min | Everyone — start here |
| [DEVELOPER-ONBOARDING.md](./DEVELOPER-ONBOARDING.md) | 15 min | New developers — clone to running stack |
| [BACKEND-SETUP.md](./BACKEND-SETUP.md) | 10 min | Backend engineers — Java, Flyway, tests, EC2 |
| [INFRA-SETUP.md](./INFRA-SETUP.md) | 15 min | DevOps — Terraform, AWS, GitHub Actions, SSM |
| [../frontend/README.md](../frontend/README.md) | 10 min | Frontend — Node, Vercel, env vars |
| [FEATURES.md](./FEATURES.md) | 2 min | PM, QA — what the app does |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 10 min | Engineers — how it works |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Reference | Backend, DBA |
| [API_CONTRACT.md](./API_CONTRACT.md) | Reference | Frontend, API consumers |
| [AUTH_FLOW.md](./AUTH_FLOW.md) | 5 min | Security review |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 15 min | Production deploy runbook |
| [TESTING.md](./TESTING.md) | 10 min | QA, SDET |
| [DECISIONS.md](./DECISIONS.md) | 5 min | Staff engineers |
| [AWS-DEV-SETUP.md](./AWS-DEV-SETUP.md) | 20 min | End-to-end Vercel + EC2 + RDS |
| [../CHANGELOG.md](../CHANGELOG.md) | — | Release history |
| [../TODO.md](../TODO.md) | — | Roadmap |

### Setup & deploy quick links

| Doc | Purpose |
|-----|---------|
| [DEVELOPER-ONBOARDING.md](./DEVELOPER-ONBOARDING.md) | First-day local setup + admin login |
| [BACKEND-SETUP.md](./BACKEND-SETUP.md) | Maven, profiles, Docker Postgres, Swagger |
| [INFRA-SETUP.md](./INFRA-SETUP.md) | gamya-couture-infra, OIDC, cost scheduler |
| [../deploy/README.md](../deploy/README.md) | EC2 bootstrap, SSM deploy scripts |
| [../frontend/.env.local.example](../frontend/.env.local.example) | Frontend env template |
| [../deploy/env/application.env.example](../deploy/env/application.env.example) | EC2 backend env template |
| [../.cursor/CLOUD.md](../.cursor/CLOUD.md) | Cursor Cloud Agents — VM setup, terminals, guardrails |

### Production operations

| Document | Purpose |
|----------|---------|
| [production/README.md](./production/README.md) | CI/CD + smoke commands |
| [production/MANUAL-QA-CHECKLIST.md](./production/MANUAL-QA-CHECKLIST.md) | Pre-release QA |
| [production/DEPLOYMENT-CHECKLIST.md](./production/DEPLOYMENT-CHECKLIST.md) | Deploy runbook |
| [production/MONITORING-CHECKLIST.md](./production/MONITORING-CHECKLIST.md) | Post-launch ops |
| [production/GO-LIVE-CHECKLIST.md](./production/GO-LIVE-CHECKLIST.md) | Launch gates |

### Legacy / supplementary

| Document | Notes |
|----------|-------|
| [../frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) | Frontend-specific notes |
| [PRE-DEPLOY-REVIEW.md](./PRE-DEPLOY-REVIEW.md) | Historical pre-deploy fixes |
| [CICD-IMPLEMENTATION-PLAN.md](./CICD-IMPLEMENTATION-PLAN.md) | CI/CD design rationale |

**Keep docs in sync:** Update `CHANGELOG.md` and relevant doc when merging features that change APIs, schema, or deploy steps.

### Standalone knowledge bases

| Document | Purpose |
|----------|---------|
| [../knowledge-base/encompass-developer-connect/README.md](../knowledge-base/encompass-developer-connect/README.md) | Encompass Developer Connect domain seed (download/share as markdown) |
