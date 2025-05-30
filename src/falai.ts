import { fal } from "@fal-ai/client";

export type ImageStyle =
  | "realistic"
  | "anime"
  | "digital-art"
  | "photographic"
  | "cartoon"
  | "oil-painting"
  | "sketch";

export type ImageSize =
  | "square"
  | "square_hd"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export interface GenerateImageOptions {
  num_images?: number;
  size?: ImageSize;
}

export interface GeneratedImage {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
}

export interface GenerateImageResponse {
  images: GeneratedImage[];
  prompt: string;
  seed?: number;
  hasNsfwConcepts?: boolean[];
}

interface FastSdxlOutput {
  images: Array<{ url: string }>;
}

export class FalAiClient {
  constructor({ apiKey }: { apiKey: string }) {
    fal.config({ credentials: apiKey });
  }

  async generateImage(
    prompt: string,
    style: ImageStyle,
    options: GenerateImageOptions = {}
  ): Promise<GenerateImageResponse> {
    try {
      const { num_images = 1, size = "square_hd" } = options;

      const result = await fal.subscribe("fal-ai/flux/dev", {
        input: {
          prompt: `${prompt}, ${this.getNegativePrompt(style)}`,
          num_inference_steps: this.getInferenceSteps(style),
          num_images,
          image_size: size,
        },
      });

      console.log("FAL.ai API response:", result);

      // The result is already the final output
      // 确保图片数组格式正确
      const processedImages = (result.data.images || []).map((image: any) => {
        // 如果图片是对象格式，直接返回
        if (typeof image === "object" && image.url) {
          return image;
        }
        // 如果图片是字符串（URL），转换为对象格式
        return {
          url: image,
          contentType: "image/jpeg",
        };
      });

      return {
        images: processedImages,
        prompt: result.data.prompt,
        seed: result.data.seed,
        hasNsfwConcepts: result.data.has_nsfw_concepts,
      };
    } catch (error) {
      throw new Error(`Failed to generate image: ${(error as Error).message}`);
    }
  }

  private getNegativePrompt(style: ImageStyle): string {
    const stylePrompts: Record<ImageStyle, string> = {
      realistic: "cartoon, anime, illustration, painting, drawing, art",
      anime: "realistic, photograph, 3d",
      "digital-art": "photograph, realistic, 3d",
      photographic: "cartoon, anime, illustration, painting, drawing, art",
      cartoon: "realistic, photograph, 3d",
      "oil-painting": "photograph, realistic, 3d",
      sketch: "color, realistic, photograph",
    };

    return stylePrompts[style];
  }

  private getInferenceSteps(style: ImageStyle): number {
    const styleSteps: Record<ImageStyle, number> = {
      realistic: 30,
      anime: 30,
      "digital-art": 30,
      photographic: 30,
      cartoon: 30,
      "oil-painting": 40,
      sketch: 30,
    };

    return styleSteps[style];
  }
}
