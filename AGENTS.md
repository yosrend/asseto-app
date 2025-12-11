# Asseto AI Image Generator - Agent Orchestration System

## 📋 Overview

This document describes the AI agent orchestration system used in the Asseto project for coordinating complex development tasks across multiple specialized AI agents (droids).

## 🏗️ Architecture

### System Components

1. **Orchestrator Core** - Master coordinator for task planning and execution
2. **Specialized Droids** - Domain-specific AI agents with focused expertise
3. **Context Manager** - Maintains shared state and artifacts across phases
4. **Communication Protocol** - Enables real-time droid collaboration
5. **Quality Gates** - Validates outputs and ensures integration consistency
6. **Memory System** - Learns from past executions to improve future performance

### Project-Specific Configuration

**Asseto** is an AI-powered design asset generator using:
- **Frontend**: React 19 + TypeScript + Vite
- **AI Integration**: Google Gemini API (gemini-2.5-flash-image)
- **Image Generation**: AI-powered asset creation for UI/UX designers
- **Styling**: Modern React component architecture

## 🤖 Available Droids

### Core Development Droids

#### 1. Frontend Developer
- **Expertise**: React, TypeScript, modern UI components
- **Responsibilities**:
  - Build and enhance UI components
  - Implement state management
  - Integrate with AI services
  - Responsive design and accessibility
- **Usage**: UI enhancements, component creation, styling

#### 2. AI Integration Specialist
- **Expertise**: Gemini API, prompt engineering, AI model integration
- **Responsibilities**:
  - Optimize AI image generation
  - Enhance prompt engineering
  - Configure Gemini API settings
  - Improve AI service architecture
- **Usage**: AI feature enhancements, generation optimization

#### 3. Backend Architect
- **Expertise**: API design, system architecture, service integration
- **Responsibilities**:
  - Design service architecture
  - Plan API integrations
  - Define data flows
  - System-level decisions
- **Usage**: Architecture planning, service design

### Quality & Testing Droids

#### 4. Test Automator
- **Expertise**: Testing strategies, test automation, quality assurance
- **Responsibilities**:
  - Create comprehensive test suites
  - Validate functionality
  - Performance testing
  - Regression prevention
- **Usage**: Testing implementation, quality validation

#### 5. Security Auditor
- **Expertise**: Security best practices, vulnerability assessment
- **Responsibilities**:
  - Security reviews
  - API key management
  - Data protection
  - Compliance validation
- **Usage**: Security audits, sensitive data handling

#### 6. Code Reviewer
- **Expertise**: Code quality, best practices, maintainability
- **Responsibilities**:
  - Quality assessment
  - Pattern consistency
  - Performance optimization
  - Documentation review
- **Usage**: Code quality checks, final reviews

### Debugging & Optimization Droids

#### 7. Debugger
- **Expertise**: Problem diagnosis, root cause analysis
- **Responsibilities**:
  - Bug identification
  - Error reproduction
  - Impact assessment
  - Solution recommendations
- **Usage**: Bug fixes, error resolution

#### 8. Performance Engineer
- **Expertise**: Performance optimization, profiling, benchmarking
- **Responsibilities**:
  - Performance analysis
  - Bottleneck identification
  - Optimization implementation
  - Load testing
- **Usage**: Performance improvements, optimization tasks

## 🎯 Task Patterns

### 1. AI Feature Enhancement
**Complexity**: Medium-High  
**Phases**:
1. AI Analysis (ai-integration-specialist)
2. Implementation (ai-integration-specialist + frontend-developer) - PARALLEL
3. Testing & Validation (test-automator)

**Use Cases**:
- Improve image generation quality
- Enhance prompt engineering
- Optimize AI model usage
- Add new AI capabilities

### 2. UI/UX Enhancement
**Complexity**: Medium  
**Phases**:
1. Design Analysis (frontend-developer)
2. Implementation (frontend-developer)
3. Testing (test-automator)

**Use Cases**:
- Component improvements
- Layout enhancements
- Responsive design updates
- Accessibility improvements

### 3. Bug Fix Workflow
**Complexity**: Simple-Medium  
**Phases**:
1. Diagnosis (debugger)
2. Implementation (auto-selected by domain)
3. Verification (test-automator)

**Use Cases**:
- Error fixes
- Functionality issues
- Integration problems
- Performance bugs

## 🔄 Orchestration Flow

### Standard Execution Pattern

```
User Request
    ↓
Discovery Phase (Auto-detect context)
    ↓
Planning Phase (Create execution plan)
    ↓
Droid Selection (Rank by expertise match)
    ↓
Execution Phases (Sequential + Parallel)
    ↓
Quality Validation (Gates & checks)
    ↓
Synthesis & Delivery
```

### Example: Enhance AI Image Generation

**User Request**: "Improve image generation quality and add style customization"

**Orchestrator Plan**:
1. **Phase 1 - AI Analysis** (15 min)
   - Droid: ai-integration-specialist
   - Analyze current Gemini integration
   - Identify enhancement opportunities
   - Design style customization system

2. **Phase 2 - Implementation** (40 min) - PARALLEL
   - Droid A: ai-integration-specialist
     - Enhance geminiService.ts
     - Implement style extraction
     - Optimize prompt generation
   - Droid B: frontend-developer
     - Build style customization UI
     - Add image preview improvements
     - Implement loading states

3. **Phase 3 - Testing** (20 min)
   - Droid: test-automator
   - Test AI generation with new features
   - Validate style customization
   - Performance benchmarks

**Total Time**: ~75 minutes  
**Result**: Enhanced AI generation with style customization

## 📝 Context Management

### Shared Artifacts

All droids have access to:
- **File Paths**: Created/modified files with purposes
- **API Contracts**: Service interfaces and data structures
- **Design Decisions**: Architecture choices and reasoning
- **AI Configurations**: Gemini API settings, model configs
- **Performance Metrics**: Benchmarks and optimization data

### Context Flow Example

```json
{
  "task_id": "enhance-ai-generation-001",
  "shared_artifacts": {
    "ai_configurations": {
      "gemini_model": "gemini-2.5-flash-image",
      "aspect_ratio": "16:9",
      "generation_strategy": "parallel"
    },
    "file_paths": {
      "created": [
        "services/styleExtractor.ts",
        "components/StyleCustomizer.tsx"
      ],
      "modified": [
        "services/geminiService.ts"
      ]
    },
    "design_decisions": {
      "style_extraction": {
        "decision": "Use Gemini multimodal for style analysis",
        "reasoning": "Leverages existing API, no new dependencies"
      }
    }
  }
}
```

## 💬 Droid Communication

During parallel execution, droids can communicate in real-time:

```
[15:30] AI Specialist → Frontend Dev:
        "Image generation now returns {dataUrl, status, metadata}"

[15:32] Frontend Dev → AI Specialist:
        "Can we add progress percentage for loading states?"

[15:35] AI Specialist → Frontend Dev:
        "Added progress field (0-100) in generation response"

[15:40] Frontend Dev → AI Specialist:
        "Perfect! Loading UI implemented with progress bar"
```

## ⚙️ Configuration

### Orchestrator Settings

Located in `orchestrator/orchestrator-config.json`:

```json
{
  "orchestrator": {
    "max_concurrent_phases": 3,
    "default_timeout_minutes": 90,
    "auto_retry_failed_phases": true
  },
  "droid_settings": {
    "timeout_minutes": {
      "frontend-developer": 45,
      "ai-integration-specialist": 45,
      "test-automator": 40
    }
  },
  "quality_gates": {
    "require_testing_phase": true,
    "require_security_review": ["ai_integration", "sensitive_data"]
  }
}
```

### Task Patterns

Located in `orchestrator/task-patterns.json`:
- Predefined orchestration flows for common tasks
- Automatic pattern detection from user requests
- Optimized phase sequences and droid selections

## 🚀 Usage

### Invoking the Orchestrator

```bash
# In Factory CLI
/orchestrator "enhance AI image generation with style customization"
```

### Manual Droid Invocation

For simple tasks, invoke droids directly:

```bash
# Frontend changes only
/frontend-developer "add loading spinner to image generation"

# AI optimization
/ai-integration-specialist "optimize Gemini prompt for better quality"
```

## 📊 Quality Metrics

The orchestrator tracks:
- **Execution Time**: Actual vs estimated duration
- **Success Rate**: Task completion percentage
- **Code Quality**: Automated quality assessments
- **Test Coverage**: Percentage of code tested
- **Performance**: Generation speed, API response times

## 🔍 Monitoring

### Execution Logs

Located in `orchestrator/logs/`:
- Phase execution timelines
- Droid communication logs
- Conflict detection reports
- Quality gate results

### Context Snapshots

Located in `orchestrator/contexts/`:
- Saved context per task
- Historical execution data
- Learning patterns

## 📚 Additional Documentation

- `orchestrator/droid-orchestrator-docs.md` - Complete system documentation
- `orchestrator/context-manager.md` - Context management details
- `orchestrator/droid-communication.md` - Communication protocol
- `orchestrator/orchestrator-config.json` - Configuration reference
- `orchestrator/task-patterns.json` - Task pattern definitions

## 🎯 Best Practices

1. **Use Orchestrator for Complex Tasks**: Multi-phase work, cross-domain features
2. **Direct Droid for Simple Tasks**: Single-file changes, quick fixes
3. **Enable Communication**: For parallel execution phases
4. **Review Plans**: Always review orchestrator execution plans before approval
5. **Track Context**: Check shared artifacts for integration points
6. **Monitor Quality**: Validate quality gate results
7. **Learn from History**: Review execution logs for optimization opportunities

---

**Project**: Asseto AI Image Generator  
**Version**: 1.0.0  
**Updated**: 2024-12-11
