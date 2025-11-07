export interface PCloudFile {
  filename: string;
  publicUrl: string;
  pcloudPath: string;
  fileid: string;
  category: 'transcripts' | 'legal';
  size: number;
  title?: string;
}

export interface PCloudMapping {
  [filename: string]: {
    publicUrl: string;
    pcloudPath: string;
    fileid: string;
    category: 'transcripts' | 'legal';
    size: number;
  };
}

export interface MigrationReport {
  downloaded: Array<{
    url: string;
    filename: string;
    size: number;
  }>;
  uploaded: Array<{
    filename: string;
    category: string;
    oldUrl: string;
    newUrl: string;
    pcloudPath: string;
    fileid: string;
    size: number;
  }>;
  failed: Array<{
    url: string;
    filename: string;
    error: string;
  }>;
  totalSize: number;
}