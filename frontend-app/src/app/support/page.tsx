 import React from 'react';
 import { promises as fs } from 'fs';
 import path from 'path';
 import ReactMarkdown from 'react-markdown';
 import remarkGfm from 'remark-gfm';
 import rehypeRaw from 'rehype-raw';
 import Image from 'next/image';

 const SupportPage: React.FC = async () => {
   const filePath = path.join(process.cwd(), 'src', 'content', 'support.md');
   const markdownContent = await fs.readFile(filePath, 'utf8');

   // Split content into sections
   const contentParts = markdownContent.split('\n\n');
   const quoteSection = contentParts[0];
   const mainContent = contentParts.slice(1).join('\n\n');

    return (
      <div className="support-page py-4">
         <div className="row justify-content-center">
           <div className="col-12 col-lg-10 col-xl-10">
             {/* Introduction Quote */}
             <div className="card shadow-sm mb-4 border-0 bg-light">
               <div className="card-body p-4">
                 <blockquote className="blockquote mb-0">
                   <ReactMarkdown
                     remarkPlugins={[remarkGfm]}
                     rehypePlugins={[rehypeRaw]}
                     components={{
                       p: ({ ...props }) => <p className="mb-2 fst-italic" {...props}>{props.children}</p>,
                       strong: ({ ...props }) => <strong className="text-muted fw-normal" {...props}>{props.children}</strong>,
                     }}
                   >
                     {quoteSection}
                   </ReactMarkdown>
                 </blockquote>
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
                     h1: ({ ...props }) => <h1 className="h1 mb-4 fw-bold text-primary" {...props}>{props.children}</h1>,
                     h4: ({ ...props }) => <h4 className="h4 mb-3 fw-bold text-primary border-bottom pb-2" {...props}>{props.children}</h4>,
                     p: ({ ...props }) => <p className="mb-3 fs-6" {...props}>{props.children}</p>,
                     blockquote: ({ ...props }) => (
                       <blockquote className="blockquote border-start border-primary border-4 ps-3 py-2 mb-3 bg-light rounded">
                         <p className="mb-1">{props.children}</p>
                       </blockquote>
                     ),
                     strong: ({ ...props }) => <strong className="fw-bold text-dark" {...props}>{props.children}</strong>,
                     ul: ({ ...props }) => <ul className="list-unstyled mb-3" {...props}>{props.children}</ul>,
                     li: ({ ...props }) => <li className="mb-2" {...props}>• {props.children}</li>,
                     form: ({ ...props }) => (
                       <div className="text-center my-4">
                         <form {...props}>{props.children}</form>
                       </div>
                     ),
                     div: ({ ...props }) => {
                       if (props.children && typeof props.children === 'string' && props.children.includes('Bitcoin')) {
                         return (
                           <div className="alert alert-info text-center my-3" {...props}>
                             <i className="bi bi-currency-bitcoin me-2"></i>
                             {props.children}
                           </div>
                         );
                       }
                       return <div {...props}>{props.children}</div>;
                     },
                   }}
                 >
                   {mainContent}
                 </ReactMarkdown>
               </div>
             </div>
           </div>
         </div>
        </div>
    );
 };

export default SupportPage;
