import Link from "next/link";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason ?? "unknown";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="text-5xl">⚠️</div>
      <h1 className="text-2xl font-bold text-red-400">登入失敗</h1>
      <p className="text-gray-400">
        {reason === "no_code" && "未收到授權碼，請重新嘗試登入。"}
        {reason === "exchange_failed" && "授權碼交換失敗，請重新嘗試登入。"}
        {reason === "unknown" && "發生未知錯誤，請重新嘗試登入。"}
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
      >
        返回首頁
      </Link>
    </div>
  );
}
