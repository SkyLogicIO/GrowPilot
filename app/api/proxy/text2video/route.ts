import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, GenerateVideosParameters, GenerateVideosConfig } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let prompt = "";
    let apiKey = "";
    let inputImage: Blob | null = null;
    let modelName = "veo-3.1-fast-generate-preview";

    const config: GenerateVideosConfig = {
      numberOfVideos: 1,
      durationSeconds: 5,
      resolution: "720p",
      aspectRatio: "16:9",
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      prompt = (formData.get("prompt") as string) || "";
      apiKey = (formData.get("api_key") as string) || "";
      const model = formData.get("model") as string;
      if (model) modelName = model;

      const durationStr = formData.get("duration") as string;
      if (durationStr) {
        const parsed = parseInt(durationStr, 10);
        if (!isNaN(parsed) && parsed >= 4 && parsed <= 8) {
          config.durationSeconds = parsed;
        }
      }

      const resolutionStr = formData.get("resolution") as string;
      if (resolutionStr === "720p" || resolutionStr === "1080p") {
        config.resolution = resolutionStr;
      }

      const aspectRatioStr = formData.get("aspect_ratio") as string;
      if (aspectRatioStr === "16:9" || aspectRatioStr === "9:16") {
        config.aspectRatio = aspectRatioStr;
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

      if (json.duration !== undefined) {
        const parsed =
          typeof json.duration === "number"
            ? json.duration
            : parseInt(String(json.duration), 10);
        if (!isNaN(parsed) && parsed >= 4 && parsed <= 8) {
          config.durationSeconds = parsed;
        }
      }

      if (json.resolution === "720p" || json.resolution === "1080p") {
        config.resolution = json.resolution;
      }

      if (json.aspect_ratio === "16:9" || json.aspect_ratio === "9:16") {
        config.aspectRatio = json.aspect_ratio;
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is required" }, { status: 401 });
    }

    if (!config.durationSeconds || config.durationSeconds < 4 || config.durationSeconds > 8) {
      return NextResponse.json(
        {
          error: "Invalid duration parameter",
          message: `durationSeconds must be between 4-8, got: ${config.durationSeconds}`,
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const generateVideoParams: GenerateVideosParameters = {
      model: modelName,
      config: {
        numberOfVideos: config.numberOfVideos,
        durationSeconds: config.durationSeconds,
        aspectRatio: config.aspectRatio,
        resolution: config.resolution,
      },
    };

    if (inputImage) {
      const buffer = Buffer.from(await inputImage.arrayBuffer());
      generateVideoParams.source = {
        prompt,
        image: {
          imageBytes: buffer.toString("base64"),
          mimeType: inputImage.type || "image/jpeg",
        },
      };
    } else {
      generateVideoParams.source = { prompt };
    }

    let operation = await ai.models.generateVideos(generateVideoParams);

    let attempts = 0;
    const maxAttempts = 30;

    while (!operation.done && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      attempts++;
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done) {
      return NextResponse.json(
        {
          error: "视频生成超时",
          message: `生成时间超过 ${maxAttempts * 10} 秒。操作ID: ${operation.name}`,
          operation_name: operation.name,
        },
        { status: 408 }
      );
    }

    if (operation?.response) {
      const videos = operation.response.generatedVideos;

      if (!videos || videos.length === 0) {
        return NextResponse.json(
          { error: "视频生成完成但没有返回视频", raw_response: operation.response },
          { status: 500 }
        );
      }

      const firstVideo = videos[0];
      if (!firstVideo?.video?.uri) {
        return NextResponse.json(
          { error: "生成的视频缺少URI", raw_response: firstVideo },
          { status: 500 }
        );
      }

      const videoUri = firstVideo.video.uri
        ? decodeURIComponent(firstVideo.video.uri)
        : "";

      if (!videoUri) {
        return NextResponse.json(
          { error: "视频URI为空", raw_response: firstVideo.video },
          { status: 500 }
        );
      }

      const videoUrl = `${videoUri}&key=${apiKey}`;
      const videoResponse = await fetch(videoUrl);

      if (!videoResponse.ok) {
        return NextResponse.json(
          {
            error: `获取视频文件失败: ${videoResponse.status} ${videoResponse.statusText}`,
            video_uri: videoUri,
          },
          { status: 500 }
        );
      }

      const videoBlob = await videoResponse.blob();
      const videoBuffer = Buffer.from(await videoBlob.arrayBuffer());
      const videoBase64 = videoBuffer.toString("base64");
      const videoDataUrl = `data:${videoBlob.type};base64,${videoBase64}`;

      return NextResponse.json({
        success: true,
        type: "video",
        video_url: videoDataUrl,
        video_uri: videoUri,
        content: prompt,
        model: modelName,
        duration: config.durationSeconds,
        resolution: config.resolution,
        aspect_ratio: config.aspectRatio,
        size_mb: (videoBlob.size / 1024 / 1024).toFixed(2),
      });
    } else {
      return NextResponse.json(
        {
          error: "视频生成失败",
          message: operation.error?.message || "未知错误",
          raw_operation: operation,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "未知错误";
    console.error("text2video error:", message);
    return NextResponse.json(
      { error: "视频生成失败", message },
      { status: 500 }
    );
  }
}
