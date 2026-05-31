import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const heroRoles = [
  { role: "坦克", icon: "🛡️", desc: "衝鋒在前，保護隊友" },
  { role: "輸出", icon: "⚡", desc: "精準打擊，決定勝負" },
  { role: "支援", icon: "💚", desc: "治療隊友，扭轉戰局" },
];

const sampleProfiles = [
  { name: "星辰", role: "支援", rank: "鑽石", hero: "安娜", tags: ["認真組排", "不開麥OK"] },
  { name: "鋼鐵壁", role: "坦克", rank: "大師", hero: "萊因哈特", tags: ["歡迎新手", "每日上線"] },
  { name: "暗影", role: "輸出", rank: "鉑金", hero: "源氏", tags: ["假日玩家", "輕鬆休閒"] },
];

const rankColors: Record<string, string> = {
  銅牌: "text-orange-800", 銀牌: "text-gray-400", 金牌: "text-yellow-400",
  鉑金: "text-cyan-400", 鑽石: "text-blue-400", 大師: "text-purple-400",
  宗師: "text-orange-400", "Top 500": "text-pink-400",
};

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/30 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
            台灣 鬥陣特工社群
          </Badge>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            找到你的<span className="text-orange-400">最佳隊友</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            不只是組排，更是找到志同道合的玩家。
            建立你的英雄檔案，認識來自台灣的 OW 玩家。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/profile">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                建立我的檔案
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8">
                瀏覽玩家
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 角色類型 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-200">你是哪種英雄？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {heroRoles.map((r) => (
              <Card key={r.role} className="bg-gray-900 border-gray-800 text-center hover:border-orange-500/50 transition-colors">
                <CardContent className="pt-8 pb-6">
                  <div className="text-5xl mb-3">{r.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{r.role}</h3>
                  <p className="text-gray-400 text-sm">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 近期玩家 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-200">最新加入的玩家</h2>
            <Link href="/browse" className="text-orange-400 text-sm hover:underline">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleProfiles.map((p) => (
              <Card key={p.name} className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-xl font-bold text-orange-400">
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className={`text-sm font-medium ${rankColors[p.rank]}`}>{p.rank}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    主玩：<span className="text-white">{p.hero}</span>　·　{p.role}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
