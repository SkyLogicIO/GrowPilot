import { NextRequest, NextResponse } from "next/server";
import { 
  GoogleGenAI, 
  GenerateImagesParameters, 
  GenerateImagesConfig,
  EditImageParameters,
  SubjectReferenceImage 
} from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let prompt = "";
    let apiKey = "";
    let inputImage: Blob | null = null;
    let modelName = "imagen-4.0-generate-001";  // Updated to Imagen 4.0
    
    // Use official SDK config types
    const config: GenerateImagesConfig = {
      numberOfImages: 1,
      aspectRatio: "1:1",  // Default: 1:1 (supported: "1:1", "3:4", "4:3", "9:16", "16:9")
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      prompt = (formData.get("prompt") as string) || "";
      apiKey = (formData.get("api_key") as string) || "";
      const model = formData.get("model") as string;
      if (model) modelName = model;
      
      // Parse optional image generation parameters
      const numberOfImages = formData.get("numberOfImages") as string;
      if (numberOfImages) {
        const parsed = parseInt(numberOfImages, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
          config.numberOfImages = parsed;
        }
      }
      
      const aspectRatio = formData.get("aspectRatio") as string;
      const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      if (aspectRatio && validAspectRatios.includes(aspectRatio)) {
        config.aspectRatio = aspectRatio;
      }
      
      const imageSize = formData.get("imageSize") as string;
      if (imageSize === "1K" || imageSize === "2K") {
        config.imageSize = imageSize;
      }
      
      const imageFile = formData.get("image");
      if (imageFile instanceof Blob) {
        inputImage = imageFile;
      }
    } else {
      const json = await req.json();
      prompt = json.prompt || "";
      apiKey = json.api_key || "";
      if (json.model) modelName = json.model;
      
      // Parse optional image generation parameters
      if (json.numberOfImages !== undefined) {
        const parsed = typeof json.numberOfImages === 'number' ? json.numberOfImages : parseInt(String(json.numberOfImages), 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) {
          config.numberOfImages = parsed;
        }
      }
      
      const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      if (json.aspectRatio && validAspectRatios.includes(json.aspectRatio)) {
        config.aspectRatio = json.aspectRatio;
      }
      
      if (json.imageSize === "1K" || json.imageSize === "2K") {
        config.imageSize = json.imageSize;
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is required" }, { status: 401 });
    }

    console.log(`📋 Using model: ${modelName}`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`⚙️  Config:`, JSON.stringify(config, null, 2));
    if (inputImage) {
      console.log(`📷 Input image provided: ${inputImage.type}, ${(inputImage.size / 1024).toFixed(2)} KB`);
    }

    // Initialize GoogleGenAI client
    const ai = new GoogleGenAI({ apiKey });

    console.log('🚀 Submitting image generation request...');

    let response;

    // Check if we have an input image
    if (inputImage) {
      // Image editing mode - use editImage API with reference image
      const buffer = Buffer.from(await inputImage.arrayBuffer());
      const base64Image = buffer.toString("base64");
      
      // Use imagen-3.0-capability-001 for editing (as per official example)
      const editModel = "imagen-3.0-capability-001";
      
      const subjectReferenceImage = new SubjectReferenceImage();
      subjectReferenceImage.referenceImage = {
        imageBytes: base64Image,
        mimeType: inputImage.type || "image/jpeg"
      };
      subjectReferenceImage.referenceId = 1;

      const editImageParams: EditImageParameters = {
        model: editModel,
        prompt: prompt,
        referenceImages: [subjectReferenceImage],
        config: {
          numberOfImages: config.numberOfImages,
        }
      };

      console.log(`🎨 Using editImage API with model: ${editModel}`);
      response = await ai.models.editImage(editImageParams);
    } else {
      // Text-to-image mode - use generateImages API
      const generateImageParams: GenerateImagesParameters = {
        model: modelName,
        prompt: prompt,
        config: config,
      };

      console.log(`🖼️  Using generateImages API with model: ${modelName}`);
      response = await ai.models.generateImages(generateImageParams);
    }
    
    if (!response.generatedImages || response.generatedImages.length === 0) {
      return NextResponse.json(
        { error: '图片生成完成但没有返回图片', raw_response: response },
        { status: 500 }
      );
    }

    const firstImage = response.generatedImages[0];
    if (!firstImage?.image?.imageBytes) {
      return NextResponse.json(
        { error: '生成的图片缺少数据', raw_response: firstImage },
        { status: 500 }
      );
    }

    // Convert base64 to data URL
    const mimeType = firstImage.image.mimeType || "image/jpeg";
    const imageDataUrl = `data:${mimeType};base64,${firstImage.image.imageBytes}`;

    console.log('✅ Image generated successfully!');

    return NextResponse.json({ 
      success: true, 
      type: "image",
      image_url: imageDataUrl,
      content: prompt,
      model: modelName,
      enhanced_prompt: firstImage.enhancedPrompt,
    });

  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
