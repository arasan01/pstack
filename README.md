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

## 使い方

スキルコマンドが有効なOMPセッションでは `/skill:poteto-mode` を使います。無効にしている場合は、通常の依頼文で `skill:poteto-mode` を指定します。

```text
/skill:poteto-mode この設定がどこで上書きされるか調べて。
```

```text
/skill:poteto-mode 入力検証を追加する方針を立てて。今回は計画だけお願い。
```

```text
/skill:poteto-mode ページを切り替えると検索条件が消える不具合を直して。
```

個別のスキルもnative IDで指定できます。設計には `skill:architect`、仕組みの調査には `skill:how`、変更のレビューには `skill:interrogate` を使います。

設計をサブエージェントへ任せる場合は、同梱の `architect` agent を使えます。`skill:architect` を使い、依頼時の範囲と停止条件に従います。agentの選択とスキルの参照は別です。

スコープ拡大や終わらない調査を監視する [Scope & Completion Guardian](docs/models.md#scope-and-completion-advisor) も同梱しています。Advisor は明示的に導入する方式で、インストールだけでは有効になりません。

詳しい手順は [playbook 一覧](skills/poteto-mode/SKILL.md#playbooks)と[スキルのリファレンス](docs/reference.md)を参照してください。

## 開発

checkout の root で `omp -e .` を実行すると、開発中のパッケージを読み込めます。

開発手順は [CONTRIBUTING.md](CONTRIBUTING.md)、動作確認は[検証ガイド](docs/verification.md)を参照してください。

## ライセンス

[Lauren Tan（poteto）の pstack](https://github.com/cursor/plugins/tree/main/pstack) と Michael Denyer の port を元にした fork です。

This package and its modifications are [MIT-licensed](LICENSE), © 2026 Michael Denyer. Original pstack © 2026 Lauren Tan; imported cursor-team-kit skills © 2026 Cursor. Japanese prose rules from stop-ai-slop-jp are © 2026 Daichi Nagashima under [MIT](LICENSE-stop-ai-slop-jp). See [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) and [NOTICE.md](NOTICE.md).
