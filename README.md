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

- **考点卡片** — 29 个官方考点每个一张卡：一句话说清考什么、规则型还是理解型、一道样题、你自己的正确率/均时/失分集中在哪个分数段，卡上直接配难度和题量开练
- **按考点出题** — 4 个 section domain、29 个官方考点、难度 E/M/H、官方 score band 1–7 任意组合
- **答案提交前不可见** — 官方题库网页版一打开答案就在旁边，这里不是
- **多账户** — 本机注册登录，每个账户的进度、错题、标记、API key、水平完全独立
- **错题集** — 自动收录，Leitner 间隔重复（1 / 3 / 7 / 16 天）。左右双栏：左边列表、右边直接预览题目和官方解析，可全屏翻阅；点「批量」才出勾选框，选完可预览、做题或导出 Word
- **标记** — 答题时标记的题单独成类，每道题可一键找同考点的题继续练
- **只看不做** — 任何一组题都能摊开只读：题目、答案、官方解析一次看全
- **中途放弃** — 练到一半可以放弃且不留记录；即时判分模式下已写入的作答和错题集条目会真正回滚（划的重点、标记、生词本保留）
- **划词高亮** — 文章和选项都能划重点，按题保存，重开这道题还在；点高亮处取消
- **生词本** — 做题时划选不认识的词或短语存下来，连同它出现的那句原话；点「看原题」回到完整语境
- **可拖拽分栏** — 答题和全屏预览时左右两栏宽度可拖，双击复位，比例记住
- **答案时机可选** — 默认整组做完才统一判分（中途能自由改答案，和真考一样）；也可切成交一题出一题，此时看解析的时间不计入答题用时
- **AI 强化练习** — 薄弱点分析可以一键变成题组放到首页，指定考点、难度和 Hard 题下限
- **AI 分析侧栏** — 错题本三栏（目录 / 题目 / AI），答题判分后也能开。按考点套用专属分析框架，自动带上你在该考点的历史错题；可配多个模型供应商，前一个失败自动换下一个
- **AI 拆解** — 讲这道题考什么能力、干扰项怎么设计的、你缺哪一块。可以写长期偏好，也可以逐条反馈，反馈会拼进后续请求
- **Bluebook 风格答题** — 双栏、计时、标记、右键划掉选项、暂停、字号调节
- **模考模式** — 按官方规格：R&W 两模块各 27 题 / 32 分钟，Math 两模块各 22 题 / 35 分钟，中间休息 10 分钟，第二模块按第一模块表现自适应路由。全部交卷后一次性出报告
- **学习时长** — 每场净答题时长（不含暂停），今天 / 本周 / 累计 / 练习天数；答题时同时显示本题用时和本组总用时
- **导入试卷** — 上传 PDF 或 .docx，DeepSeek 整理成可作答的试卷，按 SAT 标准配速计时
- **Word 导出** — 练习记录、模考报告或错题本导出为 .docx，含表格和图形（原题 SVG 会转成 PNG 嵌进文档），标记过的题带【已标记】前缀

## 用法

打开网站即可刷题。**AI 拆解需要自己的 DeepSeek API key**：

1. 到 [platform.deepseek.com](https://platform.deepseek.com/) 创建一个 API key
2. 网站里进「设置」，填进去，点「测试连接」
3. key 只存在你自己浏览器的 localStorage 里 — 不在本仓库代码中，不经过任何中间服务器

不填 key 也能用：刷题、官方解析、错题集、Word 导出都不受影响。

### 账户

新账户默认**不计时**、**不预设水平**。水平只有两个来源：做一次完整模考由它评出来，或在设置里自己指定；没有水平时出题器不会替你限制分数段。

没有服务器，所以账户是**本机档案**：密码经 SHA-256 加盐存在 localStorage，只用来在同一台设备上隔开不同人的记录，**不是真正的加密保护**。别用你在别处用过的密码。

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
- 考点数按题库的 `skill_desc` 标签算是 29 个（R&W 10 + Math 19）。官方规格文档写 R&W 有 14 个 testing point，是因为把 Command of Evidence 拆成 Textual / Quantitative 两条，题库标签没拆
- `score_band_range_cd` 是题目属性（这道题主要区分哪个分数段的考生），**不是你的预测分**。要分数只能做 Bluebook 完整自适应模考
- 日常刷题模式**不自适应**（定向练考点，用途不同）；模考模式会按第一模块表现路由第二模块，但路由阈值是估的
- 刷题模式的计时器按 R&W 每题 ≈71 秒、Math ≈95 秒的平均配速提示，真考不按单题计时
- 几何图形是内嵌 SVG、线条为黑色，因此一律放在白底板上，深色主题下也是白底
- Word 导出里数学公式用 College Board 自带的 `alttext` 英文读法还原（MathML 无法转进 Word）；几何图形会用 canvas 转成 PNG 嵌进文档，转换失败的标为「[图形转换失败，见原题]」
- AI 拆解由模型生成，**可能出错**；与官方解析冲突时以官方为准
- 模考报告的分数区间是本工具的估算规则（按官方 score band 从高到低找第一个「做够 4 题且正确率 ≥60%」的 band），**不是 College Board 的算分**。真正的自适应算分基于 IRT、换算表从未公开。第二模块 60% 的路由阈值同样是估的
- 导入试卷里的题由模型从你的文件整理而来，可能整理错；不计入官方考点统计。扫描件 / 图片 PDF 需要先 OCR，老的 .doc 要先另存为 .docx

## AI 分析的准确性是怎么保证的

模型只能看到我喂给它的文本，所以「题目提取对不对」是这件事的地基。`tools/audit-serializer.cjs` 把全部 3,311 道题跑一遍，检查转成纯文本后有没有失真：

```bash
node tools/audit-serializer.cjs
```

已经修掉的真实失真（都有题目为证）：

| 问题 | 影响 | 处理 |
|---|---|---|
| 311 个 SVG 中 308 个带官方 `aria-label` 图描述，被整块删掉 | 13.3% 的题丢图信息 | 提取描述写进文本 |
| 71 个表格全部包在 `<figure>` 内，随 figure 一起被删 | 数据题读不到表 | 先抽表格，figure 改为拆包装而非删除 |
| 2 道题的选项是嵌套四层 figure 包的表格 | 选项全空 | 同上 |
| 76 个 `<math>` 无 `alttext` | 公式变占位符 | 线性化 MathML |
| `<span class="sr-only">blank</span>` | 模型读到一个叫 blank 的单词 | 转成「〔空格〕」 |

剩下 3 道题的图 College Board 本身没给描述——这种情况系统提示里会明确告诉模型「你看不到这张图，涉及它的判断必须说明」，而不是让它猜。

其它约束：系统指令禁止使用原文之外的信息、禁止与官方解析冲突、禁止讲应试套路；每个考点有专属分析框架（比如 Rhetorical Synthesis 要求先分类写作任务再给选项标功能），不是通用提示词。

`tools/test-ai.cjs` 用假供应商验证整条链路（上下文组装、框架选择、错题检索、流式解析、故障转移、持久化）。**真实模型的回答质量无法在本地验证**，需要你配好 key 实际用。

## 测试

改完代码、推送之前跑一次无头冒烟测试：

```bash
npm install jsdom
node tools/smoke.cjs
```

它用 jsdom 把整个应用真跑一遍（解压题库、注册登录、出题答题、各视图渲染、数据回滚），退出码 0 表示全过。没有浏览器时这是唯一能证明「改完还能跑」的手段。

**它测不到的部分**（需要真浏览器）：视觉布局、拖拽手柄的鼠标交互、Word 导出里 SVG 转 PNG（jsdom 没有 canvas）、PDF 导入、DeepSeek 实际调用。

## 出问题了怎么回退

每个验证通过的版本都打了 tag。线上出问题时，一条命令回到上一个好版本：

```bash
git reset --hard stable-v1     # 换成要回退到的 tag
git push --force origin main
```

GitHub Pages 会在一分钟内重新构建成那个版本。查看所有可回退的版本：

```bash
git tag -l -n1
```

回退不会动你的练习记录 —— 记录存在浏览器 localStorage 里，和网站代码是两回事。

## 浏览器要求

题库解压用 `DecompressionStream`：Chrome 80+ / Safari 16.4+ / Firefox 113+。
