"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

type EncodeWavParams = {
  samples: Float32Array;
  sampleRate: number;
};

const encodeWav = ({ samples, sampleRate }: EncodeWavParams): Blob => {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const s = clamp(samples[i], -1, 1);
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
};

type SynthLocalAudioParams = {
  text: string;
};

const synthLocalAudio = ({ text }: SynthLocalAudioParams): Blob => {
  const sampleRate = 44100;
  const durationSec = clamp(Math.ceil(text.length / 40), 2, 10);
  const total = durationSec * sampleRate;
  const samples = new Float32Array(total);

  const baseFreq = 220;
  const modFreq = 4;
  const amp = 0.22;
  const fade = Math.floor(sampleRate * 0.02);

  for (let i = 0; i < total; i += 1) {
    const t = i / sampleRate;
    const mod = 1 + 0.15 * Math.sin(2 * Math.PI * modFreq * t);
    let s = amp * Math.sin(2 * Math.PI * baseFreq * mod * t);
    if (i < fade) s *= i / fade;
    if (i > total - fade) s *= (total - i) / fade;
    samples[i] = s;
  }

  return encodeWav({ samples, sampleRate });
};

const formatTime = (value: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${mm}/${dd} ${hh}:${mi}`;
};

type DemoItemBase = {
  id: string;
  title: string;
  updatedAt: string;
  seedText: string;
};

const DEMO_ITEMS: DemoItemBase[] = [
  {
    id: "demo_1",
    title: "客服欢迎语（标准）",
    updatedAt: "2025-12-18T08:12:00.000Z",
    seedText: "您好，欢迎致电客服中心，请问有什么可以帮您？",
  },
  {
    id: "demo_2",
    title: "课程开场白（多语言）",
    updatedAt: "2025-12-17T15:40:00.000Z",
    seedText: "Hello, welcome to today's lesson. Let's get started.",
  },
  {
    id: "demo_3",
    title: "卖货口播（节奏快）",
    updatedAt: "2025-12-16T11:05:00.000Z",
    seedText: "家人们！今天这款真的太划算了，限时优惠马上结束！",
  },
  {
    id: "demo_4",
    title: "新闻播报（清晰）",
    updatedAt: "2025-12-15T09:22:00.000Z",
    seedText: "今日要闻：本地消费热度持续上涨，多行业迎来增长。",
  },
  {
    id: "demo_5",
    title: "情感口播（温柔）",
    updatedAt: "2025-12-14T20:18:00.000Z",
    seedText: "别着急，慢慢来。你值得被认真对待，也值得更好的生活。",
  },
  {
    id: "demo_6",
    title: "助理提示音（短句）",
    updatedAt: "2025-12-13T12:02:00.000Z",
    seedText: "正在为您查询，请稍等。",
  },
];

type DemoFileRow = DemoItemBase & {
  file: File;
  url: string;
};

export default function VoiceCopy() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [text, setText] = useState("您好，请根据这段示例文本生成新的语音文件。支持替换成您需要的文案。");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("voice_copy.wav");
  const [demoFiles, setDemoFiles] = useState<DemoFileRow[]>([]);

  const safeText = useMemo(() => text.slice(0, 250), [text]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  useEffect(() => {
    const next: DemoFileRow[] = DEMO_ITEMS.map((item) => {
      const blob = synthLocalAudio({ text: item.seedText });
      const file = new File([blob], `${item.title}.wav`, { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      return { ...item, file, url };
    });
    setDemoFiles(next);
    return () => {
      next.forEach((x) => URL.revokeObjectURL(x.url));
    };
  }, []);

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAudioFile(f);
  };

  const onSynthesize = () => {
    if (!audioFile) return;
    if (!safeText.trim()) return;
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    const blob = synthLocalAudio({ text: safeText });
    setOutputName(`语音复制_${Date.now()}.wav`);
    setOutputUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="brut-card-static p-6">
          <div className="text-text-primary font-black text-lg">语音复制</div>
          <div className="mt-1 text-sm text-text-secondary">上传音频并输入文本，生成新的语音文件（示例流程）。</div>

          <div className="mt-5 rounded-xl border-2 border-border bg-surface-hover p-4">
            <div className="text-sm font-bold text-text-secondary">历史 Demo 音频</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {demoFiles.map((item) => {
                const selected = audioFile?.name === item.file.name;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAudioFile(item.file)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      selected
                        ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                        : "border-border bg-surface hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-text-primary font-bold truncate">{item.title}</div>
                        <div className="mt-1 text-xs text-text-muted">{formatTime(item.updatedAt)}</div>
                      </div>
                      <div
                        className={`shrink-0 h-8 px-3 rounded-lg text-xs font-bold flex items-center justify-center border-2 ${
                          selected ? "bg-accent text-white border-accent" : "bg-surface text-text-secondary border-border"
                        }`}
                      >
                        {selected ? "已选择" : "选择"}
                      </div>
                    </div>
                    <div className="mt-3">
                      <audio controls src={item.url} className="w-full" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-xl border-2 border-border bg-surface-hover p-4">
            <div className="text-sm font-bold text-text-secondary">上传音频</div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="file"
                accept="audio/*"
                onChange={onPickFile}
                className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-lg file:border-2 file:border-border file:bg-surface file:px-4 file:py-2 file:text-sm file:font-bold file:text-text-primary hover:file:bg-surface-hover"
              />
            </div>
            {audioFile && (
              <div className="mt-3 text-sm text-text-secondary">
                已选择：<span className="text-text-primary font-bold">{audioFile.name}</span>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border-2 border-border bg-surface-hover p-4">
            <div className="text-sm font-bold text-text-secondary">输入文字</div>
            <textarea
              value={safeText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              className="mt-3 w-full h-[180px] resize-none bg-transparent text-text-primary placeholder:text-text-muted outline-none"
              placeholder="请输入需要合成的文本"
            />
            <div className="mt-2 text-right text-xs text-text-muted">{safeText.length}/250</div>
          </div>

          <button
            type="button"
            onClick={onSynthesize}
            className={`mt-6 w-full h-12 brut-btn text-white ${
              audioFile && safeText.trim() ? "bg-accent" : "bg-text-muted cursor-not-allowed"
            }`}
          >
            立即合成
          </button>
        </div>

        <div className="brut-card-static p-6">
          <div className="text-text-primary font-black text-lg">合成结果</div>
          <div className="mt-1 text-sm text-text-secondary">生成完成后可试听与下载。</div>

          <div className="mt-5 rounded-xl border-2 border-border bg-surface-hover p-4">
            {outputUrl ? (
              <div>
                <audio controls src={outputUrl} className="w-full" />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-sm text-text-secondary truncate">{outputName}</div>
                  <a
                    href={outputUrl}
                    download={outputName}
                    className="shrink-0 h-10 px-5 brut-btn bg-surface text-text-primary text-sm"
                  >
                    下载
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-sm text-text-muted">请先上传音频并点击"立即合成"。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
