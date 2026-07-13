# Self-Awake Möbius — 验证、完成项与暂缓项

## 验证命令

```bash
/usr/bin/python3 tools/capture_full_journey.py \
  --url http://127.0.0.1:4173/design-prototypes/prototype-mobius-consciousness-spine/ \
  --strict \
  --output-dir outputs/full-journey

/usr/bin/python3 tools/capture_full_journey.py \
  --url http://127.0.0.1:4173/design-prototypes/prototype-mobius-consciousness-spine/ \
  --motion reduce \
  --strict \
  --output-dir outputs/reduced-motion
```

项目级生产构建：

```bash
yarn build
```

## 当前自动检查

- 16 个整数状态静帧；
- 9 个审核关键帧；
- 30 个机械接缝与因果连续性帧；
- 10 个导演构图帧；
- 5 个 390×844 移动构图；
- 41.8 秒完整旅程录像；
- normal 与 reduced-motion 两套录像；
- 控制台错误、页面错误、失败请求、HTTP 错误、外部请求；
- 桌面与移动横向溢出；
- 90 帧基础帧率抽样。

最近一次中间验证结果：高性能档平均 60fps，P95 18.2ms，最大 18.6ms；桌面与五个移动状态均无横向溢出；严格检查通过。

本轮思想节点精修额外检查了吸收、新观点生成与观点融合三个事件：桌面 1440×900、移动 390×844 和 reduced-motion 均成功启用 WebGL；移动端 `scrollWidth === clientWidth`；浏览器控制台无 error/warn；项目级 `yarn build` 通过。审核截图位于 `outputs/thought-node-refinement/`。

## 已完成

- 单一莫比乌斯空间骨架与完整 0—15 体验；
- 非等长导演节奏和可逆相机链；
- 内外翻面闪屏修复；
- 观象地图路线与大黑线修复；
- 构序过去文字可读性修复；
- 观心经同一房间开口离开；
- 白点、静默、问题和远端回应结尾；
- 统一骨白程序材质、分幕灯光、微观粗糙度与轻量距离雾；
- 同一思想节点跨四层改变存在形态；
- 三块来源表面同曲率，并由关系负空间生成新观点；
- 新观点沿莫比乌斯曲面融合，改变局部曲率、光路与运行节律；
- 独立文案数据与触发元数据；
- 现实锚点、声音状态接口、本地路径状态；
- reduced-motion 与性能分级；
- 页面失焦暂停。

## 暂缓

- 正式音乐与精细空间音频资产；
- 真实文章索引和文章入口；
- 评论、多语言、收藏、登录、推荐与内容后台；
- 正式博客整合；
- 依赖真实阅读数据的回访形变。

## 已知限制

- 当前时间层使用排序后的半透明几何，不是多通道深度剥离；极端角度仍可能出现透明排序感。
- 移动端构序保留双表面对齐，信息密度高于其他移动构图，但文字已保持可读且无裁切。
- 声音按钮当前控制状态与事件接口；在正式音频资产确认前不会制造占位背景音乐。
