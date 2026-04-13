export default function TermsOfService() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white/80 text-sm leading-relaxed bg-[#052e16] min-h-dvh">
      <a href="/" className="inline-flex items-center gap-1 text-emerald-400 text-xs mb-8 hover:text-emerald-300">
        ← Back to MealPact
      </a>

      <h1 className="text-2xl font-bold text-white mb-2">Terms of Service / 利用規約</h1>
      <p className="text-white/40 mb-8">Last updated: April 12, 2026</p>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms / 規約への同意</h2>
        <p className="mb-2">
          By using MealPact (&quot;the App&quot;), you agree to these Terms of Service.
          If you do not agree, please do not use the App.
        </p>
        <p className="text-white/50">
          MealPact（「本アプリ」）を使用することで、本利用規約に同意したものとみなします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">2. Description of Service / サービスの説明</h2>
        <p className="mb-2">
          MealPact is an AI-powered meal tracking Mini App within World App. Users photograph
          meals for AI calorie analysis and may participate in weekly WLD commitment challenges.
        </p>
        <p className="text-white/50">
          MealPactはWorld App内のAI食事記録Mini Appです。食事写真のAIカロリー解析と、週間WLDコミットメントチャレンジへの参加ができます。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">3. Eligibility / 利用資格</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must have a World App wallet. / World Appウォレットが必要です。</li>
          <li>One account per wallet address. / ウォレットアドレスにつき1アカウント。</li>
          <li>You must be at least 18 years old. / 18歳以上である必要があります。</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">4. AI Analysis Disclaimer / AI解析の免責事項</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="mb-2">
            AI calorie estimates are <strong>approximate reference values only</strong> and do{" "}
            <strong>not</strong> constitute medical, nutritional, or dietary advice.
            MealPact is not liable for any health decisions made based on AI analysis.
          </p>
          <p className="text-white/50">
            AIによるカロリー推定は<strong>参考値のみ</strong>であり、医療・栄養アドバイスではありません。
            AI解析結果に基づく判断についてMealPactは責任を負いません。
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">5. WLD Commitment Challenge / WLDコミットメントチャレンジ</h2>
        <ul className="list-disc pl-5 space-y-1 mb-2">
          <li>Participation is entirely voluntary. / 参加は完全に任意です。</li>
          <li>Succeeding (5+ days logged) returns your deposit plus a share of unsuccessful participants&apos; deposits. / 成功時（5日以上記録）は預入額と脱落者分のボーナスが返還されます。</li>
          <li>Not succeeding means your deposit is distributed to successful participants. / 不成功の場合、預入額は成功者に分配されます。</li>
          <li>WLD transfers are subject to World App&apos;s payment infrastructure. / WLD送金はWorld Appの決済インフラに依存します。</li>
          <li>Challenge rules are automated and transparent. / チャレンジルールは自動化・透明化されています。</li>
        </ul>
        <p className="text-white/50 text-xs">
          ※ Phase 1 (MVP): WLD commitment is recorded in the database. Actual on-chain transfers will be implemented in Phase 2.
          フェーズ1（MVP）: WLDコミットメントはデータベースに記録されます。実際のオンチェーン送金はフェーズ2で実装予定。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">6. WLD Rewards & Tax Responsibility / WLD報酬と税務責任</h2>
        <p className="mb-2">
          WLD rewards distributed through challenge completion are gratuitous and may change
          or be discontinued at any time. You are solely responsible for any taxes or legal
          obligations arising from WLD received.
        </p>
        <p className="text-white/50">
          チャレンジ達成によるWLD報酬は随時変更・中止される可能性があります。
          受け取ったWLDに関する税務・法的義務はユーザーご自身の責任です。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">7. Prohibited Conduct / 禁止事項</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Creating multiple accounts to manipulate challenge pools. / 複数アカウントによるチャレンジプール操作。</li>
          <li>Submitting fraudulent meal photos. / 虚偽の食事写真の提出。</li>
          <li>Any attempt to exploit or manipulate the App. / アプリの悪用・操作の試み。</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">8. Disclaimer / 免責事項</h2>
        <p>
          The App is provided &quot;as is&quot; without warranties. MealPact is not responsible
          for losses arising from App use, AI inaccuracies, or WLD price fluctuations.
          / 本アプリは現状有姿で提供されます。AIの不正確さやWLD価格変動による損失についてMealPactは責任を負いません。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">9. Modifications / 変更</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use constitutes
          acceptance of the modified Terms.
          / 本規約はいつでも変更できます。変更後の継続利用は新規約への同意とみなします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">10. Governing Law / 準拠法</h2>
        <p>
          These Terms are governed by the laws of Japan. Disputes shall be resolved in
          the courts of Nagoya, Japan.
          / 本規約は日本法に準拠します。紛争は名古屋地方裁判所を専属管轄とします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">11. Contact / お問い合わせ</h2>
        <p>
          Contact us via the World App Mini App support channel.
          / World AppのMini Appサポートチャンネルからお問い合わせください。
        </p>
      </section>

      <div className="mt-10 pt-6 border-t border-white/10 flex gap-4 text-xs text-white/30">
        <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
        <a href="/" className="hover:text-white/60 transition-colors">← MealPact</a>
      </div>
    </main>
  );
}
