"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Moon, Copy, ExternalLink } from "lucide-react";
import TopBar from "@/components/TopBar";
import OWCard from "@/components/OWCard";
import FluidClipPath from "@/components/morning-sketch/FluidClipPath";
import { toPng } from "html-to-image";
import type { OWPlayerCard } from "@/types/card";

// 預設的 Mock 玩家資料，供開發與測試時展示
const MOCK_PROFILES: Record<string, OWPlayerCard> = {
  "mock-user-id": {
    card_id: "card-mock-1",
    user_id: "mock-user-id",
    server: "Asia Server",
    battle_tag: "狂暴補師星奈#3342",
    is_tag_visible: true,
    selected_heroes: ["ana", "mercy", "kiriko"],
    tags: ["認真組排", "語音交流", "拒絕暴躁"],
    message: "主玩安娜與慈悲，專注後排抬血，找心態成熟的輸出或坦雙排！",
    languages: ["繁體中文", "English"],
    mic_status: "mic-on",
    social_channels: {
      discord: "seina#3342",
      line: "seina_line"
    },
    mbti: "ENFP"
  },
  "user-current-user": {
    card_id: "card-current-user",
    user_id: "user-current-user",
    server: "Asia Server",
    battle_tag: "愛喝奶茶#3342",
    is_tag_visible: true,
    selected_heroes: ["winston", "tracer"],
    tags: ["團隊至上", "主坦玩家"],
    message: "GGWP！一起加油，推車到底啦 🚀",
    languages: ["繁體中文"],
    mic_status: "mic-on",
    social_channels: {
      discord: "akira#1234"
    },
    mbti: "INFJ"
  }
};

export default function ShareCardPage() {
  const params = useParams();
  const id = params.id as string;
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<OWPlayerCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingImage, setExportingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 載入名片資料
  useEffect(() => {
    const fetchCardData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // ----------------------------------------------------
        // 💡 後端朋友對接指示：
        // 請取消以下註解，並用您的 Supabase 客戶端替換資料讀取邏輯：
        // 
        // const { data, error } = await supabase
        //   .from('public_profiles')
        //   .select('*')
        //   .eq('user_id', id)
        //   .single();
        // 
        // if (error) throw error;
        // if (data) {
        //   setCardData({
        //     card_id: `card-${data.user_id}`,
        //     user_id: data.user_id,
        //     server: data.server,
        //     battle_tag: data.battle_tag,
        //     is_tag_visible: data.is_tag_visible,
        //     selected_heroes: data.selected_heroes || [],
        //     tags: data.tags || [],
        //     message: data.message || "",
        //     languages: data.languages || ["繁體中文"],
        //     mic_status: data.mic_status || "mic-off",
        //     social_channels: data.social_channels || {},
        //     mbti: data.mbti
        //   });
        // } else {
        //   throw new Error("找不到名片");
        // }
        // ----------------------------------------------------

        // 目前為模擬讀取邏輯 (如果找不到就使用預設的星奈卡片)
        await new Promise((resolve) => setTimeout(resolve, 600));
        const matched = MOCK_PROFILES[id] || MOCK_PROFILES["mock-user-id"];
        setCardData({
          ...matched,
          // 如果網址中的 ID 不是預設的，動態替換 ID
          user_id: id,
          battle_tag: id === "mock-user-id" ? matched.battle_tag : `特工#${id.slice(0, 4)}`
        });
      } catch (err) {
        console.error("載入名片失敗:", err);
        setErrorMsg("找不到該玩家的卡片資訊。");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCardData();
    }
  }, [id]);

  // 保存卡片為圖片
  const handleExportImage = async () => {
    if (!cardRef.current || !cardData) return;
    setExportingImage(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "transparent",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left"
        }
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

  if (loading) {
    return (
      <div className="min-h-screen relative pb-32 flex flex-col items-center justify-center gap-4">
        <FluidClipPath />
        <div className="w-12 h-12 border-4 border-[#82b7cc] border-t-transparent rounded-full animate-spin z-10"></div>
        <p className="text-[#8c7c6c] text-sm font-bold animate-pulse z-10">正在開啟特工名片傳送門...</p>
      </div>
    );
  }

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

            <div className="bg-[#82b7cc]/10 border border-[#82b7cc]/25 rounded-2xl py-1.5 px-3.5 text-xs text-[#82b7cc] font-bold flex items-center gap-2 shadow-sm animate-pulse">
              <Sparkles size={12} />
              <span>已成功載入特工分享名片</span>
            </div>
          </div>

          {errorMsg ? (
            <Card className="glass-panel text-[#5d4037] max-w-md w-full mt-8">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <span className="text-4xl">🔎</span>
                <h3 className="font-extrabold text-lg text-[#3e2723]">名片載入失敗</h3>
                <p className="text-xs text-[#8c7c6c]">{errorMsg}</p>
                <Link href="/browse" className="mt-2 w-full">
                  <Button className="w-full calm-btn-primary font-bold text-xs">前往大廳尋找其他隊友</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            cardData && (
              <div className="flex flex-col items-center gap-6 w-full animate-[fadeInUp_0.6s_ease-out]">
                {/* 名片卡片渲染 (Ref 指向它) */}
                <div ref={cardRef} className="rounded-[28px] overflow-hidden bg-transparent shadow-lg max-w-[340px] w-full flex justify-center">
                  <OWCard cardData={cardData} isLoggedIn={true} isEditable={false} />
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
            )
          )}
        </div>
      </main>
    </div>
  );
}
