# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Architecture

**MCP Server Pattern**: This is a Model Context Protocol server that exposes AI image generation capabilities as standardized tools. Uses `@modelcontextprotocol/sdk` for MCP compliance and `@chatmcp/sdk` for REST transport options.

**Transport Modes**: 
- **STDIO mode** (default): Used for direct MCP integration
- **REST mode**: `--mode=rest --port=9593 --endpoint=/rest` for HTTP API access

## Key Components

- **src/index.ts**: MCP server initialization + tool registration, dual transport support
- **src/falai.ts**: Client wrapper for fal.ai API with style-specific prompting logic
- **Dockerfile**: Multi-stage build with Alpine Linux, production-optimized

## Essential Commands

```bash
# Development
npm run build          # Build TypeScript
npm run watch          # Watch mode for dev
npm run inspector      # MCP inspector

# Runtime
npm start             # STDIO mode
npm start -- --mode=rest --port=9593 --endpoint=/rest  # REST mode

# Environment
FALAI_API_KEY required in .env file
```

## Tool Architecture

**Tools registered via MCP**:
1. `generate_image` - 34 anime/art styles with size options (1-4 images)
2. `upscale_image` - 4x resolution enhancement via fal-ai/esrgan
3. `search-and-replace` - Inpainting via fal-ai/inpaint with mask support

**Style Engine**: See `src/falai.ts:92` - style-specific negative prompts and inference steps for quality control.