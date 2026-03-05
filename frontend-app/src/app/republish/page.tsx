 import React from 'react';
 import { promises as fs } from 'fs';
 import path from 'path';
 import ReactMarkdown from 'react-markdown';
 import remarkGfm from 'remark-gfm';
 import rehypeRaw from 'rehype-raw';
 import Image from 'next/image';

 interface ElementNode {
   type: 'element';
   tagName: string;
   properties?: Record<string, unknown>;
   children: Array<{ value?: string }>;
 }

 interface TextNode {
   value?: string;
 }

 const RepublishPage: React.FC = async () => {
   const filePath = path.join(process.cwd(), 'src', 'content', 'publish.md');
   const markdownContent = await fs.readFile(filePath, 'utf8');

    return (
      <div className="republish-page py-4">
         <div className="row justify-content-center">
           <div className="col-12 col-lg-10 col-xl-10">
             {/* Introduction Section */}
             <div className="card shadow-sm mb-4 border-0 bg-success bg-opacity-10">
               <div className="card-body p-4 text-center">
                 <h1 className="display-4 mb-3 fw-bold text-success">Republish Our Material</h1>
                 <p className="lead mb-0">
                   Medialternatives provides alternative views on key issues facing journalists, the media and academics in South Africa.
                 </p>
               </div>
             </div>

             {/* Main Content Card */}
             <div className="card shadow-sm mb-4">
               <div className="card-body p-4">
                 <div className="alert alert-info mb-4">
                   <i className="bi bi-info-circle me-2"></i>
                   <strong>Sharing Guidelines:</strong> We encourage the spread of our stories far and wide. Please follow these guidelines when republishing our material.
                 </div>

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
                     h1: () => null, // Hide the original h1 since we have our own
                     p: ({ ...props }) => {
                       // Skip the first two paragraphs since they're in the intro section
                       const content = React.Children.toArray(props.children).join('');
                       if (content.includes('Medialternatives provides alternative views') ||
                           content.includes('As a result, we would like our stories spread far and wide')) {
                         return null;
                       }
                       return <p className="mb-3 fs-6" {...props}>{props.children}</p>;
                     },
                     ol: ({ ...props }) => <ol className="list-group list-group-numbered mb-4" {...props}>{props.children}</ol>,
                     li: ({ children }) => (
                       <li className="list-group-item d-flex align-items-start">
                         <div className="ms-2 me-auto">
                           {children}
                         </div>
                       </li>
                     ),
                     blockquote: ({ ...props }) => (
                       <div className="bg-light p-3 rounded border-start border-primary border-4 my-4">
                         <i className="bi bi-quote me-2 text-primary"></i>
                         <em>{props.children}</em>
                       </div>
                     ),
                     strong: ({ ...props }) => <strong className="fw-bold text-dark" {...props}>{props.children}</strong>,
                     div: ({ ...props }) => {
                       if (props.className?.includes('wp-block-file')) {
                         const fileChildren = (props.node as ElementNode)?.children || [];
                         return (
                           <div className="my-3">
                             {fileChildren.map((childNode, index) => {
                               if ((childNode as ElementNode).type === 'element' && (childNode as ElementNode).tagName === 'a') {
                                 const elementNode = childNode as ElementNode;
                                 const href = elementNode.properties?.href as string;
                                 const className = elementNode.properties?.className as string;
                                 const download = elementNode.properties?.download as string;
                                 const textContent = (elementNode.children[0] as TextNode)?.value;

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
                         const rawHtml = ((props.node as ElementNode)?.children[0] as TextNode)?.value;
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
             </div>
           </div>
         </div>
        </div>
    );
 };

 export default RepublishPage;
