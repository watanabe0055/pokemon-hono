import { fetchUserProfile } from "@/app/lib/fetch/user";
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PrivatePage() {
  const supabase = await createClient();

  // ユーザー認証情報の取得
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session) {
    redirect("/login");
  }

  // バックエンドAPIからプロフィール情報を取得
  try {
    const profileData = await fetchUserProfile(session.access_token);
    console.log('Profile data:', profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
  }

  const handleLogout = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-2xl">
        <h1 className="mb-6 text-3xl font-semibold text-center text-gray-700">
          ようこそ
        </h1>
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-600">
            こんにちは、{" "}
            <span className="font-medium text-blue-600">{session.user.email}</span>
            さん
          </p>
          <p className="mt-2 text-sm text-gray-500">
            お帰りなさい！
          </p>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <h2 className="mb-2 text-lg font-medium text-gray-700">
              プロフィール情報
            </h2>
            <p className="text-sm text-gray-600">
              <strong>ID:</strong> {session.user.id}
            </p>
            <p className="text-sm text-gray-600">
              <strong>最終ログイン:</strong>{" "}
              {session.user.last_sign_in_at
                ? new Date(session.user.last_sign_in_at).toLocaleString('ja-JP')
                : "データなし"}
            </p>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-pink-800 transition duration-300 ease-in-out bg-pink-200 rounded-md hover:bg-pink-300"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
