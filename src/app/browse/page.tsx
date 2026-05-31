import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const players = [
  { name: "星辰", role: "支援", rank: "鑽石", hero: "安娜", age: 22, server: "台灣", tags: ["認真組排", "不開麥OK"], bio: "每天晚上10點後上線，尋找穩定組排夥伴～" },
  { name: "鋼鐵壁", role: "坦克", rank: "大師", hero: "萊因哈特", age: 25, server: "亞洲", tags: ["歡迎新手", "每日上線"], bio: "老坦克一枚，喜歡保護隊友衝鋒陷陣！" },
  { name: "暗影", role: "輸出", rank: "鉑金", hero: "源氏", age: 20, server: "台灣", tags: ["假日玩家", "輕鬆休閒"], bio: "假日才有空玩，主要想認識新朋友。" },
  { name: "極光", role: "支援", rank: "宗師", hero: "露西奧", age: 23, server: "台灣", tags: ["競技向", "有麥克風"], bio: "DJ 比賽玩得很認真，找同樣認真的隊友！" },
  { name: "狂風", role: "輸出", rank: "金牌", hero: "死神", age: 21, server: "亞洲", tags: ["新手友善", "輕鬆聊天"], bio: "還在努力爬分，歡迎一起練習的新朋友～" },
  { name: "磐石", role: "坦克", rank: "鉑金", hero: "奧瑞莎", age: 28, server: "台灣", tags: ["工作族", "晚上上線"], bio: "上班族，晚上才有時間，找同樣時段的夥伴。" },
];

const rankColors: Record<string, string> = {
  銅牌: "text-orange-800", 銀牌: "text-gray-400", 金牌: "text-yellow-400",
  鉑金: "text-cyan-400", 鑽石: "text-blue-400", 大師: "text-purple-400",
  宗師: "text-orange-400", "Top 500": "text-pink-400",
};

const roleIcons: Record<string, string> = {
  坦克: "🛡️", 輸出: "⚡", 支援: "💚",
};

export default function BrowsePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">瀏覽玩家</h1>
        <p className="text-gray-400">找到志同道合的鬥陣特工玩家</p>
      </div>

      {/* 搜尋欄（靜態，之後串資料庫） */}
      <div className="mb-8">
        <Input
          placeholder="搜尋玩家名稱、英雄或標籤..."
          className="max-w-md bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      {/* 角色篩選 */}
      <div className="flex gap-3 mb-8">
        {["全部", "坦克", "輸出", "支援"].map((role) => (
          <Badge
            key={role}
            variant={role === "全部" ? "default" : "secondary"}
            className={`cursor-pointer px-4 py-1.5 text-sm ${
              role === "全部" ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            {roleIcons[role] ?? ""} {role}
          </Badge>
        ))}
      </div>

      {/* 玩家卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((p) => (
          <Card key={p.name} className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-950/20 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-900/30 flex items-center justify-center text-2xl font-bold text-orange-400 border border-orange-500/30">
                  {p.name[0]}
                </div>
                <div>
                  <p className="font-bold text-lg">{p.name}</p>
                  <p className={`text-sm font-medium ${rankColors[p.rank]}`}>
                    {p.rank} · {p.age} 歲
                  </p>
                </div>
                <span className="ml-auto text-2xl">{roleIcons[p.role]}</span>
              </div>

              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{p.bio}</p>

              <div className="text-sm text-gray-400 mb-3">
                主玩：<span className="text-white font-medium">{p.hero}</span>
                　·　{p.server}
              </div>

              <div className="flex flex-wrap gap-1">
                {p.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
