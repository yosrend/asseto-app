# Context Manager for Asseto Orchestrator

## Overview

The Context Manager provides a structured way to share and maintain context across orchestrated droid tasks for the Asseto AI Image Generator. It ensures that each droid has access to relevant information from previous phases and that the orchestrator can synthesize results effectively.

## Context Structure

### Main Context Template

```json
{
  "task_id": "unique-task-identifier",
  "user_request": "original user request",
  "execution_plan": {
    "pattern_id": "ai-feature-enhancement",
    "complexity": "medium",
    "estimated_duration": "45-60 minutes",
    "strategy": "hybrid",
    "phases": []
  },
  "current_phase": "implementation",
  "completed_phases": ["analysis", "design"],
  "shared_artifacts": {
    "file_paths": {
      "created": [],
      "modified": [],
      "referenced": []
    },
    "api_contracts": {},
    "ai_configurations": {},
    "design_decisions": {},
    "technical_constraints": {},
    "user_requirements": {},
    "performance_requirements": {}
  },
  "droid_outputs": {
    "ai-integration-specialist": {
      "status": "completed",
      "duration": "12 minutes",
      "files_created": ["services/geminiService.ts"],
      "key_decisions": [],
      "next_phase_requirements": [],
      "integration_points": {}
    }
  }
}
```

## Context Passing Rules

### What Always Gets Passed Between Phases

#### 1. File Paths and Locations
- All created/modified files tracked
- Purpose and phase documented
- Dependencies identified

#### 2. AI Configuration
- Gemini API settings
- Model configurations
- Prompt templates
- Image generation parameters

#### 3. Design Decisions
- Architecture choices
- Technology selections
- Pattern implementations

For complete documentation, refer to the full context-manager specification.
