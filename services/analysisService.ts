import { GoogleGenAI } from "@google/genai";

/**
 * Compresses an image file before uploading.
 * @param file The original image file.
 * @param maxWidth The maximum width/height of the compressed image.
 * @param quality The JPEG quality (0 to 1).
 * @returns A promise that resolves with the compressed image file.
 */
const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed'));
            }
            // Create a new file with a consistent .jpg extension
            const fileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.jpg';
            const compressedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function analyzeImage(imageFile: File, language: 'English' | 'Hindi' | 'Bengali' = 'English'): Promise<string> {
  const webhookUrl = "https://belva-subarid-desiree.ngrok-free.dev/webhook-test/4dc9e45d-c64e-4a07-80b6-e320f34df0a7";

  // Let compression errors fail fast; no need to retry those.
  console.log(`Original image size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
  const compressedFile = await compressImage(imageFile);
  console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
  
  const formData = new FormData();
  formData.append('image', compressedFile, compressedFile.name);
  formData.append('language', language);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Analysis attempt ${attempt}...`);
      }
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      // Don't retry on client errors (4xx) as they are likely permanent for this request
      if (response.status >= 400 && response.status < 500) {
          const errorText = await response.text();
          // This is a final error, throw it and exit the retry loop.
          throw new Error(`Analysis service rejected the request: ${response.status} ${response.statusText} - ${errorText || '(no error body)'}`);
      }
      
      if (!response.ok) {
          const errorText = await response.text();
          // This will now mostly be for 5xx errors which are worth retrying
          throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText || '(no error body)'}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        // Treat empty response as a retryable error
        throw new Error("The analysis service returned a successful but empty response.");
      }

      // If we get here, the request was successful and has a body.
      try {
        const webhookResponse = JSON.parse(responseText);
        // The webhook response structure is an object: `{ "text": "..." }`
        const analysisText = webhookResponse?.text;

        if (typeof analysisText === 'string') {
          return analysisText; // SUCCESS!
        }
        
        console.warn("Unexpected webhook response structure. Could not find 'text' property.", webhookResponse);
        return `Could not find analysis text in the response. The service returned:\n\n${JSON.stringify(webhookResponse, null, 2)}`;
      } catch (e) {
        console.warn("Response was not valid JSON, treating as plain text.");
        return responseText; // SUCCESS (with plain text)
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // If the loop finishes, all retries have failed.
  throw new Error(`Failed to get a response from the analysis service after ${MAX_RETRIES} attempts. The service may be temporarily unavailable. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Translates a given text to the target language using the Gemini API.
 * @param text The text to translate.
 * @param targetLanguage The language to translate to.
 * @returns A promise that resolves with the translated text, or the original text on failure.
 */
export async function translateText(text: string, targetLanguage: 'Hindi' | 'English' | 'Bengali'): Promise<string> {
    if (!text) return "";
    
    // Logic to skip English translation removed to allow re-translation back to English from other languages.

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate the following text to ${targetLanguage}. Do not translate technical terms, botanical names, or proper nouns unless it is natural to do so in ${targetLanguage}. Maintain the original markdown formatting (like **bold** text):\n\n---\n\n${text}`,
        });

        const translatedText = response.text;
        if (!translatedText) {
            throw new Error("Translation service returned an empty response.");
        }
        return translatedText;
    } catch (error) {
        console.error(`Error translating text to ${targetLanguage}:`, error);
        // Fallback to the original text if translation fails to avoid showing nothing.
        return text;
    }
}