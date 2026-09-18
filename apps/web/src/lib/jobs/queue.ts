export const COMPRESSION_QUEUE_NAME = "compress-video";

export type VideoCompressionJobData = {
  jobId: string;
  inputPath: string;
  outputPath: string;
  sourceObjectKey?: string;
  outputObjectKey?: string;
  userId?: string | null;
};

export type CompressionQueueJob = {
  name: string;
  data: VideoCompressionJobData;
};

export type CompressionQueue = {
  add: (name: string, data: VideoCompressionJobData) => Promise<CompressionQueueJob>;
};

export function createCompressionQueue(): CompressionQueue {
  return {
    async add(name: string, data: VideoCompressionJobData): Promise<CompressionQueueJob> {
      return { name, data };
    }
  };
}
