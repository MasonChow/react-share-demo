import { useEffect } from 'react';

export default function usePerformance(namespace = 'render') {
  const start = [namespace, 'start'].join('_');
  const end = [namespace, 'end'].join('_');

  useEffect(() => {
    window.performance.mark(start);
    return function mark() {
      window.performance.mark(end);
      window.performance.measure(namespace, start, end);
      const entries = window.performance.getEntriesByName(namespace);
      console.log(
        `[${namespace}] 两次render间隔耗时 ${
          entries[entries.length - 1].duration
        }ms`
      );
    };
  });
}
