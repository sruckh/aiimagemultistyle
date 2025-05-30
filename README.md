# MCP Image Generator

A Model Context Protocol (MCP) server for image generation and manipulation using fal.ai's Stable Diffusion model.

## Features

- Generate high-quality images from text prompts
- Support for multiple anime and artistic styles:
  - Ghibli Style
  - Pixar Style
  - Pokemon Style
  - Genshin Impact Style
  - Cyberpunk Style
  - One Piece Style
  - Attack on Titan Style
  - Shinkai Makoto Style
  - Sailor Moon Style
  - Evangelion Style
  - Disney Princess Style
  - Kyoto Animation Style
  - Dreamworks Animation Style
  - Marvel Studios Style
  - DC Comics Style
  - Kawaii Pastel Style
  - Simpsons Style
  - Dragon Ball Style
  - Demon Slayer Style
  - Warner Bros Animation Style
  - Dark Fantasy Style
  - And many more Japanese anime styles
- Multiple image size options:
  - Square (512x512)
  - Square HD (1024x1024)
  - Portrait 4:3 (768x1024)
  - Portrait 16:9 (576x1024)
  - Landscape 4:3 (1024x768)
  - Landscape 16:9 (1024x576)
- Generate multiple images in one request (up to 4)
- Image upscaling (4x resolution enhancement)
- Image search and replace functionality
- Built-in NSFW content detection

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd mcp-falai
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file with the following content:

```
FALAI_API_KEY=your_fal_ai_key_here
```

## Usage

### MCP Server Configuration

To use the MCP Image Generator server, add it to your `mcpServers` configuration:

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "npx",
      "args": ["-y", "mcp-falai"]
    }
  }
}
```

You can also specify additional configuration options:

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-falai",
        "--mode=rest",
        "--port=9593",
        "--endpoint=/rest"
      ],
      "env": {
        "FALAI_API_KEY": "your_fal_ai_key_here"
      }
    }
  }
}
```

### Starting the Server

The server can run in two modes:

1. STDIO mode (default):

```bash
npm start
```

2. REST mode:

```bash
npm start -- --mode=rest --port=9593 --endpoint=/rest
```

### API Reference

#### Generate Image

**Request Format:**

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "A beautiful sunset over mountains",
    "style": "ghibli-style",
    "num_images": 1,
    "size": "square_hd"
  }
}
```

**Parameters:**

- `prompt` (required): Text description of the image to generate
- `style` (optional): Image style (default: "ghibli-style")
  - Available styles: See the Features section above for the complete list
- `num_images` (optional): Number of images to generate (1-4, default: 1)
- `size` (optional): Image size (default: "square_hd")
  - Available sizes: "square", "square_hd", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"

#### Upscale Image

**Request Format:**

```json
{
  "name": "upscale_image",
  "arguments": {
    "image_url": "https://example.com/image.jpg"
  }
}
```

**Parameters:**

- `image_url` (required): URL of the image to upscale

#### Search and Replace

**Request Format:**

```json
{
  "name": "search-and-replace",
  "arguments": {
    "image_url": "https://example.com/image.jpg",
    "mask_url": "https://example.com/mask.jpg",
    "prompt": "Description of the replacement"
  }
}
```

**Parameters:**

- `image_url` (required): URL of the image to edit
- `mask_url` (required): URL of the mask image (black areas preserved, white areas inpainted)
- `prompt` (required): Description of the replacement content

## Development

- `npm run build`: Build the project
- `npm run watch`: Watch mode for development
- `npm run inspector`: Run MCP inspector

## Error Handling

The server provides detailed error messages for common issues:

- Missing API key
- Invalid prompt
- Invalid style or size parameters
- API request failures
- NSFW content detection

## License

MIT
