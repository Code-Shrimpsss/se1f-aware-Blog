# Self-Awake · 完整体呼吸

这是全新、独立、只用于视觉审批的原型。它不继承 V2 / V3 的碎片、道路、地貌或 HUD 语言，也没有修改正式博客。

## 本地查看

```text
http://127.0.0.1:4173/design-prototypes/prototype-complete-body-breathing/
```

确定性状态：

```text
?shot=core
?demo=breath
?demo=approach
?motion=reduce
```

## 仅有的三项交付

- `outputs/01-core-static.png`
- `outputs/02-breath-7.2s.mp4`
- `outputs/03-first-scroll.mp4`

两段视频当前用于静默视觉审批，不代表声音设计已经完成。

## 录制

本机已验证的确定性录制命令：

```bash
/usr/bin/python3 scripts/capture.py
```

脚本使用 1440×900、60fps 逐帧渲染，再由 FFmpeg 编码为 H.264。第一次呼吸严格为 432 帧 / 7.200 秒；第一次滚动为 504 帧 / 8.400 秒。所有临时 PNG 帧只存放在 `/tmp`。

