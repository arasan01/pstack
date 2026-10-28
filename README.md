# pstack for Oh My Pi

Oh My Pi（OMP）専用のスキル・ワークフローパッケージです。`poteto-mode` が依頼に合う手順と補助スキルを選び、調査、計画、設計、実装、レビューを進めます。

GPT と DeepSeek は OMP のネイティブ provider とモデルロールで利用します。このパッケージは別のエージェント実行基盤やモデルルーターを作りません。Claude Code、Codex CLI、Copilot CLI、Pi 向けの設定・フック・ラッパーは提供しません。OMP の `openai-codex` や `github-copilot` provider は、これらの CLI 対応とは別です。

## インストールする

OMP を導入済みの環境で実行します。旧 marketplace 版を使っている場合は、先に後述の移行手順で旧版を外してください。

```sh
omp plugin install github:arasan01/pstack
```

`0.10.0` 以降はリポジトリの root が OMP パッケージです。旧 `plugins/pstack` や marketplace 形式の導入からは、root パッケージへ導入し直してください。旧版との二重導入を避け、設定・プリセット・認証情報は自分で選んだものを引き続き使います。pstack がユーザー設定を自動で書き換えることはありません。

### 旧 marketplace 版から移行する

1. `omp plugin list` で旧 `pstack@...` の ID を確認し、その ID を引数に `omp plugin uninstall` を実行して旧版だけを外します。
2. `omp plugin marketplace list` で旧登録を確認します。pstack 専用の marketplace なら、登録名を引数に `omp plugin marketplace remove` を実行して外します。他のプラグインも使う marketplace は削除しません。
3. 上の GitHub 直接導入コマンドで、root パッケージをインストールします。

### checkout を開発用に読み込む

開発中の checkout をインストールせず、1 セッションだけ読み込む場合は、その root で実行します。

```sh
omp -e .
```

## 更新する

### GitHub から直接導入した pstack を更新する

上のインストール方法では、プラグイン名を指定して更新します。

```sh
omp plugin upgrade pstack
```

### marketplace から導入したプラグインを更新する

marketplace の情報更新と、インストール済みプラグインの更新を続けて実行します。

```sh
omp plugin marketplace update && omp plugin upgrade
```

引数なしの `omp plugin upgrade` は marketplace 導入分が対象です。GitHub 直接導入版の pstack の更新を兼ねるものではありません。

## poteto-mode に依頼する

OMP のセッションで、目的と作業範囲を伝えます。補助スキルを毎回すべて指定する必要はありません。

```text
poteto-mode で、この設定がどこで上書きされるか調査して。変更はしないで。
```

```text
poteto-mode で、入力検証を追加する方針を立てて。今回は計画だけで、実装には進まないで。
```

```text
poteto-mode で、ページを切り替えると検索条件が消える不具合を直して。実際の動作も確認して。
```

調査は根拠付きの回答、計画は計画、実装は変更と実行確認までが成果物です。すべての依頼を設計判断だけで終えたり、調査・計画を勝手に実装や PR 作成へ進めたりしません。

`architect`、`arena`、`swarm`、`how`、`why`、`interrogate` などは手法を定めるスキルです。スキルと同名のエージェントを要求する仕組みではありません。サブエージェントの起動には OMP の `task` を使い、設計・方針の統合と、`scout` による探索や `sonic` による機械的作業を区別します。

使える手順は [poteto-mode の playbook 一覧](skills/poteto-mode/SKILL.md#playbooks)を参照してください。

## GPT・DeepSeek のロールを選ぶ

まず、その環境で利用可能なモデルを確認します。

```sh
omp models --json
omp models find deepseek --json
```

リポジトリには OMP ネイティブの設定例があります。checkout の root から、使いたいものを明示します。

```sh
omp --config profiles/gpt.yml
omp --config profiles/deepseek.yml
omp --config profiles/mixed.yml
```

これらは導入済みモデルの保証ではなく、その起動にだけ適用する overlay です。モデル名・reasoning effort は自分の provider と利用可能なモデルに合わせてください。

設定例では、通常の worker は `task` から `@slow` を参照し、探索・機械的作業には `smol`、計画モードには `plan`、独立レビューには `review` を使います。GPT と DeepSeek のどちらかを常に安価な worker 専用に固定しません。実際の解決は `modelRoles`、`task.agentModelOverrides` と OMP のネイティブ方針に従います。

セッション内の `/pstack` は、現在の選択とロールの解決状況を設定変更なしで表示します。モデルが表示されることと、認証・quota・推論・作業完了が成功することは別です。

詳しくは[モデル設定ガイド](docs/models.md)と[設定例](profiles/README.md)を参照してください。

## 動作を検証する

Bun 1.3.14 以降と OMP を使います。

```sh
bun install --frozen-lockfile
bun run validate
bun test tests/
bun run test:smoke --discovery-only
```

実モデルの検証は、対象を明示します。

```sh
bun run test:smoke --scenario all --model openai-codex/gpt-6.1-sol
```

スモーク検証は実際の OMP を起動し、スキルの読込、調査、計画の停止境界、実装の公開 API、子タスクの実行モデルを確認します。別モデルへの fallback や、利用できない DeepSeek を成功として扱いません。手順・実行条件・証拠の読み方は[検証ガイド](docs/verification.md)にあります。

並行処理の不変条件には [formal verification](skills/create-formal-verification-skill/SKILL.md) と、その[保守スキル](skills/maintain-formal-verification-skill/SKILL.md)を使えます。[statechart](skills/statechart/SKILL.md) は TLA+ モデルを検査し、状態遷移と違反への最短経路を表示します。

## データと権限を確認する

pstack 自体にサーバーや telemetry はありません。エージェントが読む内容は、OMP で選択したモデル provider に送られます。スクリプトはローカルで動きますが、OS の sandbox を提供するものではありません。権限・認証・fallback・セッションの寿命は OMP が管理します。PR 操作は利用可能なネイティブツールかローカルの GitHub CLI を使います。

## 開発・由来・ライセンス

開発手順は [CONTRIBUTING.md](CONTRIBUTING.md)、機能とコマンドは[リファレンス](docs/reference.md)、脆弱性の報告方法は [SECURITY.md](SECURITY.md) を参照してください。

[Lauren Tan（poteto）の pstack](https://github.com/cursor/plugins/tree/main/pstack) と Michael Denyer の port を元にした fork です。

This package and its modifications are [MIT-licensed](LICENSE), © 2026 Michael Denyer. Original pstack © 2026 Lauren Tan; imported cursor-team-kit skills © 2026 Cursor. Japanese prose rules from stop-ai-slop-jp are © 2026 Daichi Nagashima under [MIT](LICENSE-stop-ai-slop-jp). See [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) and [NOTICE.md](NOTICE.md).
