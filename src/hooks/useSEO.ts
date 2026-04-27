import { useEffect } from 'react';

export const useSEO = (title: string, description: string, keywords?: string, ogImage?: string, ogUrl?: string) => {
    useEffect(() => {
        document.title = title;
        
        const setMetaTag = (attrName: string, attrValue: string, content: string) => {
            let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attrName, attrValue);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const setLinkTag = (rel: string, href: string) => {
            let element = document.querySelector(`link[rel="${rel}"]`);
            if (!element) {
                element = document.createElement('link');
                element.setAttribute('rel', rel);
                document.head.appendChild(element);
            }
            element.setAttribute('href', href);
        };

        setMetaTag('name', 'description', description);
        if (keywords) setMetaTag('name', 'keywords', keywords);
        
        // Open Graph
        setMetaTag('property', 'og:title', title);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:type', 'website');
        setMetaTag('property', 'og:site_name', 'Ritik Kumar Portfolio');
        if (ogImage) setMetaTag('property', 'og:image', ogImage);
        if (ogUrl) setMetaTag('property', 'og:url', ogUrl);
        
        // Twitter
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', title);
        setMetaTag('name', 'twitter:description', description);
        if (ogImage) setMetaTag('name', 'twitter:image', ogImage);

        // Canonical
        if (ogUrl) setLinkTag('canonical', ogUrl);

    }, [title, description, keywords, ogImage, ogUrl]);
};
