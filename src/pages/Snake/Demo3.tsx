import React, { useEffect, useMemo, useState, useContext } from 'react';
import { snake } from './index';

export const SnakeContext = React.createContext<{
  body: string[];
  feed: string;
}>({ body: [], feed: '' });

function Block({ id }: { id: string }) {
  const context = useContext(SnakeContext);
  const isActive = context.body.includes(id) || context.feed === id;

  return useMemo(() => {
    return <div className={['block', isActive && 'active'].join(' ')} />;
  }, [isActive]);
}

function Demo() {
  const [snakeBody, setSnakeBody] = useState<string[]>(snake.body);
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

  const background = useMemo(() => {
    return (
      <div style={snake.backgroundStyle}>
        {snake.blocks.map((block) => (
          <Block key={block.id} id={block.id} />
        ))}
      </div>
    );
  }, []);

  return (
    <SnakeContext.Provider value={{ body: snakeBody, feed }}>
      {background}
    </SnakeContext.Provider>
  );
}

export default Demo;
