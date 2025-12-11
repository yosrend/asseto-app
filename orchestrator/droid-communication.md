# Droid-to-Droid Communication Protocol

## Overview

The communication protocol enables real-time collaboration between droids during orchestration, allowing for dynamic coordination and knowledge sharing in the Asseto AI Image Generator project.

## Communication Architecture

### Communication Channels

#### 1. Orchestrator-Mediated Communication
```
Droid A → Orchestrator → Droid B
- Most common and safest approach
- Orchestrator validates and routes messages
- Full logging and conflict detection
```

#### 2. Direct Droid Communication
```
Droid A → Droid B (via orchestrator bus)
- For urgent clarifications during parallel execution
- Orchestrator monitors but doesn't interfere
```

### Message Types

#### 1. Query Messages
- Information requests between droids
- Clarification needs
- Integration questions

#### 2. Response Messages
- Answers to queries
- Status updates
- Completion notifications

#### 3. Coordination Messages
- Dependency notifications
- Blocker alerts
- Discovery announcements

## Communication Use Cases

### Use Case 1: AI Integration Coordination
**Scenario**: AI specialist and frontend developer coordinating on image generation UI

```
AI Specialist → Frontend Dev: "Image generation returns base64 data"
Frontend Dev → AI Specialist: "Need loading states and error handling"
AI Specialist → Frontend Dev: "Added status enum: LOADING, COMPLETED, FAILED"
```

### Use Case 2: Performance Optimization
**Scenario**: Performance engineer discovers AI generation bottleneck

```
Performance Engineer → AI Specialist: "Image generation taking 30s+"
AI Specialist → Performance Engineer: "Implementing parallel generation"
Result: Immediate optimization without phase delay
```

For complete communication protocol, see full documentation.
