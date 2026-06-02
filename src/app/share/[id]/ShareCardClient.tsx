"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import TopBar from "@/components/TopBar";
import OWCard from "@/components/OWCard";
import FluidClipPath from "@/components/morning-sketch/FluidClipPath";
import { toPng } from "html-to-image";
import { useAuth } from "@/context/AuthContext";
import type { OWPlayerCard } from "@/types/card";

interface Props {
  cardData: OWPlayerCard | null;
}

export default function ShareCardClient({ cardData }: Props) {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [exportingImage, setExportingImage] = useState(false);

  const handleExportImage = async () => {
    if (!cardRef.current || !cardData) return;
    setExportingImage(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "transparent",
        style: { transform: "scale(1)", transformOrigin: "top left" }
      });
      const link = document.createElement("a");
      const name = cardData.battle_tag ? cardData.battle_tag.split("#")[0] : "player";
      link.download = `ow-card-${name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("導出圖片失敗:", err);
      alert("導出圖片失敗，請重試！");
    } finally {
      setExportingImage(false);
    }
  };

  return (
    <div className="min-h-screen relative pb-32 transition-colors duration-500">
      <FluidClipPath />

      <main className="p-6 md:p-8 min-h-screen w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 z-10 relative">
        <TopBar />

        <div className="space-y-8 max-w-2xl mx-auto pt-6 flex flex-col items-center">
          {/* 返回與引導區 */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-[#8c7c6c]/10 pb-4">
            <Link href="/browse">
              <Button
                variant="outline"
                className="inline-flex items-center gap-2 border-[#8c7c6c]/10 text-[#8c7c6c] hover:text-[#5d4037] bg-white/40 hover:bg-white/70 font-bold text-xs tracking-widest uppercase px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer hover:scale-102"
              >
                <ArrowLeft size={13} className="stroke-[3]" />
                <span>返回大廳廣場</span>
              </Button>
            </Link>

            {cardData && (
              <div className="bg-[#82b7cc]/10 border border-[#82b7cc]/25 rounded-2xl py-1.5 px-3.5 text-xs text-[#82b7cc] font-bold flex items-center gap-2 shadow-sm animate-pulse">
                <Sparkles size={12} />
                <span>已成功載入特工分享名片</span>
              </div>
            )}
          </div>

          {!cardData ? (
            <Card className="glass-panel text-[#5d4037] max-w-md w-full mt-8">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <span className="text-4xl">🔎</span>
                <h3 className="font-extrabold text-lg text-[#3e2723]">找不到名片</h3>
                <p className="text-xs text-[#8c7c6c]">該玩家的名片不存在或已設為私密。</p>
                <Link href="/browse" className="mt-2 w-full">
                  <Button className="w-full calm-btn-primary font-bold text-xs">前往大廳尋找其他隊友</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full animate-[fadeInUp_0.6s_ease-out]">
              {/* 名片卡片渲染 */}
              <div ref={cardRef} className="rounded-[28px] overflow-hidden bg-transparent shadow-lg max-w-[340px] w-full flex justify-center">
                <OWCard cardData={cardData} isLoggedIn={!!user} isEditable={false} />
              </div>

              {/* 控制按鈕區 */}
              <div className="w-full max-w-[340px] flex flex-col gap-3">
                <Button
                  onClick={handleExportImage}
                  disabled={exportingImage}
                  className="w-full bg-[#82b7cc] hover:bg-[#82b7cc]/90 text-white font-extrabold text-sm py-4.5 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>💾</span>
                  <span>{exportingImage ? "正在導出圖片..." : "保存此卡片為圖片"}</span>
                </Button>

                <Link href="/profile" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#8c7c6c]/20 hover:border-[#82b7cc]/50 text-[#8c7c6c] hover:text-[#82b7cc] bg-white/40 hover:bg-white/70 font-extrabold text-sm py-4.5 rounded-xl shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>✨</span>
                    <span>我也要建立特工名片</span>
                  </Button>
                </Link>
              </div>

              <p className="text-[11px] text-[#8c7c6c]/80 italic text-center max-w-[320px] font-semibold mt-2 leading-relaxed">
                💡 點擊名片上的 <b>BattleTag</b> 或是下方社群圖示即可快速複製對方的聯絡資訊！
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
