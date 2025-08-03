/**
 * Export utilities for dead link checker results
 */

import { DeadLink, LinkCheckResult } from './deadLinkChecker';

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeContext: boolean;
  includeSuggestions: boolean;
  includeArchiveLinks: boolean;
  groupByPost: boolean;
}

/**
 * Export dead links to CSV format
 */
export function exportToCSV(
  deadLinks: DeadLink[],
  options: ExportOptions = { format: 'csv', includeContext: true, includeSuggestions: true, includeArchiveLinks: true, groupByPost: false }
): string {
  const headers = [
    'URL',
    'Status',
    'Error',
    'Post ID',
    'Post Title',
    'Post Slug'
  ];

  if (options.includeContext) {
    headers.push('Context');
  }

  if (options.includeArchiveLinks) {
    headers.push('Archive URL');
  }

  if (options.includeSuggestions) {
    headers.push('Suggestions');
  }

  const csvRows = [headers.join(',')];

  deadLinks.forEach(link => {
    const row = [
      `"${link.url.replace(/"/g, '""')}"`,
      link.status?.toString() || 'null',
      `"${(link.error || '').replace(/"/g, '""')}"`,
      link.postId.toString(),
      `"${link.postTitle.replace(/"/g, '""')}"`,
      `"${link.postSlug.replace(/"/g, '""')}"`
    ];

    if (options.includeContext) {
      row.push(`"${(link.context || '').replace(/"/g, '""')}"`);
    }

    if (options.includeArchiveLinks) {
      row.push(`"${(link.archiveUrl || '').replace(/"/g, '""')}"`);
    }

    if (options.includeSuggestions) {
      const suggestions = link.suggestions?.join('; ') || '';
      row.push(`"${suggestions.replace(/"/g, '""')}"`);
    }

    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Export dead links to JSON format
 */
export function exportToJSON(
  deadLinks: DeadLink[],
  summary?: any,
  options: ExportOptions = { format: 'json', includeContext: true, includeSuggestions: true, includeArchiveLinks: true, groupByPost: false }
): string {
  const exportData: any = {
    exportDate: new Date().toISOString(),
    summary: summary || {
      totalDeadLinks: deadLinks.length,
      exportedAt: new Date().toISOString()
    },
    deadLinks: deadLinks.map(link => {
      const exportLink: any = {
        url: link.url,
        status: link.status,
        error: link.error,
        postId: link.postId,
        postTitle: link.postTitle,
        postSlug: link.postSlug
      };

      if (options.includeContext) {
        exportLink.context = link.context;
      }

      if (options.includeArchiveLinks) {
        exportLink.archiveUrl = link.archiveUrl;
      }

      if (options.includeSuggestions) {
        exportLink.suggestions = link.suggestions;
      }

      return exportLink;
    })
  };

  if (options.groupByPost) {
    const groupedByPost = deadLinks.reduce((acc, link) => {
      const postKey = `${link.postId}`;
      if (!acc[postKey]) {
        acc[postKey] = {
          postId: link.postId,
          postTitle: link.postTitle,
          postSlug: link.postSlug,
          deadLinks: []
        };
      }
      acc[postKey].deadLinks.push(link);
      return acc;
    }, {} as Record<string, any>);

    exportData.groupedByPost = Object.values(groupedByPost);
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate PDF report (returns HTML that can be converted to PDF)
 */
export function generatePDFHTML(
  deadLinks: DeadLink[],
  summary?: any,
  options: ExportOptions = { format: 'pdf', includeContext: true, includeSuggestions: true, includeArchiveLinks: true, groupByPost: false }
): string {
  const now = new Date();
  const totalLinks = summary?.totalLinks || 0;
  const workingLinks = summary?.workingLinks || 0;
  const processingTime = summary?.processingTimeMs || 0;

  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dead Links Report - ${now.toLocaleDateString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; color: #dc3545; }
        .summary-label { font-size: 12px; color: #6c757d; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-badge { padding: 2px 6px; border-radius: 3px; font-size: 11px; }
        .status-danger { background: #dc3545; color: white; }
        .status-warning { background: #ffc107; color: black; }
        .status-secondary { background: #6c757d; color: white; }
        .url-cell { max-width: 200px; word-break: break-all; }
        .context-cell { max-width: 150px; font-size: 11px; color: #6c757d; }
        .suggestions-cell { max-width: 200px; font-size: 11px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Dead Links Report</h1>
        <p>Generated on ${now.toLocaleString()}</p>
    </div>

    <div class="summary">
        <h3>Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">${deadLinks.length}</div>
                <div class="summary-label">Dead Links</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" style="color: #28a745;">${workingLinks}</div>
                <div class="summary-label">Working Links</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" style="color: #17a2b8;">${totalLinks}</div>
                <div class="summary-label">Total Links</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" style="color: #6c757d;">${Math.round(processingTime / 1000)}s</div>
                <div class="summary-label">Processing Time</div>
            </div>
        </div>
    </div>
`;

  if (deadLinks.length === 0) {
    html += `
    <div style="text-align: center; padding: 40px; background: #d4edda; color: #155724; border-radius: 5px;">
        <h3>🎉 No Dead Links Found!</h3>
        <p>All external links in the checked posts are working properly.</p>
    </div>
`;
  } else {
    html += `
    <table>
        <thead>
            <tr>
                <th>URL</th>
                <th>Status</th>
                <th>Post</th>`;

    if (options.includeContext) {
      html += '<th>Context</th>';
    }

    if (options.includeArchiveLinks) {
      html += '<th>Archive</th>';
    }

    if (options.includeSuggestions) {
      html += '<th>Suggestions</th>';
    }

    html += `
            </tr>
        </thead>
        <tbody>
`;

    deadLinks.forEach(link => {
      const statusClass = link.status === null ? 'status-secondary' : 
                         link.status >= 500 ? 'status-danger' : 'status-warning';

      html += `
            <tr>
                <td class="url-cell">${link.url}</td>
                <td><span class="status-badge ${statusClass}">${link.status || 'Timeout'}</span></td>
                <td>${link.postTitle}</td>`;

      if (options.includeContext) {
        html += `<td class="context-cell">${link.context || ''}</td>`;
      }

      if (options.includeArchiveLinks) {
        html += `<td>${link.archiveUrl ? '<a href="' + link.archiveUrl + '">Archive</a>' : ''}</td>`;
      }

      if (options.includeSuggestions) {
        const suggestions = link.suggestions?.join('<br>') || '';
        html += `<td class="suggestions-cell">${suggestions}</td>`;
      }

      html += '</tr>';
    });

    html += `
        </tbody>
    </table>
`;
  }

  html += `
    <div class="footer">
        <p>Report generated by MediaAlternatives Dead Link Checker</p>
        <p>For more information, visit your dashboard at /dashboard/dead-links</p>
    </div>
</body>
</html>
`;

  return html;
}

/**
 * Download file with given content
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export dead links with the specified options
 */
export function exportDeadLinks(
  deadLinks: DeadLink[],
  summary: any,
  options: ExportOptions
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (options.format) {
    case 'csv':
      const csvContent = exportToCSV(deadLinks, options);
      downloadFile(csvContent, `dead-links-${timestamp}.csv`, 'text/csv');
      break;
      
    case 'json':
      const jsonContent = exportToJSON(deadLinks, summary, options);
      downloadFile(jsonContent, `dead-links-${timestamp}.json`, 'application/json');
      break;
      
    case 'pdf':
      const htmlContent = generatePDFHTML(deadLinks, summary, options);
      // For PDF, we'll send to server to convert
      generatePDFReport(htmlContent, `dead-links-${timestamp}.pdf`);
      break;
  }
}

/**
 * Generate PDF report via server
 */
async function generatePDFReport(htmlContent: string, filename: string): Promise<void> {
  try {
    const response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html: htmlContent, filename })
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: download HTML file
    downloadFile(htmlContent, filename.replace('.pdf', '.html'), 'text/html');
  }
}

/**
 * Get default export options
 */
export function getDefaultExportOptions(): ExportOptions {
  return {
    format: 'csv',
    includeContext: true,
    includeSuggestions: true,
    includeArchiveLinks: true,
    groupByPost: false
  };
}