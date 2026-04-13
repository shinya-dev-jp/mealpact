export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white/80 text-sm leading-relaxed bg-[#052e16] min-h-dvh">
      <a href="/" className="inline-flex items-center gap-1 text-emerald-400 text-xs mb-8 hover:text-emerald-300">
        ← Back to MealPact
      </a>

      <h1 className="text-2xl font-bold text-white mb-2">Privacy Policy / プライバシーポリシー</h1>
      <p className="text-white/40 mb-8">Last updated: April 12, 2026</p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">1. Overview / 概要</h2>
        <p className="mb-2">
          MealPact (&quot;the App&quot;) is an AI-powered meal tracking Mini App within World App.
          This Privacy Policy explains how we handle your information.
        </p>
        <p className="text-white/50">
          MealPact（「本アプリ」）は、World App内で動作するAI食事記録Mini Appです。
          本プライバシーポリシーでは、お客様の情報の取り扱いについて説明します。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">2. Information We Collect / 収集する情報</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Wallet Address:</strong> Your World App wallet address, used as a unique account identifier.
            <br /><span className="text-white/50">ウォレットアドレス: アカウント識別子として使用。</span>
          </li>
          <li>
            <strong>Verification Level:</strong> Whether you are Orb-verified or Device-verified (no biometric data stored).
            <br /><span className="text-white/50">認証レベル: Orb認証またはデバイス認証（生体データは保存しません）。</span>
          </li>
          <li>
            <strong>Meal Logs:</strong> Calorie totals, macronutrient data, and meal type (breakfast/lunch/dinner/snack) that you explicitly save.
            <br /><span className="text-white/50">食事ログ: お客様が明示的に保存したカロリー合計、栄養素データ、食事タイプ。</span>
          </li>
          <li>
            <strong>Challenge Participation:</strong> Your weekly challenge status and streak data.
            <br /><span className="text-white/50">チャレンジ参加状況: 週間チャレンジの状況とストリークデータ。</span>
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">3. Food Photos / 食事写真について</h2>
        <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 space-y-2">
          <p>
            <strong>Food photos are used solely for calorie analysis and are NOT stored on our servers.</strong>{" "}
            Photos are transmitted directly to Google&apos;s Gemini AI API for analysis, then immediately discarded.
            Only the resulting calorie and nutrient data (numbers) are stored.
          </p>
          <p className="text-white/50">
            <strong>食事写真はカロリー解析のみに使用し、サーバーには保存しません。</strong>
            写真はGoogleのGemini AI APIに直接送信されて解析後、即座に破棄されます。
            保存されるのはカロリー・栄養素の数値データのみです。
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">4. AI Analysis Disclaimer / AI解析の免責事項</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
          <p>
            Calorie and nutrient estimates provided by AI are <strong>approximate reference values only</strong> and
            do not constitute medical or nutritional advice. Always consult a qualified healthcare professional
            for dietary guidance.
          </p>
          <p className="text-white/50">
            AIによるカロリー・栄養素の推定は<strong>参考値にすぎず</strong>、医療・栄養アドバイスではありません。
            食事に関する医学的な指導は、必ず資格のある医療専門家にご相談ください。
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">5. WLD Commitment Challenge / WLDコミットメントチャレンジ</h2>
        <p className="mb-2">
          When you join a weekly challenge, your WLD deposit amount and participation status are recorded.
          If you succeed (5+ days logged), your deposit is returned plus a bonus from unsuccessful participants.
          If you do not succeed, your deposit is distributed to successful participants.
          All records are transparent and auditable.
        </p>
        <p className="text-white/50">
          週間チャレンジに参加すると、WLD預入額と参加状況が記録されます。
          成功（5日以上記録）した場合、預入額と脱落者分のボーナスが返還されます。
          不成功の場合、預入額は成功者に分配されます。全記録は透明かつ監査可能です。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">6. Data Storage / データ保存</h2>
        <p>
          Data is stored on Supabase servers (Asia-Pacific region, Tokyo, Japan).
          Food photos are never stored — only processed in transit.
        </p>
        <p className="text-white/50 mt-1">
          データはSupabaseサーバー（アジア太平洋地域、東京）に保存されます。
          食事写真は一切保存されず、通信中にのみ処理されます。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">7. Data Sharing / データ共有</h2>
        <p>
          We do not sell or share your personal data. Aggregate, anonymized statistics
          (e.g., total challenge participants) may be displayed publicly.
          Food photos are shared only with Google Gemini API for real-time analysis.
        </p>
        <p className="text-white/50 mt-1">
          個人データの販売・共有は行いません。集計・匿名化された統計情報のみ公開されることがあります。
          食事写真はリアルタイム解析のためGoogleのGemini APIにのみ送信されます。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">8. Your Rights / お客様の権利</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Access / アクセス:</strong> View your meal logs and stats within the App.
          </li>
          <li>
            <strong>Deletion / 削除:</strong> Request deletion of your account and data by contacting us.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">9. Children&apos;s Privacy / 未成年者のプライバシー</h2>
        <p>
          The App requires World ID wallet authentication. We do not knowingly collect data from
          children under 18. / 本アプリはWorld IDウォレット認証が必要です。18歳未満のデータを故意に収集することはありません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">10. Contact / お問い合わせ</h2>
        <p>
          For questions, please contact us via the World App Mini App support channel.
          <br /><span className="text-white/50">ご質問はWorld AppのMini Appサポートチャンネルからお問い合わせください。</span>
        </p>
      </section>

      <div className="mt-10 pt-6 border-t border-white/10 flex gap-4 text-xs text-white/30">
        <a href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</a>
        <a href="/" className="hover:text-white/60 transition-colors">← MealPact</a>
      </div>
    </main>
  );
}
