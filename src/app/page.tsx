import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Compass, Users } from "lucide-react";

const heroRoles = [
  { role: "坦克", icon: "🛡️", desc: "衝鋒在前，抵擋致命彈幕，開闢特工戰線", color: "from-[#82b7cc]/15 to-[#82b7cc]/5 border-[#82b7cc]/25 text-[#82b7cc]" },
  { role: "輸出", icon: "⚔️", desc: "精準打擊，瞬間輸出，主宰戰場命脈", color: "from-[#d8a070]/15 to-[#d8a070]/5 border-[#d8a070]/25 text-[#d8a070]" },
  { role: "支援", icon: "➕", desc: "極致治療，輔助增益，掌握隊伍生死存亡", color: "from-emerald-500/12 to-emerald-500/4 border-emerald-500/20 text-emerald-600" },
];

const sampleProfiles = [
  { name: "星辰", role: "支援", rank: "鑽石", hero: "安娜", tags: ["認真組排", "不開麥OK"], message: "熟練睡針與禁療瓶，專注後排抬血，找心態成熟的輸出雙排！" },
  { name: "大錘本哈", role: "坦克", rank: "大師", hero: "萊因哈特", tags: ["歡迎新手", "每日上線"], message: "盾牌不倒，青春不老！主坦老司機，歡迎各路輔助加好友。" },
  { name: "暗影源神", role: "輸出", rank: "白金", hero: "源氏", tags: ["快樂排位", "語音交流"], message: "有神快拜！專精源氏/死神。心態好不暴躁，輸贏都歡樂。" },
];

const rankColors: Record<string, string> = {
  黃金: "text-[#d8a070] font-black",
  白金: "text-[#82b7cc] font-black",
  鑽石: "text-blue-600 font-black",
  大師: "text-purple-600 font-black",
  宗師: "text-[#d8a070] font-black",
};

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative py-28 px-4 text-center overflow-hidden flex flex-col items-center justify-center">
        {/* Sunny Holographic Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#82b7cc]/12 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute top-[20%] left-[10%] w-[250px] h-[250px] bg-[#f5d46b]/8 blur-[90px] rounded-full pointer-events-none z-0" />
        
        <div className="relative max-w-4xl mx-auto z-10 space-y-6">
          <Badge className="mb-2 bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/25 px-3.5 py-1.5 text-xs font-black tracking-widest uppercase rounded-full">
            🛡️ OVERWATCH TW COMMUNITY
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-wider leading-none text-[#3e2723] uppercase">
            尋找你的 <span className="bg-gradient-to-r from-[#82b7cc] via-[#d8a070] to-[#f5d46b] text-transparent bg-clip-text drop-shadow-[0_2px_12px_rgba(130,183,204,0.2)]">最佳特工戰友</span>
          </h1>
          
          <p className="text-[#8c7c6c] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-semibold">
            這不只是簡單的組排，更是特工與特工之間的默契交匯。
            建立專屬的高質感去背名片，展示你的本命英雄與社群連結，秒速找到靈魂拍檔！
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/profile">
              <Button className="bg-gradient-to-r from-[#82b7cc] to-[#82b7cc]/85 text-white font-extrabold text-sm px-8 py-6 rounded-2xl shadow-[0_4px_20px_rgba(130,183,204,0.3)] hover:scale-105 active:scale-98 transition-all duration-300 ow-tech-btn">
                <Sparkles size={16} className="mr-2" />
                建立我的特工名片
              </Button>
            </Link>
            
            <Link href="/browse">
              <Button variant="outline" className="border-[#8c7c6c]/20 text-[#8c7c6c] hover:text-[#5d4037] bg-white/40 hover:bg-white/60 font-extrabold text-sm px-8 py-6 rounded-2xl shadow-sm hover:scale-105 active:scale-98 transition-all duration-300 ow-tech-btn">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3e2723] tracking-widest uppercase">
            ⚡ 戰術定位分析 ⚡
          </h2>
          <p className="text-[#8c7c6c]/80 text-xs sm:text-sm font-semibold">在戰場上，每種天賦都有其無可取代的特殊地位</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {heroRoles.map((r) => (
            <div 
              key={r.role} 
              className={`ow-glass-panel p-8 text-center flex flex-col justify-between hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none bg-[radial-gradient(#8c7c6c_1px,transparent_0)] bg-[size:16px_16px]" />
              <div className="space-y-4">
                <div className="text-5xl drop-shadow-[0_4px_8px_rgba(140,124,108,0.1)]">{r.icon}</div>
                <h3 className="text-xl font-black text-[#5d4037] tracking-widest">{r.role}型英雄</h3>
                <p className="text-[#8c7c6c] text-xs leading-relaxed font-semibold">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 最新玩家 */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3e2723] tracking-widest uppercase flex items-center gap-2">
              <Users className="text-[#82b7cc]" /> 最新加入的特工隊友
            </h2>
            <p className="text-[#8c7c6c]/80 text-xs font-semibold">剛剛加入並公開其精美手帳風名片的特工夥伴</p>
          </div>
          <Link href="/browse">
            <Button variant="link" className="text-[#82b7cc] hover:text-[#82b7cc]/85 font-extrabold text-xs tracking-wider uppercase">
              進入廣場查看全部特工 →
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProfiles.map((p) => (
            <div 
              key={p.name} 
              className="ow-glass-panel p-6 hover:scale-[1.02] transition-all duration-300 border-b-2 border-b-[#82b7cc]/20 hover:border-b-[#82b7cc]/60"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#82b7cc]/12 border border-[#82b7cc]/25 flex items-center justify-center text-lg font-black text-[#82b7cc] shadow-[inset_0_0_8px_rgba(130,183,204,0.15)]">
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#5d4037] text-sm tracking-wide">{p.name}</h3>
                    <span className={`text-[10px] font-black uppercase ${rankColors[p.rank]}`}>{p.rank}</span>
                  </div>
                </div>
                <Badge className="bg-[#8c7c6c]/8 border-[#8c7c6c]/15 text-[#8c7c6c] text-[10px] font-bold px-2 py-0.5">
                  主玩 {p.hero}
                </Badge>
              </div>

              <div className="bg-[#fcf9f2]/90 border border-[#8c7c6c]/10 rounded-2xl p-3.5 mb-4 min-h-[72px] shadow-[inset_0_1px_4px_rgba(140,124,108,0.02)]">
                <p className="text-[#5d4037] text-xs font-semibold leading-relaxed italic">
                  &ldquo;{p.message}&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#8c7c6c]/10">
                {p.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#82b7cc]/12 text-[#82b7cc] border border-[#82b7cc]/20">
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
