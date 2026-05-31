import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Swords, Compass, Users, CheckCircle2 } from "lucide-react";

const heroRoles = [
  { role: "坦克", icon: "🛡️", desc: "衝鋒在前，抵擋致命彈幕，開闢特工戰線", color: "from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400" },
  { role: "輸出", icon: "⚔️", desc: "精準打擊，瞬間輸出，主宰戰場命脈", color: "from-red-600/20 to-orange-600/10 border-red-500/30 text-red-400" },
  { role: "支援", icon: "➕", desc: "極致治療，輔助增益，掌握隊伍生死存亡", color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400" },
];

const sampleProfiles = [
  { name: "星辰", role: "支援", rank: "鑽石", hero: "安娜", tags: ["認真組排", "不開麥OK"], message: "熟練睡針與禁療瓶，專注後排抬血，找心態成熟的輸出雙排！" },
  { name: "大錘本哈", role: "坦克", rank: "大師", hero: "萊因哈特", tags: ["歡迎新手", "每日上線"], message: "盾牌不倒，青春不老！主坦老司機，歡迎各路輔助加好友。" },
  { name: "暗影源神", role: "輸出", rank: "白金", hero: "源氏", tags: ["快樂排位", "語音交流"], message: "有神快拜！專精源氏/死神。心態好不暴躁，輸贏都歡樂。" },
];

const rankColors: Record<string, string> = {
  黃金: "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]",
  白金: "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]",
  鑽石: "text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.3)]",
  大師: "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.3)]",
  宗師: "text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.3)]",
};

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative py-28 px-4 text-center overflow-hidden flex flex-col items-center justify-center">
        {/* Futuristic Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-[20%] left-[10%] w-[200px] h-[200px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none z-0" />
        
        <div className="relative max-w-4xl mx-auto z-10 space-y-6">
          <Badge className="mb-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/40 px-3 py-1 text-xs font-black tracking-widest uppercase ow-tech-corner-sm">
            🛡️ OVERWATCH TW COMMUNITY
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-wider leading-none text-white uppercase">
            尋找你的 <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">最佳特工戰友</span>
          </h1>
          
          <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            這不只是簡單的組排，更是特工與特工之間的默契交匯。
            建立專屬的高質感去背名片，展示你的本命英雄與社群連結，秒速找到靈魂拍檔！
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/profile">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm px-8 py-6 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:scale-105 active:scale-98 transition-all duration-300 ow-tech-btn ow-tech-corner">
                <Sparkles size={16} className="mr-2" />
                建立我的特工名片
              </Button>
            </Link>
            
            <Link href="/browse">
              <Button variant="outline" className="border-gray-800 text-gray-300 hover:text-white bg-slate-950/40 hover:bg-slate-900/60 font-extrabold text-sm px-8 py-6 rounded-xl border border-[rgba(249,115,22,0.15)] shadow-lg hover:scale-105 active:scale-98 transition-all duration-300 ow-tech-btn ow-tech-corner">
                <Compass size={16} className="mr-2" />
                瀏覽名片交友廣場
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 角色分類 */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-widest uppercase">
            ⚡ 戰術定位分析 ⚡
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">在戰場上，每種天賦都有其無可取代的特殊地位</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {heroRoles.map((r) => (
            <div 
              key={r.role} 
              className={`ow-glass-panel p-8 text-center border-t-2 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_0)] bg-[size:16px_16px]" />
              <div className="space-y-4">
                <div className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{r.icon}</div>
                <h3 className="text-xl font-black text-white tracking-widest">{r.role}型英雄</h3>
                <p className="text-gray-400 text-xs leading-relaxed font-medium">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 最新玩家 */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-widest uppercase flex items-center gap-2">
              <Users className="text-orange-500" /> 最新加入的特工隊友
            </h2>
            <p className="text-gray-400 text-xs font-medium">剛剛加入並公開其精美手帳風名片的特工夥伴</p>
          </div>
          <Link href="/browse">
            <Button variant="link" className="text-orange-400 hover:text-orange-300 font-extrabold text-xs tracking-wider uppercase">
              進入廣場查看全部特工 →
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProfiles.map((p) => (
            <div 
              key={p.name} 
              className="ow-glass-panel p-6 hover:scale-[1.02] transition-all duration-300 border-b-2 border-b-orange-500/20 hover:border-b-orange-500/60"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-lg font-black text-orange-400 shadow-[inset_0_0_8px_rgba(249,115,22,0.2)]">
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm tracking-wide">{p.name}</h3>
                    <span className={`text-[10px] font-black uppercase ${rankColors[p.rank]}`}>{p.rank}</span>
                  </div>
                </div>
                <Badge className="bg-orange-500/10 border-orange-500/20 text-orange-400 text-[10px] font-bold px-2 py-0.5">
                  主玩 {p.hero}
                </Badge>
              </div>

              <div className="bg-slate-950/50 border border-gray-850 rounded-xl p-3 mb-4 min-h-[72px]">
                <p className="text-gray-300 text-xs font-medium leading-relaxed italic">
                  &ldquo;{p.message}&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-850">
                {p.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-black px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
