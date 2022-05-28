import { useEffect } from 'react';
import { snake } from './index';

function createStyle(items: string[]) {
  const text = items
    .map((id) => {
      return `
        #id_${id} {
          background: #000;
        }
      `;
    })
    .join('');
  return text;
}

function useUpdatStyle(sdk: typeof snake) {
  useEffect(() => {
    const styleId = 'snake-active';
    const head = document.head;
    const style = document.createElement('style');
    style.setAttribute('id', 'snake-active');
    style.setAttribute('type', 'text/css');
    style.innerHTML = createStyle([...snake.body, snake.feed]);
    head.appendChild(style);

    const event = snake.on((type, data) => {
      const { body, feed } = data;

      if (['move', 'new_feed'].includes(type)) {
        const style = document.getElementById(styleId);
        if (style) {
          style.innerHTML = createStyle([...body, feed]);
        }
      }
    });

    return () => {
      event.off();
    };
  }, [sdk]);
}

const Block = ({ id }: { id: string }) => {
  return <div className="block" id={`id_${id}`} data-id={id}></div>;
};

function Demo() {
  useUpdatStyle(snake);

  return (
    <div style={snake.backgroundStyle}>
      {snake.blocks.map((block) => (
        <Block key={block.id} id={block.id} />
      ))}
    </div>
  );
}

export default Demo;
