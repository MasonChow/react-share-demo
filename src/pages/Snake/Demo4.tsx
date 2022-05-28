import { useState, useEffect, useRef } from 'react';
import { snake } from './index';

type SubscribeChangeFn = (active: boolean) => void;

const Block = ({
  id,
  subscribeChange,
}: {
  id: string;
  subscribeChange: (id: string, fn: SubscribeChangeFn) => void;
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // 订阅变更
    if (subscribeChange && id) {
      subscribeChange(id, (active) => {
        setIsActive(active);
      });
    }
  }, [id, subscribeChange]);

  return (
    <div
      className={['block', isActive && 'active'].filter(Boolean).join(' ')}
    />
  );
};

function Demo() {
  const ref = useRef<{
    snakeBody: string[];
    feed: string;
    subscribeBlocks: Map<string, SubscribeChangeFn>;
  }>({
    snakeBody: snake.body,
    feed: snake.feed,
    subscribeBlocks: new Map(),
  });

  const subscribeChange = (id: string, fn: SubscribeChangeFn) => {
    ref.current.subscribeBlocks.set(id, fn);
  };

  useEffect(() => {
    const initRef = { ...ref.current };
    const { subscribeBlocks, snakeBody, feed } = initRef;

    // 针对id发布订阅
    function publichChange(id: string, isActive: boolean) {
      subscribeBlocks.get(id)?.(isActive);
    }

    // 初始显示身体和食物
    [...snakeBody, feed].forEach((e) => {
      publichChange(e, true);
    });

    const event = snake.on((type, data) => {
      const { snakeBody } = ref.current;
      const { body, feed } = data;

      if (type === 'move') {
        const next = body[0];
        const last = snakeBody[snakeBody.length - 1];
        // 显示头部
        publichChange(next, true);
        // 消时尾部
        publichChange(last, false);
        ref.current.snakeBody = body;
      }

      if (type === 'new_feed') {
        publichChange(feed, true);
      }
    });

    return () => {
      event.off();
      ref.current = initRef;
    };
  }, []);

  return (
    <div style={snake.backgroundStyle}>
      {snake.blocks.map((block) => (
        <Block key={block.id} id={block.id} subscribeChange={subscribeChange} />
      ))}
    </div>
  );
}

export default Demo;
