 import React from 'react';
 import { promises as fs } from 'fs';
 import path from 'path';
 import ReactMarkdown from 'react-markdown';
 import remarkGfm from 'remark-gfm';
 import rehypeRaw from 'rehype-raw';
 import Image from 'next/image';

// YouTube Video Component
const YouTubeEmbed: React.FC<{ videoId: string }> = ({ videoId }) => (
  <div className="ratio ratio-16x9 mb-3">
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video"
      allowFullScreen
      className="rounded"
    />
  </div>
);

 const AboutPage: React.FC = async () => {
   const filePath = path.join(process.cwd(), 'src', 'content', 'about.md');
   const markdownContent = await fs.readFile(filePath, 'utf8');

   // Remove the first heading from markdown since it's in the blue box
   const processedMarkdown = markdownContent
     .replace(/^# About Us\n/, '') // Remove "# About Us" line
     .trim();

   return (
     <div className="about-page py-4" data-hide-sidebar="true">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-10">
            {/* Introduction Section */}
            <div className="card shadow-sm mb-4 border-0 bg-primary text-white">
              <div className="card-body p-4 text-center">
                <h1 className="display-4 mb-3 fw-bold">About Us</h1>
                <p className="lead mb-0">
                  South Africa&apos;s most controversial blog, often banned but never silenced, Medialternatives provides a fresh and new perspective in a publishing landscape controlled by corporate monopolies.
                </p>
              </div>
            </div>

           {/* Main Content Card */}
           <div className="card shadow-sm mb-4">
             <div className="card-body p-4">
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
                         className={`img-fluid rounded shadow-sm ${props.className || ''}`}
                         unoptimized={typeof imageUrl === 'string' && imageUrl.includes('davidrobertlewis.files.wordpress.com')}
                       />
                     );
                   },
                   a: ({ ...props }) => {
                     if (props.href && (props.href.startsWith('http://') || props.href.startsWith('https://'))) {
                       return (
                         <a href={props.href} target="_blank" rel="noopener noreferrer" className={`text-decoration-none fw-bold ${props.className || ''}`}>
                           {props.children}
                         </a>
                       );
                     }
                     return <a {...props}>{props.children}</a>;
                   },
                    h4: ({ ...props }) => <h4 className="h4 mb-3 fw-bold text-primary border-bottom pb-2" {...props}>{props.children}</h4>,
                    blockquote: ({ ...props }) => (
                      <blockquote className="blockquote border-start border-primary border-4 ps-3 py-2 mb-3 bg-light rounded">
                        <p className="mb-1">{props.children}</p>
                      </blockquote>
                    ),
                    strong: ({ ...props }) => <strong className="fw-bold text-dark" {...props}>{props.children}</strong>,
                    ul: ({ ...props }) => <ul className="list-unstyled mb-3" {...props}>{props.children}</ul>,
                    li: ({ ...props }) => <li className="mb-2" {...props}>• {props.children}</li>,
                    p: ({ ...props }) => {
                      // Check if this paragraph contains only a YouTube URL
                      const children = React.Children.toArray(props.children);
                      if (children.length === 1 && typeof children[0] === 'string') {
                        const text = children[0].trim();
                        const youtubeRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/;
                        const match = text.match(youtubeRegex);
                        if (match) {
                          return <YouTubeEmbed videoId={match[1]} />;
                        }
                      }
                      return <p className="mb-3 fs-6" {...props}>{props.children}</p>;
                    },
                 }}
                 >
                   {processedMarkdown}
                 </ReactMarkdown>
             </div>
           </div>

           {/* Support Section */}
           <div className="card shadow-sm mb-4 bg-warning bg-opacity-10 border-warning">
             <div className="card-body p-4 text-center">
               <h4 className="h4 mb-3 fw-bold text-warning">Support Our Work</h4>
               <p className="mb-3">Help us continue providing independent journalism and fresh perspectives.</p>
               <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                 <a href="http://paypal.me/DavidLewis546" target="_blank" rel="noopener noreferrer" className="btn btn-warning btn-lg">
                   <i className="bi bi-paypal me-2"></i>Donate via PayPal
                 </a>
                 <a href="https://www.backabuddy.co.za/champion/project/defend-the-trc" target="_blank" rel="noopener noreferrer" className="btn btn-outline-warning btn-lg">
                   <i className="bi bi-heart me-2"></i>Support on BackaBuddy
                 </a>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 };

export default AboutPage;
