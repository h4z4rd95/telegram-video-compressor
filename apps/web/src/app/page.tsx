import React from "react";

import { UploadDropzone } from "@/components/upload/upload-dropzone";

export default function HomePage() {
  return (
    <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <h1>Compress videos on the web</h1>
      <p>Upload, compress, and manage your quota from any device.</p>
      <div style={{ marginTop: "2rem" }}>
        <UploadDropzone />
      </div>
    </main>
  );
}
