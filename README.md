# pstack for Oh My Pi

Oh My Pi（OMP）で調査、設計、実装、レビューを進めるためのスキル集です。`skill:poteto-mode` に目的を伝えると、依頼に合う手順と補助スキルを使って作業を進めます。

## インストール

```sh
omp plugin marketplace add arasan01/pstack
omp plugin install pstack@pstack
```

## 更新

```sh
omp plugin marketplace update && omp plugin upgrade
```

## Awesome other plugins

pstackとあわせて使う外部プラグインです。pstackには同梱していないため、別途インストールします。

### yomiyasu

[yomiyasu（よみやす）](https://github.com/nanaism/yomiyasu)は、AIが生成した日本語を、意味や条件を保ちながら読みやすく推敲するスキルです。

```sh
omp plugin marketplace add nanaism/yomiyasu
omp plugin install yomiyasu@yomiyasu
```

marketplaceを登録済みの場合は、`marketplace add`を省略してください。インストール後は、OMPで `skill:yomiyasu` を指定して推敲を依頼できます。

## 使い方

スキルコマンドが有効なOMPセッションでは `/skill:poteto-mode` を使います。無効にしている場合は、通常の依頼文で `skill:poteto-mode` を指定します。

動作や構造を変える前に、`skill:how`で機能全体と変更領域の現状をラフスケッチにし、責務や共有状態との整合を確認してから方針を立てます。`skill:architect`は、その現状図を再利用して変更後の構造を設計します。小さな変更では短い境界の整理に留め、毎回全体調査をやり直しません。

```text
/skill:poteto-mode この設定がどこで上書きされるか調べて。
```

```text
/skill:poteto-mode まず機能全体と変更領域をラフスケッチで示し、入力検証を追加する方針を立てて。今回は計画だけお願い。
```

```text
/skill:poteto-mode ページを切り替えると検索条件が消える不具合を直して。
```

個別のスキルもnative IDで指定できます。現状の俯瞰・変更前のラフスケッチには `skill:how`、変更後の設計には `skill:architect`、変更のレビューには `skill:interrogate` を使います。

```text
/skill:how この機能の入口、状態の所有者、他の利用箇所をラフスケッチで説明して。今回は現状図と制約の整理まで。
```

設計をサブエージェントへ任せる場合は、同梱の `architect` agent を使えます。`skill:architect` を使い、依頼時の範囲と停止条件に従います。agentの選択とスキルの参照は別です。

詳しい手順は [playbook 一覧](skills/poteto-mode/SKILL.md#playbooks)と[スキルのリファレンス](docs/reference.md)を参照してください。

## Advisorのセットアップ

スコープ拡大や終わらない調査を監視する [Scope & Completion Guardian](advisors/scope-completion/WATCHDOG.yml) を同梱しています。パッケージのインストールだけでは有効になりません。

ユーザーレベルのカスタムAdvisorとして配置します。標準の設定先 `~/.omp/agent` に `WATCHDOG.yml`・`WATCHDOG.yaml` がない場合に実行してください。

```sh
mkdir -p "$HOME/.omp/agent" && \
	test ! -e "$HOME/.omp/agent/WATCHDOG.yml" && \
	test ! -e "$HOME/.omp/agent/WATCHDOG.yaml" && \
	curl --fail --location --remove-on-error \
		https://raw.githubusercontent.com/arasan01/pstack/main/advisors/scope-completion/WATCHDOG.yml \
		--output "$HOME/.omp/agent/WATCHDOG.yml"
```

既存のユーザー設定がある場合や、名前付きプロファイル・`PI_CODING_AGENT_DIR` で設定先を変えている場合は、OMP内で次を実行し、`User` スコープを選んでください。同梱ファイルのエントリを既存の `advisors` リストへ追加し、既存設定を上書きしたり `advisors` キーを重複させたりしないでください。

```text
/advisor configure
```

OMPを起動し直します。

```sh
omp
```

OMP内で順に実行します。

```text
/advisor on
/advisor status
/advisor dump raw
```

`status` で実行モデルを、`dump raw` でGuardianの指示が読み込まれていることを確認します。`scope: main` は維持してください。Advisorの利用には追加のモデル呼び出しが発生します。既存Advisorとのマージ規則やレビューとの役割の違いは[リファレンス](docs/reference.md#scope-and-completion-advisor)を参照してください。

## 開発

checkout の root で `omp -e .` を実行すると、開発中のパッケージを読み込めます。

開発手順は [CONTRIBUTING.md](CONTRIBUTING.md)、動作確認は[検証ガイド](docs/verification.md)を参照してください。

## ライセンス

[Lauren Tan（poteto）の pstack](https://github.com/cursor/plugins/tree/main/pstack) と Michael Denyer の port を元にした fork です。

This package and its modifications are [MIT-licensed](LICENSE), © 2026 Michael Denyer. Original pstack © 2026 Lauren Tan; imported cursor-team-kit skills © 2026 Cursor. Japanese prose rules from stop-ai-slop-jp are © 2026 Daichi Nagashima under [MIT](LICENSE-stop-ai-slop-jp). See [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) and [NOTICE.md](NOTICE.md).
