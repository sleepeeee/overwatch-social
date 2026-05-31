"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const ranks = ["銅牌", "銀牌", "金牌", "鉑金", "鑽石", "大師", "宗師", "Top 500"];
const roles = ["坦克", "輸出", "支援"];
const tagOptions = ["認真組排", "輕鬆休閒", "假日玩家", "每日上線", "有麥克風", "不開麥OK", "歡迎新手", "競技向", "工作族"];

const popularHeroes = [
  "源氏", "D.Va", "萊因哈特", "法拉", "麥卡利", "折劍", "安娜", "天使",
  "露西奧", "禪雅塔", "溫斯頓", "死神", "半藏", "蒼鷺", "艾許", "英佩拉",
];

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "", age: "", bio: "", rank: "", role: "", hero: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">建立我的檔案</h1>
        <p className="text-gray-400">讓其他玩家認識你！</p>
      </div>

      <div className="space-y-6">
        {/* 基本資料 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-bold text-lg text-orange-400">基本資料</h2>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">顯示名稱</label>
              <Input
                placeholder="你想讓大家怎麼稱呼你？"
                className="bg-gray-800 border-gray-700 text-white"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">年齡</label>
              <Input
                type="number"
                placeholder="例如：22"
                className="bg-gray-800 border-gray-700 text-white w-32"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">自我介紹</label>
              <Textarea
                placeholder="說說你自己、你的遊戲風格、或想找什麼樣的隊友..."
                className="bg-gray-800 border-gray-700 text-white resize-none"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 遊戲資料 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-bold text-lg text-orange-400">遊戲資料</h2>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">目前段位</label>
              <div className="flex flex-wrap gap-2">
                {ranks.map((r) => (
                  <Badge
                    key={r}
                    variant="secondary"
                    onClick={() => setForm({ ...form, rank: r })}
                    className={`cursor-pointer px-3 py-1 text-sm transition-colors ${
                      form.rank === r
                        ? "bg-orange-500 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">主要角色</label>
              <div className="flex gap-3">
                {roles.map((r) => (
                  <Badge
                    key={r}
                    onClick={() => setForm({ ...form, role: r })}
                    className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                      form.role === r
                        ? "bg-orange-500 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {r === "坦克" ? "🛡️" : r === "輸出" ? "⚡" : "💚"} {r}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">主玩英雄</label>
              <div className="flex flex-wrap gap-2">
                {popularHeroes.map((h) => (
                  <Badge
                    key={h}
                    variant="secondary"
                    onClick={() => setForm({ ...form, hero: h })}
                    className={`cursor-pointer px-3 py-1 text-sm transition-colors ${
                      form.hero === h
                        ? "bg-orange-500 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 標籤 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-bold text-lg text-orange-400">我的標籤</h2>
            <p className="text-sm text-gray-400">選擇能描述你的標籤（可多選）</p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer px-3 py-1 text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-base font-bold"
        >
          {saved ? "✓ 儲存成功！" : "儲存我的檔案"}
        </Button>
      </div>
    </div>
  );
}
