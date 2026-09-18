export type VideoProbeResult = {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
};

export function buildFfprobeCommand(inputPath: string): string[] {
  return [
    "ffprobe",
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=width,height",
    "-of",
    "default=noprint_wrappers=1",
    inputPath
  ];
}

export async function probeVideo(_: string): Promise<VideoProbeResult> {
  return {
    durationSeconds: null,
    width: null,
    height: null
  };
}
