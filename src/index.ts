#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FalAiClient, ImageStyle, ImageSize } from "./falai.js";
import dotenv from "dotenv";
import { RestServerTransport } from "@chatmcp/sdk/server/rest.js";
import { getParamValue, getAuthValue } from "@chatmcp/sdk/utils/index.js";
import { Request } from "@modelcontextprotocol/sdk/types.js";
import { fal } from "@fal-ai/client";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
dotenv.config();

// Enable verbose logging for schema validation
process.env.LOG_LEVEL = process.env.LOG_LEVEL || "debug";
const mode = getParamValue("mode") || "stdio";
const port = getParamValue("port") || 9593;
const endpoint = getParamValue("endpoint") || "/rest";

// Initialize MCP server
const server = new Server(
  {
    name: "mcp-falai",
    version: "0.1.0",
    description:
      "A Model Context Protocol server for image generation using fal.ai",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const apiKey = process.env.FALAI_API_KEY;
if (!apiKey) {
  console.error("Error: FALAI_API_KEY environment variable is not set");
  process.exit(1);
}

const falai = new FalAiClient({ apiKey });

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: [
      {
        name: "generate_image",
        description:
          "Generate images using fal.ai with various styles and options.",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt to generate the image from",
            },
            style: {
              type: "string",
              enum: [
                "ghibli-style",
                "pixar-style",
                "pokemon-style",
                "genshin-impact-style",
                "cyberpunk-style",
                "one-piece-style",
                "attack-on-titan-style",
                "shinkai-makoto-style",
                "sailor-moon-style",
                "evangelion-style",
                "disney-princess-style",
                "kyoto-animation-style",
                "dreamworks-animation-style",
                "marvel-studios-style",
                "dc-comics-style",
                "kawaii-pastel-style",
                "simpsons-style",
                "dragon-ball-style",
                "demon-slayer-style",
                "warner-bros-animation-style",
                "dark-fantasy-style",
                "pixar-art-style",
                "toei-animation-style",
                "hayao-miyazaki-style",
                "makoto-shinkai-style",
                "katsuhiro-otomo-style",
                "mamoru-hosoda-style",
                "goro-miyazaki-style",
                "masaaki-yuasa-style",
                "shinichiro-ushijima-style",
                "naoko-yamada-style",
                "taichi-ishidate-style",
                "isao-takahata-style",
                "hiromasa-yonebayashi-style",
                "japanese-anime-style",
              ],
              default: "ghibli-style",
              description: "Image style",
            },
            num_images: {
              type: "number",
              minimum: 1,
              maximum: 4,
              default: 1,
              description: "Number of images to generate (1-4)",
            },
            size: {
              type: "string",
              enum: [
                "square",
                "square_hd",
                "portrait_4_3",
                "portrait_16_9",
                "landscape_4_3",
                "landscape_16_9",
              ],
              default: "square_hd",
              description: "Image size",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "upscale_image",
        description: "Enhance image resolution by 4x using fal.ai upscaling.",
        parameters: {
          image_url: {
            type: "string",
            description: "The URL of the image to upscale",
          },
        },
        inputSchema: {
          type: "object",
          properties: {
            image_url: {
              type: "string",
              description: "The URL of the image to upscale",
            },
          },
          required: ["image_url"],
        },
      },
      {
        name: "search-and-replace",
        description:
          "Replace objects or elements in an image using text descriptions.",
        parameters: {
          image_url: {
            type: "string",
            description: "The URL of the image to edit",
          },
          mask_url: {
            type: "string",
            description:
              "Input mask for inpaint mode. Black areas will be preserved, white areas will be inpainted.",
          },
        },
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description:
                "The prompt to use for generating the image. Be as descriptive as possible for best results.",
            },
            image_url: {
              type: "string",
              description: "Input image for img2img or inpaint mode",
            },
            mask_url: {
              type: "string",
              description:
                "Input mask for inpaint mode. Black areas will be preserved, white areas will be inpainted.",
            },
          },
          required: [
            "image_url",
            "target_description",
            "replacement_description",
          ],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const params = request.params as {
      name: string;
      arguments: {
        prompt?: string;
        style?: ImageStyle;
        num_images?: number;
        size?: ImageSize;
        image_url?: string;
        mask_url?: string;
      };
    };

    if (params.name === "generate_image") {
      const { prompt, style, num_images, size } = params.arguments || {};
      console.log("DEBUG: Input arguments received:", JSON.stringify(params.arguments, null, 2));
      
      if (!prompt) {
        throw new Error("Prompt is required");
      }

      const response = await falai.generateImage(prompt, style || "realistic", {
        num_images: num_images || 1,
        size: size || "square_hd",
      });

      // Return proper MCP content array format
      const result = {
        content: [
          {
            type: "text",
            text: `Successfully generated ${response.images.length} image(s) with style: ${style || "ghibli-style"}`
          },
          {
            type: "text",
            text: JSON.stringify({
              images: response.images.map(img => ({
                url: img.data,
                width: img.width,
                height: img.height,
                content_type: img.contentType
              })),
              prompt: response.prompt,
              seed: response.seed,
              has_nsfw_concepts: response.hasNsfwConcepts
            }, null, 2)
          }
        ]
      };
      
      console.log("DEBUG: Output result being returned:", JSON.stringify(result, null, 2));
      return result;
    } else if (params.name === "upscale_image") {
      const { image_url } = params.arguments || {};
      if (!image_url) {
        throw new Error("Image URL is required");
      }

      const result = await fal.subscribe("fal-ai/esrgan", {
        input: {
          image_url,
          scale: 4,
        },
      });

      return {
        content: [
          {
            type: "text",
            text: "Successfully upscaled image by 4x",
          },
          {
            type: "image",
            data: result.data.image.url,
            mimeType: "image/jpeg",
          },
        ],
      };
    } else if (params.name === "search-and-replace") {
      const { image_url, mask_url, prompt } = params.arguments || {};
      if (!image_url || !mask_url || !prompt) {
        throw new Error("Image URL, mask URL, and prompt are required");
      }

      const result = await fal.subscribe("fal-ai/inpaint", {
        input: {
          model_name: "diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
          prompt,
          image_url,
          mask_url,
        },
      });

      return {
        content: [
          {
            type: "text",
            text: "Successfully processed image with inpainting",
          },
          {
            type: "image",
            data: result.data.image.url,
            mimeType: "image/jpeg",
          },
        ],
      };
    } else {
      throw new Error("Unknown tool name");
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  try {
    if (mode === "rest") {
      const transport = new RestServerTransport({
        port,
        endpoint,
      });
      await server.connect(transport);
      await transport.startServer();
    } else {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    }

    // Keep the process running
    process.stdin.resume();

    // Handle process termination
    process.on("SIGTERM", () => {
      process.exit(0);
    });

    process.on("SIGINT", () => {
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
