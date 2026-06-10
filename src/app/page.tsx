import HomeClient from "./HomeClient";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "After Midnight",
    "url": "https://aftermidnight-gg.vercel.app",
    "description": "低侵入、可收藏的玩家名片宇宙。建立你的名片，遇見深夜還在線上的靈魂隊友。",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://aftermidnight-gg.vercel.app/browse?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
