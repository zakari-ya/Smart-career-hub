import { describe, it, expect } from "vitest";
import { cn, sanitize } from "../../src/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge tailwind classes properly", () => {
      expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
    });

    it("should override tailwind classes logically", () => {
      // tailwind-merge resolves conflicts
      expect(cn("p-2", "p-4")).toBe("p-4");
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });

    it("should handle conditional classes", () => {
      const isTrue = true;
      const isFalse = false;
      expect(cn("p-2", isTrue && "bg-red-500", isFalse && "text-white")).toBe("p-2 bg-red-500");
    });
  });

  describe("sanitize", () => {
    it("should sanitize malicious HTML", () => {
      const malicious = `<script>alert('xss')</script><p>Safe Content</p>`;
      const clean = sanitize(malicious);
      expect(clean).not.toContain("<script>");
      expect(clean).toContain("<p>Safe Content</p>");
    });

    it("should allow safe HTML", () => {
      const safe = `<strong>Bold</strong> and <em>Italic</em>`;
      const clean = sanitize(safe);
      expect(clean).toBe(safe);
    });
  });
});
