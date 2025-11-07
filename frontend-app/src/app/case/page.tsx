import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import { DOMNode, Element } from 'html-react-parser';

const CasePage: React.FC = async () => {
  const filePath = path.join(process.cwd(), 'src', 'content', 'case.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');

  return (
    <div className="container my-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ node, ...props }) => {
            let imageUrl = props.src;
            if (typeof imageUrl === 'string') {
              imageUrl = imageUrl.startsWith('http://') ? imageUrl.replace('http://', 'https://') : imageUrl;
            }
            return (
              <Image
                src={imageUrl as string || ''}
                alt={props.alt || 'image'}
                width={parseInt(props.width?.toString() || '0', 10) || 0}
                height={parseInt(props.height?.toString() || '0', 10) || 0}
                className={props.className}
                unoptimized={typeof imageUrl === 'string' && imageUrl.includes('davidrobertlewis.files.wordpress.com')}
              />
            );
          },
          a: ({ node, ...props }) => {
            if (props.href && (props.href.startsWith('http://') || props.href.startsWith('https://'))) {
              return (
                <a href={props.href} target="_blank" rel="noopener noreferrer" className={props.className}>
                  {props.children}
                </a>
              );
            }
            return <a {...props}>{props.children}</a>;
          },
          h1: ({ node, ...props }) => <h1 className="mb-4" {...props}>{props.children}</h1>,
          h4: ({ node, ...props }) => <h4 className="mb-3" {...props}>{props.children}</h4>,
          p: ({ node, ...props }) => <p className="mb-2" {...props}>{props.children}</p>,
          div: ({ node, ...props }) => {
            if (props.className?.includes('wp-block-file')) {
              const fileChildren = node!.children;
              return (
                <div className="my-3">
                  {fileChildren.map((childNode, index) => {
                    if (childNode.type === 'element' && childNode.tagName === 'a') {
                      const href = (childNode.properties as any)?.href;
                      const className = (childNode.properties as any)?.className;
                      const download = (childNode.properties as any)?.download;
                      const textContent = (childNode.children[0] as any)?.value;

                      const isDownloadButton = className?.includes('wp-block-file__button');

                      if (href) {
                        return (
                          <a
                            key={index}
                            href={href}
                            download={download}
                            className={isDownloadButton ? 'btn btn-primary me-2' : className}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {textContent}
                          </a>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              );
            }
            if (props.className?.includes('wp-block-embed__wrapper')) {
              const rawHtml = (node!.children[0] as any)?.value;
              if (rawHtml) {
                const embedUrl = rawHtml.trim();
                if (typeof embedUrl === 'string' && embedUrl.includes('youtu.be')) {
                  const videoId = embedUrl.split('/').pop();
                  return (
                    <div className="ratio ratio-16x9 my-3">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  );
                } else if (typeof embedUrl === 'string') {
                  return (
                    <div className="my-3">
                      <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                        {embedUrl}
                      </a>
                    </div>
                  );
                }
              }
            }
            return <div {...props}>{props.children}</div>;
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default CasePage;
