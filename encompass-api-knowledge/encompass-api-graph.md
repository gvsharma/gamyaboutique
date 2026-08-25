# Encompass API graph

```mermaid
flowchart TB
  ENC[ENCOMPASS Developer Connect]
  ENC --> LOANS
  ENC --> WORKFLOW
  ENC --> DOCS
  ENC --> PEOPLE
  ENC --> EVT[EVENTS / WEBHOOKS]
  ENC --> SET[SETTINGS]
  ENC --> SVC[SERVICES]

  subgraph LOANS[Loans]
    P[Pipeline V1/V3/Report]
    M[Loan Management V3]
    SCH[Schema / Fields / Virtual]
    FR[Field Reader/Writer]
    FOL[Folders]
    AUD[Audit Trail]
    P --> CF[Canonical Fields]
  end

  subgraph WORKFLOW[Workflow]
    AS[Associates]
    MS[Milestones]
    TK["Tasks /workflow/v1"]
    ST[Subtasks]
    CND[Standard Conditions]
    EC[Enhanced Conditions]
    MS --> AS
    TK --> ST
    EC --> CT[Types/Sets/Templates]
  end

  subgraph DOCS[Documents]
    EF[eFolder Documents]
    AT[Attachments]
    ORD[Document Order]
    DEL[Document Delivery]
    DIS[Disclosure Tracking]
    ORD --> DEL
    ORD --> DIS
    EF --> AT
    EC -.-> EF
  end

  subgraph COMMS[Communication]
    CV[Conversation Logs]
    CM[Comments]
    SYS[System Logs]
  end

  M --> COMMS
  TK --> CM
  EC --> CM
  EF --> CM

  subgraph PEOPLE[People]
    U[Internal Users]
    PER[Personas]
    TPO[External Users/Orgs]
    CON[Contacts]
  end

  subgraph EVT2[Webhook resources]
    L[Loan]
    T[Task/Subtask/Comment]
    D[DocumentOrder/Delivery]
    EU[Users/Orgs/Groups]
    TM[Timer]
    TR[Trade]
    EPC[ServiceOrder]
  end

  EVT --> EVT2
  L --> P
  L --> M
