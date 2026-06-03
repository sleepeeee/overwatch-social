import type { Metadata } from "next";
import { getPublicProfile } from "@/app/actions/profile";
import ShareCardClient from "./ShareCardClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const player = await getPublicProfile(id);

  if (!player) {
    return { title: "找不到名片 | OW Social" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://overwatch-social.vercel.app";
  const firstHero = player.selected_heroes?.[0] ?? "ana";
  const ogImage = `${siteUrl}/images/heroes/avatars/${firstHero}.png`;

  const description = player.message
    || (player.tags?.length ? player.tags.join("、") : "查看這位特工的遊戲名片");

  return {
    title: `${player.battle_tag} 的 OW 名片 | OW Social`,
    description,
    openGraph: {
      title: `${player.battle_tag} 的 OW 名片`,
      description,
      images: [{ url: ogImage }],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${player.battle_tag} 的 OW 名片`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ShareCardPage({ params }: Props) {
  const { id } = await params;
  const cardData = await getPublicProfile(id);

  return <ShareCardClient cardData={cardData} />;
}
