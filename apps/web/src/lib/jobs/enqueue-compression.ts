import {
  COMPRESSION_QUEUE_NAME,
  createCompressionQueue,
  type CompressionQueue,
  type CompressionQueueJob,
  type VideoCompressionJobData
} from "@/lib/jobs/queue";

export async function enqueueCompression(
  data: VideoCompressionJobData,
  queue: CompressionQueue = createCompressionQueue()
): Promise<CompressionQueueJob> {
  return queue.add(COMPRESSION_QUEUE_NAME, data);
}
