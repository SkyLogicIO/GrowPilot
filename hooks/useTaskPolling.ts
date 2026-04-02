import { useCallback, useEffect, useRef, useState } from "react";
import { getTask } from "@/lib/api/ai-tools";
import { ApiError } from "@/lib/api/client";
import type { TaskInfo, TaskStatus } from "@/lib/api/types";

/** 终态：无需继续轮询 */
const TERMINAL_STATUSES: TaskStatus[] = ["completed", "failed", "cancelled"];

export interface UseTaskPollingOptions {
  /** 轮询间隔（ms），默认 4000 */
  interval?: number;
  /** 最大轮询次数，默认 150（≈10 分钟） */
  maxAttempts?: number;
  /** 终态时自动 resolve（用于后续代码链式调用） */
  waitForCompletion?: boolean;
}

export interface UseTaskPollingResult {
  task: TaskInfo | null;
  isLoading: boolean;
  error: string | null;
  /** 启动轮询 */
  start: (taskId: string) => void;
  /** 停止轮询 */
  stop: () => void;
  /** 重置到初始状态 */
  reset: () => void;
}

export function useTaskPolling(
  options: UseTaskPollingOptions = {},
): UseTaskPollingResult {
  const {
    interval = 4000,
    maxAttempts = 150,
    waitForCompletion = false,
  } = options;

  const [task, setTask] = useState<TaskInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taskIdRef = useRef<string | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  // 终态 resolve 队列
  const resolveQueueRef = useRef<((t: TaskInfo) => void)[]>([]);
  const rejectQueueRef = useRef<((e: Error) => void)[]>([]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
    setIsLoading(false);
  }, [clearTimer]);

  // 用 ref 持有最新的 poll，避免 setTimeout 闭包捕获过期引用
  const pollRef = useRef<(() => Promise<void>) | null>(null);

  const poll = useCallback(async () => {
    const id = taskIdRef.current;
    if (!id || stoppedRef.current) return;

    if (attemptsRef.current >= maxAttempts) {
      const msg = `任务轮询超时（${maxAttempts} 次）`;
      setError(msg);
      setIsLoading(false);
      rejectQueueRef.current.forEach((fn) => fn(new Error(msg)));
      rejectQueueRef.current = [];
      return;
    }

    attemptsRef.current++;

    try {
      const t = await getTask(id);
      setTask(t);
      setError(null);

      if (TERMINAL_STATUSES.includes(t.status)) {
        setIsLoading(false);

        if (t.status === "failed") {
          setError(t.error || "任务执行失败");
          rejectQueueRef.current.forEach((fn) => fn(new Error(t.error || "任务执行失败")));
          rejectQueueRef.current = [];
        } else {
          resolveQueueRef.current.forEach((fn) => fn(t));
          resolveQueueRef.current = [];
        }
        return;
      }

      // 继续轮询 — 通过 ref 调用，始终拿到最新函数
      timerRef.current = setTimeout(() => pollRef.current?.(), interval);
    } catch (err) {
      if (stoppedRef.current) return;

      const msg =
        err instanceof ApiError ? err.message : "查询任务状态失败";
      // 401：已由 client.ts dispatch unauthorized，中断轮询
      // 网络错误（code === -1）：临时故障，不中断，继续轮询
      if (err instanceof ApiError && err.code === 401) {
        clearTimer();
        setIsLoading(false);
        rejectQueueRef.current.forEach((fn) => fn(err));
        rejectQueueRef.current = [];
      } else {
        // 网络抖动或其他临时错误：记录但继续轮询
        setError(msg);
        timerRef.current = setTimeout(() => pollRef.current?.(), interval);
      }
    }
  }, [interval, maxAttempts, clearTimer]);

  // 保持 pollRef 始终指向最新 poll
  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  const start = useCallback(
    (taskId: string) => {
      // 清理上次
      stop();
      clearTimer();

      taskIdRef.current = taskId;
      attemptsRef.current = 0;
      stoppedRef.current = false;
      setIsLoading(true);
      setError(null);
      setTask({ task_id: taskId, status: "pending", progress: 0, created_at: new Date().toISOString() });

      // 立即查询一次
      poll();
    },
    [stop, clearTimer, poll],
  );

  const reset = useCallback(() => {
    stop();
    clearTimer();
    taskIdRef.current = null;
    attemptsRef.current = 0;
    setTask(null);
    setError(null);
    setIsLoading(false);
    resolveQueueRef.current = [];
    rejectQueueRef.current = [];
  }, [stop, clearTimer]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // waitForCompletion 支持：返回 Promise
  const waitForCompletionRef = useRef<((taskId: string) => Promise<TaskInfo>) | null>(null);
  waitForCompletionRef.current = waitForCompletion
    ? (taskId: string) =>
        new Promise<TaskInfo>((resolve, reject) => {
          resolveQueueRef.current.push(resolve);
          rejectQueueRef.current.push(reject);
          // 如果 start 还没调用或者已经终态，需要处理
          start(taskId);
        })
    : null;

  const result: UseTaskPollingResult = {
    task,
    isLoading,
    error,
    start,
    stop,
    reset,
  };

  // 挂载 waitForCompletion（仅当选项开启时）
  if (waitForCompletion) {
    (result as any).waitForCompletion = (taskId: string) =>
      waitForCompletionRef.current?.(taskId) ??
      Promise.reject(new Error("waitForCompletion not enabled"));
  }

  return result;
}
