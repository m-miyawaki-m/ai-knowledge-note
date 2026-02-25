---
title: "トランスフォーマー"
tags: [transformer, attention, positional-encoding]
created: 2026-02-25
updated: 2026-02-25
---

## Transformerの革新

2017年に発表された論文「Attention Is All You Need」で提案されたTransformerは、AI の歴史を大きく変えました。それまでの主流だったRNNは系列を逐次処理するため並列化が難しいという問題がありました。Transformerは[[Self-Attention]]機構によって入力系列全体を一度に処理でき、並列計算が可能です。入力テキストはまず[[トークン]]に分割され、[[エンベディング]]で数値ベクトルに変換されます。

## Self-Attentionの仕組み

Transformerの中核を成す[[Self-Attention]]は、各トークンが他のすべてのトークンとの関連度を計算する仕組みです。具体的には、[[Scaled Dot-Product Attention]]でQuery・Key間の類似度を算出し、Valueとの加重和でコンテキスト表現を得ます。これを複数の視点から同時に行うのが[[Multi-Head Attention]]で、異なるヘッドが構文・意味・参照関係など異なるパターンを捉えます。

## 位置情報の扱い

Self-Attentionは本来、トークンの順序を区別しません。「猫が犬を追う」と「犬が猫を追う」が同じ表現になってしまいます。そこで[[Positional Encoding]]が必要になります。元論文ではsin/cos関数による固定的な位置符号を使いましたが、現在のLLMの多くは[[RoPE（回転位置埋め込み）]]を採用しています。RoPEは相対的な位置関係を自然に表現でき、学習時より長い系列への対応も得意です。

## 用語

- **Scaled Dot-Product Attention（スケール化ドット積アテンション）**: QueryとKeyの内積をKeyの次元数の平方根で割ることで、勾配消失を防ぎつつAttention Weightを計算する手法。Softmaxで正規化後、Valueとの積でコンテキスト表現を得る。
- **Multi-Head Attention（マルチヘッドアテンション）**: Self-Attentionを複数のヘッド（部分空間）で並列に実行し、異なる観点からの注意パターンを捕捉する手法。各ヘッドの出力を結合・線形変換して最終的な表現を得る。
- **RoPE (Rotary Position Embedding)（回転位置埋め込み）**: 相対位置情報を回転行列として埋め込みベクトルに適用する手法。絶対位置と相対位置の両方の情報を自然に表現でき、系列長の外挿性能にも優れる。LLaMA, Qwen等の多くのLLMが採用。

## 参考

- [https://arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
