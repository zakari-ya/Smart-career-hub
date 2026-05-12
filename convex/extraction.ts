"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { validateExtraction } from "./lib/parser";

/**
 * PHASE 1: Fast Text Extraction
 * Takes a file (as base64 or buffer) and returns validated text instantly.
 */
export const extractText = action({
  args: {
    fileBase64: v.string(), // Base64 encoded file content
    fileName: v.string(),
    fileType: v.string(), // "pdf", "docx", "txt", "md"
    storageId: v.optional(v.id("_storage")),
    resumeId: v.optional(v.id("resumes")),
  },
  handler: async (ctx, args) => {
    try {
      let buffer: Buffer;

      // 1. Get file content (either from base64 or from Convex storage)
      if (args.fileBase64 && args.fileBase64.length > 0) {
        buffer = Buffer.from(args.fileBase64, "base64");
      } else if (args.storageId) {
        const fileData = await ctx.storage.get(args.storageId);
        if (!fileData) {
          return { success: false, error: "File not found in storage." };
        }
        buffer = Buffer.from(await fileData.arrayBuffer());
      } else {
        return { success: false, error: "No file content or storage ID provided." };
      }
      
      // 2. Determine MIME type
      let mimeType = "text/plain";
      if (args.fileType === "pdf") mimeType = "application/pdf";
      if (args.fileType === "docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      // 3. Extract text using our library
      const { extractText: parseFile } = await import("./lib/parser");
      const rawText = await parseFile(buffer, mimeType);

      // 4. Validate quality (Substep 5A logic)
      const validation = validateExtraction(rawText);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      if (args.resumeId) {
        const { internal } = await import("./_generated/api");
        await ctx.runMutation(internal.resumes.updateExtractedTextInternal, {
          resumeId: args.resumeId,
          text: rawText,
        });
      }

      return { 
        success: true, 
        extractedText: rawText 
      };
    } catch (err) {
      console.error("[Extraction Error]:", err);
      return { 
        success: false, 
        error: "Failed to read file. Please ensure it's a valid PDF or Word document." 
      };
    }
  },
});
