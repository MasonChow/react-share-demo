const cache = {
  last: 0,
  timer: 0,
};

function loop(slow = false) {
  cache.timer = window.setInterval(() => {
    const next = cache.last + 1;

    window.performance.mark(String(next));

    if (cache.last) {
      window.performance.measure('mark', String(cache.last), String(next));
      const entries = window.performance.getEntriesByName('mark');
      const duration = entries.pop()?.duration;
      console.log(`两次interval间隔耗时 ${duration}ms`);
    }
    cache.last = next;

    if (slow) {
      console.time('耗时js执行');
      new Array(40000000)
        .fill(1)
        .map((e, idx) => e + idx)
        .map((e) => e * 2);
      console.timeEnd('耗时js执行');
    }
  }, 1000);
}
function TimeOut() {
  return (
    <>
      <p>具体看控制台打印</p>
      <button
        onClick={() => {
          clearInterval(cache.timer);
          loop();
        }}
      >
        无耗时js执行
      </button>
      <span> </span>
      <button
        onClick={() => {
          clearInterval(cache.timer);
          loop(true);
        }}
      >
        长耗时js执行
      </button>
    </>
  );
}

export default TimeOut;
