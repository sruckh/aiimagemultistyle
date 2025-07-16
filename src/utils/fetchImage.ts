import { Buffer } from 'buffer';

export async function fetchImageAsBase64(url: string): Promise<{ data: string; contentType: string }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return { data: base64, contentType };
  } catch (error) {
    throw new Error(`Error fetching image: ${(error as Error).message}`);
  }
}
