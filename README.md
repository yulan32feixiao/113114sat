# Band Seven

数字 SAT 定向刷题工具。3,311 道 College Board 官方题，按考点和官方分数段出题，带官方逐选项解析、错题集间隔复习、AI 逐题拆解和 Word 导出。

纯静态页面，没有后端。打开就能用。

## 题目来源

全部来自 College Board 公开发布的 [SAT Suite Educator Question Bank](https://satsuiteeducatorquestionbank.collegeboard.org/)（无需登录）。抓取接口：

```
POST https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-questions
POST https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/get-question
```

抓取日期 2026-09-09，接口返回 3,770 条。其中 459 条 `external_id` 为空的 legacy 纸质书题目结构不同、公式以 base64 图片内嵌，已排除。保留 3,311 道数字 SAT 原生题，每道都带官方 rationale。

| Domain | 题数 | | Domain | 题数 |
|---|---|---|---|---|
| Information and Ideas | 555 | | Algebra | 616 |
| Craft and Structure | 471 | | Advanced Math | 540 |
| Standard English Conventions | 421 | | Problem-Solving and Data Analysis | 421 |
| Expression of Ideas | 398 | | Geometry and Trigonometry | 287 |

**题目与官方解析版权归 College Board 所有。** 本仓库仅作个人备考使用，不作任何商业用途。

## 参考资料

分数段、考点占比等数据的出处：

- [Skills Insight for the SAT Suite](https://satsuite.collegeboard.org/media/pdf/skills-insight-digital-sat-suite.pdf)（2026 年 7 月版）— 七个 performance score band 的分数区间
- [Digital SAT Suite Specifications Overview](https://satsuite.collegeboard.org/media/pdf/digital-sat-test-spec-overview.pdf) — domain 占比与题数
- [Assessment Framework for the Digital SAT Suite](https://satsuite.collegeboard.org/media/pdf/assessment-framework-for-digital-sat-suite.pdf) v3.01 — 考点定义
- [How the SAT Is Structured](https://satsuite.collegeboard.org/sat/whats-on-the-test/structure)

## 功能

- **按考点出题** — 4 个 section domain、33 个官方考点、难度 E/M/H、官方 score band 1–7 任意组合
- **答案提交前不可见** — 官方题库网页版一打开答案就在旁边，这里不是
- **错因标注** — 答错必须选一个：知识点不会 / 读错题 / 排除不掉干扰项 / 计算失误 / 时间不够
- **错题集** — 自动收录，Leitner 间隔重复（1 / 3 / 7 / 16 天），答错退回第一天
- **AI 拆解** — 讲这道题考什么能力、干扰项怎么设计的、你缺哪一块。可以写长期偏好，也可以逐条反馈，反馈会拼进后续请求
- **Bluebook 风格答题** — 双栏、计时、标记、右键划掉选项、暂停、字号调节
- **模考模式** — 按官方规格：R&W 两模块各 27 题 / 32 分钟，Math 两模块各 22 题 / 35 分钟，中间休息 10 分钟，第二模块按第一模块表现自适应路由。全部交卷后一次性出报告
- **学习时长** — 每场净答题时长（不含暂停），今天 / 本周 / 累计 / 练习天数
- **导入试卷** — 上传 PDF 或 .docx，DeepSeek 整理成可作答的试卷，按 SAT 标准配速计时
- **Word 导出** — 练习记录、模考报告或整本错题本导出为 .docx

## 用法

打开网站即可刷题。**AI 拆解需要自己的 DeepSeek API key**：

1. 到 [platform.deepseek.com](https://platform.deepseek.com/) 创建一个 API key
2. 网站里进「设置」，填进去，点「测试连接」
3. key 只存在你自己浏览器的 localStorage 里 — 不在本仓库代码中，不经过任何中间服务器

不填 key 也能用：刷题、官方解析、错题集、Word 导出都不受影响。

### 换电脑

没有账号系统，记录存在浏览器本地。换设备用「设置 → 导出进度」拿到一个 JSON，到新设备导入。清缓存 / 换浏览器 / 无痕窗口都会丢记录，建议每周导出一次。

## 重新生成题库

```bash
cd tools
python3 fetch_bank.py      # 拉取 3,770 条 -> raw.json
python3 normalize.py       # 清洗、修 MathML mfenced -> bank.json
python3 build_bank.py      # gzip -> bank.bin
```

`normalize.py` 会把 MathML 里的 `<mfenced>` 重写成 `<mrow><mo>(</mo>…<mo>)</mo></mrow>` —— Chrome 的 MathML Core 已经不支持 `mfenced`，不改的话公式里的括号会整个消失，含义就错了。

## 已知局限

- 题库题是官方发布的练习题，**不是某一次真考的原题**
- `score_band_range_cd` 是题目属性（这道题主要区分哪个分数段的考生），**不是你的预测分**。要分数只能做 Bluebook 完整自适应模考
- 日常刷题模式**不自适应**（定向练考点，用途不同）；模考模式会按第一模块表现路由第二模块，但路由阈值是估的
- 刷题模式的计时器按 R&W 每题 ≈71 秒、Math ≈95 秒的平均配速提示，真考不按单题计时
- 几何图形是内嵌 SVG、线条为黑色，因此一律放在白底板上，深色主题下也是白底
- Word 导出里数学公式用 College Board 自带的 `alttext` 英文读法还原，几何图形标为「[图形，见原题]」—— MathML 和 SVG 无法直接转进 Word
- AI 拆解由模型生成，**可能出错**；与官方解析冲突时以官方为准
- 模考报告的分数区间是本工具的估算规则（按官方 score band 从高到低找第一个「做够 4 题且正确率 ≥60%」的 band），**不是 College Board 的算分**。真正的自适应算分基于 IRT、换算表从未公开。第二模块 60% 的路由阈值同样是估的
- 导入试卷里的题由模型从你的文件整理而来，可能整理错；不计入官方考点统计。扫描件 / 图片 PDF 需要先 OCR，老的 .doc 要先另存为 .docx

## 浏览器要求

题库解压用 `DecompressionStream`：Chrome 80+ / Safari 16.4+ / Firefox 113+。
