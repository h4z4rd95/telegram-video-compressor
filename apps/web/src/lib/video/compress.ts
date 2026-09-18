export type CompressionJobPaths = {
  inputPath: string;
  outputPath: string;
};

export type CompressionResult = {
  command: string[];
  outputPath: string;
};

export function buildCompressCommand(inputPath: string, outputPath: string): string[] {
  return ["ffmpeg", "-y", "-i", inputPath, "-vcodec", "libx264", "-crf", "32", outputPath];
}

export async function compressVideo(input: CompressionJobPaths): Promise<CompressionResult> {
  return {
    command: buildCompressCommand(input.inputPath, input.outputPath),
    outputPath: input.outputPath
  };
}
