# pstack for Oh My Pi

Oh My Pi（OMP）で調査、設計、実装、レビューを進めるためのスキル集です。`poteto-mode` に目的を伝えると、依頼に合う手順と補助スキルを使って作業を進めます。

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

OMP のセッションで `poteto-mode` に依頼します。

```text
poteto-mode で、この設定がどこで上書きされるか調べて。
```

```text
poteto-mode で、入力検証を追加する方針を立てて。今回は計画だけお願い。
```

```text
poteto-mode で、ページを切り替えると検索条件が消える不具合を直して。
```

個別のスキルも指定できます。設計には `architect`、仕組みの調査には `how`、変更のレビューには `interrogate` を使います。

詳しい手順は [playbook 一覧](skills/poteto-mode/SKILL.md#playbooks)と[スキルのリファレンス](docs/reference.md)を参照してください。

## 開発

checkout の root で `omp -e .` を実行すると、開発中のパッケージを読み込めます。

開発手順は [CONTRIBUTING.md](CONTRIBUTING.md)、動作確認は[検証ガイド](docs/verification.md)を参照してください。

## ライセンス

[Lauren Tan（poteto）の pstack](https://github.com/cursor/plugins/tree/main/pstack) と Michael Denyer の port を元にした fork です。

This package and its modifications are [MIT-licensed](LICENSE), © 2026 Michael Denyer. Original pstack © 2026 Lauren Tan; imported cursor-team-kit skills © 2026 Cursor. Japanese prose rules from stop-ai-slop-jp are © 2026 Daichi Nagashima under [MIT](LICENSE-stop-ai-slop-jp). See [LICENSE-cursor-team-kit](LICENSE-cursor-team-kit) and [NOTICE.md](NOTICE.md).
