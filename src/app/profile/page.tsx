import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "玩家個人工作室",
  description: "撰寫您的深夜星語，客製守望者、特工或是召喚師名片。",
};

export default function Page() {
  return <ProfileClient />;
}
