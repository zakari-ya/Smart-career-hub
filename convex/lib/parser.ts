"use node";

import pdf from "pdf-parse/lib/pdf-parse.js";

/**
 * Extracts text from a PDF buffer.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse v1.1.1 is a function that returns a promise
    const data = (await pdf(buffer)) as { text: string };
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Validates the quality and relevance of extracted text.
 * Prevents hallucinations by ensuring the text is readable and structural.
 */
export function validateExtraction(extractedText: string): { valid: boolean; error?: string } {
  // 1. Reject if empty or too short
  if (!extractedText || extractedText.trim().length < 50) {
    return { 
      valid: false, 
      error: "Could not extract text from this file. The PDF may be image-based (scanned) or corrupted. Please upload a text-based PDF, Markdown, or TXT file." 
    };
  }
  
  // 2. Reject if garbled (high ratio of non-printable chars)
  const printableChars = extractedText.replace(/[^\x20-\x7E\s]/g, '');
  const printableRatio = printableChars.length / extractedText.length;
  if (printableRatio < 0.7) {
    return { 
      valid: false, 
      error: "The extracted text appears corrupted or unreadable. Please try uploading a .txt or .md file instead." 
    };
  }
  
  // 3. Reject if it doesn't look like a resume (no resume keywords)
  const resumeKeywords = ['experience', 'education', 'skills', 'work', 'job', 'degree', 'contact', 'email', 'phone', 'summary', 'objective'];
  const lowerText = extractedText.toLowerCase();
  const hasResumeStructure = resumeKeywords.some(kw => lowerText.includes(kw));
  if (!hasResumeStructure) {
    return { 
      valid: false, 
      error: "This file doesn't appear to contain a resume. Please upload a valid resume in PDF, Markdown, or text format." 
    };
  }
  
  return { valid: true };
}

/**
 * Orchestrates text extraction based on file type.
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === "application/pdf") {
    return await extractTextFromPdf(buffer);
  }

  // Fallback for text-based files
  return buffer.toString("utf-8");
}
