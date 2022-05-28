import React, { useEffect, useState } from 'react';
import { snake } from './index';

const Block = React.memo(({ isActive }: { isActive: boolean }) => {
  return <div className={['block', isActive && 'active'].join(' ')} />;
});

function Demo() {
  // 蛇身
  const [snakeBody, setSnakeBody] = useState<string[]>(snake.body);
  // 食物
  const [feed, setFeed] = useState(snake.feed);

  useEffect(() => {
    const event = snake.on((type, data) => {
      if (type === 'move') {
        setSnakeBody(data.body);
      }
      if (type === 'new_feed') {
        setFeed(data.feed);
      }
    });

    return () => {
      event.off();
    };
  }, []);

  return (
    <div style={snake.backgroundStyle}>
      {snake.blocks.map((block) => (
        <Block
          isActive={snakeBody.includes(block.id) || feed === block.id}
          key={block.id}
        />
      ))}
    </div>
  );
}

export default Demo;
