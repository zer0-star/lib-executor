# これはなに
あなたのライブラリを手元のファイルに展開するための VSCode 拡張機能です。主に、競技プログラミングでの使用が想定されています。

# Install
まだ Marketplace での公開はされていないので、自分で`vsix`ファイルをビルドしてインストールする必要があります。以下の手順で`vsix`ファイルをビルドした後、[こちらの手順](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix)にしたがってインストールしてください。

```sh
$ git clone https://github.com/zer0-star/lib-executor.git
$ cd lib-executor
$ yarn install
$ vsce package
```

# 使い方
## 使用する前に
インストール後、あなたのライブラリのディレクトリを Setting より指定してください。その後、一度ウィンドウを再読み込みする必要があります。Command Palette から`Developer: Reload Window`を選択してください。

## ライブラリの構成
実際に使用しているライブラリが[こちら](https://github.com/zer0-star/library/)にあります。参考にしてください。

## 基本的な使い方
Command Palette から`lib-executor: execute`を選ぶことで、展開するファイルの選択ができます。Mac の場合は、`Cmd+Ctrl+e`でも同様のことができます。(Mac 以外については、近々対応する予定です……)

## コマンドの使い方
\[0~5文字(コメント想定)\]lib-executor: \[コマンド\] \[引数\] ...

### 使えるコマンド
`include [file]`
コマンドの書かれた行に`[file]`を展開します。

`replace [file]`
次に現れる`end`までを`[file]`を展開した内容に置き換えます。

