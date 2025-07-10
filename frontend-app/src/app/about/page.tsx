import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';

const AboutPage: React.FC = async () => {
  const filePath = path.join(process.cwd(), 'src', 'content', 'about.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');

  return (
    <div className="container my-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ ...props }) => {
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
          a: ({ ...props }) => {
            if (props.href && (props.href.startsWith('http://') || props.href.startsWith('https://'))) {
              return (
                <a href={props.href} target="_blank" rel="noopener noreferrer" className={props.className}>
                  {props.children}
                </a>
              );
            }
            return <a {...props}>{props.children}</a>;
          },
          h1: ({ ...props }) => <h1 className="mb-4" {...props}>{props.children}</h1>,
          h4: ({ ...props }) => <h4 className="mb-3" {...props}>{props.children}</h4>,
          p: ({ ...props }) => <p className="mb-2" {...props}>{props.children}</p>,
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default AboutPage;
