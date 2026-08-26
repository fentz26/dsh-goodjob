# Agent Note: 基于实体地址、投影权威运维状态的 IDE 工作区

Status: implemented

[English](2026-08-26-ide-operations-workspace.md) | 中文

## Problem

GoodJob 的会话标题栏弹出面板能够列出 Job、Wait、Subagent、Group 和 Team 状态，但每个详情都会挤走其他上下文，并且只能由一个展开的 Job 占用输出视图。并发自治工作需要让多个实时上下文同时可见，同时不能让 GoodJob 成为调度器、对话记录存储、任务权威或事件总线。

## Decision

GoodJob 占用 DSH 原生 `conversation.view` 槽位，并提供只在稳定标签地址中保存权威标识符的内部工作区。`general`、`agent:<sessionId>`、`job:<sessionId>:<jobId>`、`group:<groupId>`、`wait:<waitId>` 和 `task:<taskId>` 在每次渲染时从 DSH 镜像、Session 投影或可选适配器解析当前值。

客户端只按根 Session 标识符持久化已打开地址、窗格位置、活动标签和 Explorer 折叠状态。它从不持久化状态、输出、Wait 结算、任务字段、邮箱消息或执行状态。普通打开操作聚焦已有地址，而“在侧边打开”可在另一窗格挂载相同地址。每个已挂载 Job 编辑器拥有独立的 `jobs.observe` 游标和有界浏览器缓冲区，因此对比视图保持非消费语义，也不能推进面向模型的游标。

General 是目标计数、带时间戳事件、注意项和显式关系的只读组合。图边必须来自 Session 谱系、Job 所有权或声明的相关标识符、Group 成员关系、Team 任务所有权或 Wait 叶标识符。缺少时间戳或关系时直接省略，不生成合成活动项或推断边。

DSH 对话渲染仍由 Session 所有。Agent 编辑器通过现有 Session 服务导航，不嵌入对话组件，也不复制消息。Subagent 提示使用现有 FIFO 投递 API，中断保持独立，Team 控件保留 quiet/wake 投递以及带修订检查的任务重新分配。

## Alternatives considered

**为每个实体使用浏览器标签页或窗口。** 这种方式会把布局、焦点、观察游标和刷新状态拆散到多个浏览上下文中，也无法提供统一的 General 或关系图投影。

**建立 GoodJob 执行和对话记录存储。** 这会复制权威的 Session、Jobs、Wait 和 Team 状态，引入对账故障，并使 UI 刷新可能恢复过期执行值。

**使用一个全局 Job 观察游标。** 这会耦合无关窗格，并可能把人工日志检查变成消费操作。每个编辑器独立游标可保持 `jobs.observe` 约定。

**建立通用命令和编辑器组框架。** DSH 尚未公开全局快捷键冲突仲裁，而过滤、稳定标签和最多四个简单窗格已经满足运维需求。

## Consequences

该工作区支持并发检查 Agent、Job、Group、Wait 和 Team 任务，恢复内容仅限客户端布局，观察不会触发推理。隐藏编辑器在挂载期间保留本地控件状态，但隐藏 Job 视图在重新聚焦前停止跟随输出。简单网格不提供嵌套编辑器组、固定标签、拖放或最近打开历史。在 Agent Teams 提供稳定线程标识符前，邮箱内容保留在 Agent 标签中；实时递归后代和 Team 适配器详情采用显式刷新，而不是连续轮询。
