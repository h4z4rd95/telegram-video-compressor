import { COMPRESSION_QUEUE_NAME, type VideoCompressionJobData } from "@/lib/jobs/queue";
import { compressVideo, type CompressionResult } from "@/lib/video/compress";

export type CompressionWorkerHooks = {
  markJobProcessing: (jobId: string) => Promise<void>;
  markJobCompleted: (jobId: string, result: CompressionResult) => Promise<void>;
  markJobFailed?: (jobId: string, error: Error) => Promise<void>;
};

export type CompressionWorkerJob = {
  name?: string;
  data: VideoCompressionJobData;
};

export function createCompressionWorker(hooks: CompressionWorkerHooks) {
  return {
    queueName: COMPRESSION_QUEUE_NAME,
    async process(job: CompressionWorkerJob): Promise<CompressionResult> {
      if (job.name && job.name !== COMPRESSION_QUEUE_NAME) {
        throw new Error(`Unsupported worker job: ${job.name}`);
      }

      await hooks.markJobProcessing(job.data.jobId);

      try {
        const result = await compressVideo({
          inputPath: job.data.inputPath,
          outputPath: job.data.outputPath
        });

        await hooks.markJobCompleted(job.data.jobId, result);
        return result;
      } catch (error) {
        if (hooks.markJobFailed && error instanceof Error) {
          await hooks.markJobFailed(job.data.jobId, error);
        }

        throw error;
      }
    }
  };
}
