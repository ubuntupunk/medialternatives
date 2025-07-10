# PDF Content Migration Plan

## Critical Issue
The `/case` page contains 29 important legal documents (PDFs) that are currently broken due to incorrect domain URLs:
- `https://newsite.medialternatives.com/app/uploads/...` (broken)
- `https://medialternatives.com/app/uploads/...` (may break)

## PDF Inventory

### Court Transcripts (13 files)
1. Transcripts-Index-1.pdf
2. C88-07-Vol_1-4-November-2009-FP-1.pdf
3. C88-07-Vol_1-4-November-2009-1.pdf
4. C88-07-Vol_2-5-November-2009-Letter-to-the-Chief-Registrar-Head-o...-1.pdf
5. C88-07-Vol_2-5-November-2009-FP-1.pdf
6. C88-07-Vol_2-5-November-2009-1.pdf
7. C88-07-Vol_3-6-November-2009-Letter-to-the-Chief-Registrar-Head-o...-1.pdf
8. C88-07-Vol_3-6-November-2009-FP-1.pdf
9. C88-07-Vol_3-6-November-2009-1.pdf
10. C88-07-Vol_4-_-5-20-_-21-January-2010-Letter-to-the-Chief-Registrar...-1.pdf
11. C88-07-Vol_4-20-January-2010-FP-1.pdf
12. C88-07-Vol_4-20-January-2010-1.pdf
13. C88-07-Vol_5-21-January-2010-1.pdf

### Legal Documents (16 files)
14. Founding-Affidavit.pdf
15. Annexures-PAJA-3.pdf
16. Cheadle-Report-to-Cape-Law-Society-6-September-2011-1.pdf
17. Affidavit-20-November-2017-Addendum-4.pdf
18. Third-Supplementary-Affidavit-Perjury-A-Dean.pdf
19. Founding-Affidavit-Perjury-A-Dean.pdf
20. Associate-Professor-Lesley-Cowling-Rejects-Plagiarism-Accusation.pdf
21. Trace-Report-A-Dean.pdf
22. Supplement-Affidavit-CBC-Kahanovitz-9-MAY-2017-TUE-.doc-0BycjkxOoSHFeRV8zOTl6NjZYbGM.pdf
23. LIT10153ZA00-Letter-to-Naspers-26.07.2016.pdf
24. Gmail-FW-Lewis-_-Naspers-Copyright-protection.pdf
25. NASPERS-LTD-AND-MEDIA24-DIE-BURGER-COPYRIGHT-PROTECTION-IN-THE-NAME-OF....pdf
26. RWR-Letter-to-Maserumule-12.10.2016.pdf
27. Gagging-Letter-JS-De-Villiers-26-June-2006.pdf
28. Fxi-Letter-to-Hein-Brand-per-Jeenah-and-Delaney-29-Aug-2006.pdf
29. TRC-Unit-28-Sept-2006.pdf
30. TRC-Unit-26-Oct-2006.pdf
31. TRC-Unit-26-Sept-2007.pdf
32. DOC065-1.pdf

## Free Storage Options

### Option 1: Vercel Blob Storage (Recommended)
- **Pros**: Integrated with our deployment, fast CDN
- **Cons**: Has usage limits, costs after free tier
- **Free Tier**: 1GB storage, 10GB bandwidth/month
- **Implementation**: Use `@vercel/blob` package (already installed)

### Option 2: GitHub Releases
- **Pros**: Completely free, reliable, version controlled
- **Cons**: 2GB file size limit per release, manual process
- **Implementation**: Upload PDFs as release assets

### Option 3: Cloudflare R2
- **Pros**: S3-compatible, generous free tier
- **Cons**: Requires additional setup
- **Free Tier**: 10GB storage, 1M requests/month

### Option 4: Internet Archive
- **Pros**: Permanent preservation, completely free
- **Cons**: Slower access, less control
- **Implementation**: Upload to archive.org

## Migration Strategy

### Phase 1: Immediate Fix (Vercel Blob)
1. **Download all PDFs** from current URLs (if accessible)
2. **Upload to Vercel Blob Storage** using API
3. **Update case.md** with new Vercel Blob URLs
4. **Test all download links**

### Phase 2: Backup Strategy (GitHub Releases)
1. **Create GitHub release** with all PDFs as assets
2. **Document backup URLs** for redundancy
3. **Implement fallback logic** in download component

### Phase 3: Long-term (Internet Archive)
1. **Upload to Internet Archive** for permanent preservation
2. **Add archive.org links** as additional references
3. **Ensure legal document preservation**

## Implementation Plan

### Step 1: PDF Recovery Script
```bash
#!/bin/bash
# Download all accessible PDFs
mkdir -p pdfs/transcripts pdfs/legal
# Download each PDF with proper error handling
```

### Step 2: Vercel Blob Upload
```typescript
// Upload PDFs to Vercel Blob Storage
import { put } from '@vercel/blob';

async function uploadPDF(file: File, filename: string) {
  const blob = await put(`legal-docs/${filename}`, file, {
    access: 'public',
  });
  return blob.url;
}
```

### Step 3: Update Content
- Replace all PDF URLs in case.md
- Update download component to handle new URLs
- Add error handling for missing files

## Next Steps
1. **Audit current PDF accessibility**
2. **Choose primary storage solution**
3. **Implement download/upload script**
4. **Update content with new URLs**
5. **Test all download functionality**

## Priority: URGENT
These are critical legal documents that must be preserved and accessible.