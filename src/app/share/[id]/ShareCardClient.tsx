"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import OWCard from "@/components/OWCard";
import { exportCardImage } from "@/lib/cardImageExport";
import { useAuth } from "@/context/AuthContext";
import type { OWPlayerCard } from "@/types/card";

interface Props {
  cardData: OWPlayerCard | null;
}

export default function ShareCardClient({ cardData }: Props) {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [exportingImage, setExportingImage] = useState(false);
  const playerName = cardData?.battle_tag ? cardData.battle_tag.split("#")[0] : "Unknown Agent";

  const handleExportImage = async () => {
    if (!cardRef.current || !cardData) return;
    setExportingImage(true);
    try {
      await exportCardImage(cardRef.current, `ow-card-${playerName}.png`);
    } catch (err) {
      console.error("導出圖片失敗:", err);
      alert("導出圖片失敗，請重試！");
    } finally {
      setExportingImage(false);
    }
  };

  return (
    <div className="min-h-screen relative pb-32 transition-colors duration-500 text-theme-text-strong">
      <div className="fixed inset-0 ambient-space-glows pointer-events-none z-0" />

      <main className="p-6 md:p-8 min-h-screen w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 z-10 relative">
        <div className="space-y-8 max-w-2xl mx-auto pt-6 flex flex-col items-center">
          {/* 返回與引導區 */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/[0.04] pb-4">
            <Link href="/browse">
              <Button
                variant="outline"
                className="inline-flex items-center gap-2 border-white/10 hover:border-auroraMint/30 text-theme-text-soft hover:text-white bg-white/[0.01] hover:bg-white/[0.04] font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-xl shadow-sm transition-all duration-300 cursor-pointer hover:scale-102"
              >
                <ArrowLeft size={13} className="stroke-[3]" />
                <span>返回大廳廣場</span>
              </Button>
            </Link>

            {cardData && (
              <div className="bg-auroraMint/10 border border-auroraMint/20 rounded-2xl py-1.5 px-3.5 text-xs text-auroraMint font-bold flex items-center gap-2 shadow-sm animate-pulse">
                <Sparkles size={12} />
                <span>已成功載入特工分享名片</span>
              </div>
            )}
          </div>

          {!cardData ? (
            <Card className="glass-panel text-theme-text-strong max-w-md w-full mt-8 border-white/[0.03]">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <span className="text-4xl">🔎</span>
                <h3 className="font-extrabold text-lg text-white">找不到名片</h3>
                <p className="text-xs text-theme-text-muted">該玩家的名片不存在或已設為私密。</p>
                <Link href="/browse" className="mt-2 w-full">
                  <Button className="w-full bg-gradient-to-r from-auroraTeal to-auroraMint text-white hover:opacity-90 font-bold text-xs rounded-xl py-3 transition-all duration-300">
                    前往大廳尋找其他隊友
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full animate-[fadeInUp_0.6s_ease-out]">
              {/* 名片卡片渲染 */}
              <div ref={cardRef} className="share-card-export-surface rounded-[28px] overflow-hidden shadow-lg max-w-[340px] w-full flex justify-center">
                <OWCard
                  cardData={cardData}
                  isLoggedIn={!!user}
                  isEditable={false}
                  renderMode={exportingImage ? "export" : "interactive"}
                />
              </div>

              {/* 控制按鈕區 */}
              <div className="w-full max-w-[340px] flex flex-col gap-3">
                <Button
                  onClick={handleExportImage}
                  disabled={exportingImage}
                  className="w-full bg-gradient-to-r from-auroraTeal to-auroraMint text-white font-extrabold text-sm py-4.5 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 duration-300"
                >
                  <span>💾</span>
                  <span>{exportingImage ? "正在導出圖片..." : "保存此卡片為圖片"}</span>
                </Button>

                <Link href="/profile" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 hover:border-auroraMint/30 text-theme-text-soft hover:text-white bg-white/[0.01] hover:bg-white/[0.03] font-extrabold text-sm py-4.5 rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 duration-300"
                  >
                    <span>✨</span>
                    <span>我也要建立特工名片</span>
                  </Button>
                </Link>
              </div>

              <p className="text-[11px] text-theme-text-muted/80 font-sans italic text-center max-w-[320px] font-semibold mt-2 leading-relaxed">
                💡 點擊名片上的 <b>BattleTag</b> 或是下方社群圖示即可快速複製對方的聯絡資訊！
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
