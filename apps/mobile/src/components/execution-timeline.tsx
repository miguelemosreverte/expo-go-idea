import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import type { ExecutionStep } from '@gaucho/shared';

interface ExecutionTimelineProps {
  steps: ExecutionStep[];
}

const STATUS_COLORS: Record<ExecutionStep['status'], string> = {
  pending: 'bg-gray-300',
  running: 'bg-[#4a90d9]',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

const STATUS_ICONS: Record<ExecutionStep['status'], string> = {
  pending: '\u25CB',
  running: '\u25CF',
  completed: '\u2713',
  failed: '\u2717',
};

function PulsingDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className="h-3 w-3 rounded-full bg-[#4a90d9]"
    />
  );
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function StepItem({ step, isLast }: { step: ExecutionStep; isLast: boolean }) {
  return (
    <View className="flex-row">
      {/* Timeline column */}
      <View className="mr-3 items-center" style={{ width: 24 }}>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${STATUS_COLORS[step.status]}`}
        >
          {step.status === 'running' ? (
            <PulsingDot />
          ) : (
            <Text className="text-xs font-bold text-white">
              {STATUS_ICONS[step.status]}
            </Text>
          )}
        </View>
        {!isLast && <View className="w-0.5 flex-1 bg-gray-200" style={{ minHeight: 16 }} />}
      </View>

      {/* Content column */}
      <View className="flex-1 pb-4">
        <Text className="text-sm font-medium text-[#1a1a2e]">
          {step.description}
        </Text>
        <View className="mt-0.5 flex-row">
          {step.startedAt && (
            <Text className="text-xs text-gray-400">
              {formatTime(step.startedAt)}
            </Text>
          )}
          {step.completedAt && (
            <Text className="ml-2 text-xs text-gray-400">
              {'-> '}{formatTime(step.completedAt)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <View className="mx-4 my-2 rounded-xl bg-gray-50 p-3">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Execution
      </Text>
      {steps.map((step, i) => (
        <StepItem key={step.id} step={step} isLast={i === steps.length - 1} />
      ))}
    </View>
  );
}
