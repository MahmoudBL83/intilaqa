/**
 * Export Service
 * Handles exporting data to various formats (CSV, JSON, Excel)
 */
export class ExportService {
  /**
   * Convert array of objects to CSV format
   */
  static toCsv(
    data: Array<Record<string, any>>,
    filename: string,
    options?: {
      headers?: string[];
      formatters?: Record<string, (value: any) => string>;
    }
  ): { filename: string; content: string; mimeType: string } {
    if (data.length === 0) {
      return {
        filename,
        content: "",
        mimeType: "text/csv",
      };
    }

    const headers = options?.headers || Object.keys(data[0]!);
    const formatters = options?.formatters || {};

    // CSV Header
    const csvHeaders = headers
      .map((h) => this.escapeCsvField(h))
      .join(",");

    // CSV Rows
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];

          // Apply custom formatter if available
          if (formatters[header]) {
            value = formatters[header](value);
          }

          // Format value
          if (value === null || value === undefined) {
            return "";
          }

          if (typeof value === "object") {
            value = JSON.stringify(value);
          }

          return this.escapeCsvField(String(value));
        })
        .join(",")
    );

    const content = [csvHeaders, ...csvRows].join("\n");

    return {
      filename: `${filename}.csv`,
      content,
      mimeType: "text/csv",
    };
  }

  /**
   * Escape CSV field if it contains comma, quote, or newline
   */
  private static escapeCsvField(field: string): string {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Generate JSON export
   */
  static toJson(
    data: Array<Record<string, any>>,
    filename: string,
    options?: {
      pretty?: boolean;
    }
  ): { filename: string; content: string; mimeType: string } {
    const content = options?.pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);

    return {
      filename: `${filename}.json`,
      content,
      mimeType: "application/json",
    };
  }

  /**
   * Generate simple Excel format (XLSX-like structure)
   * Note: For production, consider using libraries like exceljs or xlsx
   */
  static toExcelSimple(
    data: Array<Record<string, any>>,
    filename: string,
    options?: {
      sheetName?: string;
      headers?: string[];
      formatters?: Record<string, (value: any) => string>;
    }
  ): string {
    const csv = this.toCsv(data, filename, {
      headers: options?.headers,
      formatters: options?.formatters,
    });
    return `${filename}.xlsx (CSV format)\n${csv.content}`;
  }

  /**
   * Generate real Excel (.xlsx) file
   */
  static async toExcel(
    data: Array<Record<string, any>>,
    filename: string,
    options?: { sheetName?: string; headers?: string[] }
  ): Promise<Buffer> {
    const XLSX = await import("xlsx");
    const sheetName = options?.sheetName || "Sheet1";
    const headers = options?.headers || (data.length > 0 ? Object.keys(data[0]!) : []);

    const rows = data.map((row) => {
      const r: Record<string, unknown> = {};
      for (const h of headers) r[h] = row[h];
      return r;
    });

    const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  }

  /**
   * Generate PDF from data table
   */
  static async toPdf(
    data: Array<Record<string, any>>,
    title: string,
    options?: { headers?: string[] }
  ): Promise<Buffer> {
    const { jsPDF } = await import("jspdf");
    const headers = options?.headers || (data.length > 0 ? Object.keys(data[0]!) : ["No data"]);
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(8);

    const startY = 30;
    const rowH = 7;
    const cols = headers.length;
    const colW = (doc.internal.pageSize.getWidth() - 28) / cols;

    // Header row
    doc.setFillColor(240, 240, 240);
    headers.forEach((h, i) => {
      doc.rect(14 + i * colW, startY, colW, rowH, "F");
      doc.text(String(h).substring(0, 30), 14 + i * colW + 1, startY + 5);
    });

    // Data rows
    data.slice(0, 50).forEach((row, ri) => {
      const y = startY + (ri + 1) * rowH;
      headers.forEach((h, ci) => {
        const val = String(row[h] ?? "").substring(0, 30);
        doc.text(val, 14 + ci * colW + 1, y + 5);
      });
    });

    return Buffer.from(doc.output("arraybuffer"));
  }

  /**
   * Generate HTML table export
   */
  static toHtml(
    data: Array<Record<string, any>>,
    title: string,
    options?: {
      headers?: string[];
      formatters?: Record<string, (value: any) => string>;
    }
  ): { filename: string; content: string; mimeType: string } {
    if (data.length === 0) {
      return {
        filename: `${title}.html`,
        content: `<html><body><h1>${title}</h1><p>No data</p></body></html>`,
        mimeType: "text/html",
      };
    }

    const headers = options?.headers || Object.keys(data[0]!);
    const formatters = options?.formatters || {};

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead>
      <tr>
`;

    // Headers
    headers.forEach((header) => {
      html += `        <th>${this.escapeHtml(String(header))}</th>\n`;
    });

    html += `      </tr>
    </thead>
    <tbody>
`;

    // Rows
    data.forEach((row) => {
      html += "      <tr>\n";
      headers.forEach((header) => {
        let value = row[header];

        if (formatters[header]) {
          value = formatters[header](value);
        }

        if (value === null || value === undefined) {
          value = "";
        }

        html += `        <td>${this.escapeHtml(String(value))}</td>\n`;
      });
      html += "      </tr>\n";
    });

    html += `    </tbody>
  </table>
</body>
</html>`;

    return {
      filename: `${title}.html`,
      content: html,
      mimeType: "text/html",
    };
  }

  /**
   * Escape HTML special characters
   */
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Generate TSV (Tab-Separated Values) format
   */
  static toTsv(
    data: Array<Record<string, any>>,
    filename: string,
    options?: {
      headers?: string[];
      formatters?: Record<string, (value: any) => string>;
    }
  ): { filename: string; content: string; mimeType: string } {
    if (data.length === 0) {
      return {
        filename: `${filename}.tsv`,
        content: "",
        mimeType: "text/tab-separated-values",
      };
    }

    const headers = options?.headers || Object.keys(data[0]!);
    const formatters = options?.formatters || {};

    // TSV Header
    const tsvHeaders = headers.join("\t");

    // TSV Rows
    const tsvRows = data.map((row) =>
      headers
        .map((header) => {
          let value = row[header];

          if (formatters[header]) {
            value = formatters[header](value);
          }

          if (value === null || value === undefined) {
            return "";
          }

          if (typeof value === "object") {
            value = JSON.stringify(value);
          }

          // Escape tabs and newlines
          return String(value)
            .replace(/\t/g, "\\t")
            .replace(/\n/g, "\\n");
        })
        .join("\t")
    );

    const content = [tsvHeaders, ...tsvRows].join("\n");

    return {
      filename: `${filename}.tsv`,
      content,
      mimeType: "text/tab-separated-values",
    };
  }

  /**
   * Generate Markdown table export
   */
  static toMarkdown(
    data: Array<Record<string, any>>,
    title: string,
    options?: {
      headers?: string[];
      formatters?: Record<string, (value: any) => string>;
    }
  ): { filename: string; content: string; mimeType: string } {
    if (data.length === 0) {
      return {
        filename: `${title}.md`,
        content: `# ${title}\n\nNo data available.`,
        mimeType: "text/markdown",
      };
    }

    const headers = options?.headers || Object.keys(data[0]!);
    const formatters = options?.formatters || {};

    let markdown = `# ${title}\n\n`;

    // Table header
    markdown += "| " + headers.join(" | ") + " |\n";
    markdown += "| " + headers.map(() => "---").join(" | ") + " |\n";

    // Table rows
    data.forEach((row) => {
      const cells = headers
        .map((header) => {
          let value = row[header];

          if (formatters[header]) {
            value = formatters[header](value);
          }

          if (value === null || value === undefined) {
            return "";
          }

          if (typeof value === "object") {
            value = JSON.stringify(value);
          }

          return String(value).replace(/\|/g, "\\|");
        })
        .join(" | ");

      markdown += "| " + cells + " |\n";
    });

    return {
      filename: `${title}.md`,
      content: markdown,
      mimeType: "text/markdown",
    };
  }

  /**
   * Download file helper
   * Returns Blob data that can be used with download links
   */
  static createDownloadLink(
    content: string,
    mimeType: string
  ): { blob: Blob; url: string } {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    return { blob, url };
  }
}

export default ExportService;
