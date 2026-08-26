# Agent Note: 注册的 Session 视图是工作区展示透镜

Status: implemented

[English](2026-08-26-registered-session-view-lenses.md) | 中文

## 背景

GoodJob 可以在内部标签页和窗格中显示多个实时运行上下文。DSH Session 视图（包括 Trajectory）是在共享 `conversation.view` 插槽中注册的浏览器插件。它们从 Session 状态组装展示内容并拥有自身渲染行为；它们不是 Agent、Job、Wait 或任务记录。

会话外壳最初只能为当前选中的 Session 渲染已注册视图。因此，在 GoodJob 内为另一个 Agent 承载同级视图需要一个显式 Session 渲染入口；复制视图组件或其状态会产生第二套实现，并绕过正常的注册生命周期。

## 决策

GoodJob 将任意已注册 Session 视图表示为 `{ kind: 'session-view', sessionId, viewId }`，稳定键为 `view:<sessionId>:<viewId>`。这是展示状态。工作区持久化仅保存这些标识和窗格位置。

DSH 客户端渲染器提供通用的显式 Session 插槽宿主。GoodJob 请求该宿主按 `viewId` 解析现有 `conversation.view` 注册项，并在目标 Session 的常规 provider 与注入路径中渲染它。GoodJob 从共享插槽注册表发现注册项，既不注册别名，也不导入视图实现。

Trajectory 完全由 `@deepseek-ai/dsh-client-ui-trajectory` 拥有。GoodJob 不复制其快照构建器、定义、计时、搜索、折叠、虚拟行、请求头或检查状态。当权威 GoodJob 投影能够提供工具调用 `callId` 时，现有会话视图 owner props 仍是检查路径。

缺失或已卸载的注册项显示明确的不可用状态。重新注册后，保留的标签页会恢复。打开或恢复 Session 视图会观察 Session 历史，但不会选择外层外壳视图、发送提示词或请求模型推理。

## 结果

任何当前或未来的 `conversation.view` 插件都能作为 Agent 展示透镜出现，而无需增加 GoodJob 专用实体类型。当视图支持多实例时，两个窗格可以独立承载同一注册项，不同 Agent 也可以同时使用同一视图。

领域关系和图边仍仅限权威运行实体。Session 视图可以作为 Agent 操作提供，但不是图节点或执行依赖。

缺少通用宿主的旧版 DSH 客户端仍可加载 GoodJob；只有承载的 Session 视图内容不可用。任何承载的快照或执行状态都不会进入本地工作区存储。
