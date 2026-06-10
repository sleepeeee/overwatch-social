import { Metadata } from "next";
import BrowseClient from "./BrowseClient";

export const metadata: Metadata = {
  title: "玩家名片廣場",
  description: "瀏覽各遊戲玩家的個性名片，找到與你頻率相通的隊友。",
};

export default function Page() {
  return <BrowseClient />;
}
