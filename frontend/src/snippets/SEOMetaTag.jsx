import React from "react";
import { Helmet } from "react-helmet-async";

function SEOMetaTag({ title, description, keywords, image, url, noindex = false}) {
    // 인덱스에 픽스된 메타태그만 남기고, 중복되는거 제거해야됨.
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph 태그 */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            
            {/* Twitter 카드 태그 */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            <link rel="canonical" href={url}></link>
            <meta name="robots" content={noindex ? "noindex,follow" : "index,follow"}/>
            
            {/* 구조화된 데이터 */}
            <script type="application/ld+json">
                {`
                {
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "${title}",
                    "description": "${description}",
                    "image": "${image}",
                    "url": "${url}",
                    "applicationCategory": "CommunicationApplication",
                    "operatingSystem": "Web"
                }
                `}
            </script>
        </Helmet>
    );
}

export default SEOMetaTag;