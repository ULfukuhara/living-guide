// 入居者向けの外部リンク。管理会社用・オーナー用のログインURLと混同しないこと。
// ストアURLは既存 guides_master/kurasapo_connect の案内と同一。
export const KURASAPO_LINKS = Object.freeze({
  official: "https://www.kurasapo-connect.com/",
  android: "https://play.google.com/store/apps/details?id=com.njc.renterservice",
  ios: "https://apps.apple.com/jp/app/id1420383637"
});

// ログイン相談先（管理会社指定）。表示と mailto を同じ設定から生成する。
export const MANAGEMENT_CONTACT_EMAIL = "kanri@univlife.com";

// 物件・部屋専用しおりへの復帰に必要なパラメータのみ、同一サイト内で引き継ぐ。
export function guideHref(path, search = window.location.search) {
  const source = new URLSearchParams(search);
  const params = new URLSearchParams();
  for (const key of ["propertyNo", "token"]) {
    const value = source.get(key);
    if (value) params.set(key, value);
  }
  return path + (params.size ? `?${params}` : "");
}
