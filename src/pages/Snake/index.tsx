import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import mean from 'lodash/mean';
import Demo1 from './Demo1';
import Demo2 from './Demo2';
import Demo3 from './Demo3';
import Demo4 from './Demo4';
import Demo5 from './Demo5';
import Snake from '../../lib/snake';
import './style.css';

const search = new URLSearchParams(window.location.search);

export const snake = new Snake({
  width: 1200,
  height: 600,
  size: Number(search.get('size') || 10),
  speed: Number(search.get('speed') || 30),
});

function Monitor() {
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

  useEffect(() => {
    snake.on((type, data) => {
      if (type === 'move') {
        setCurrentSpeed(Math.round(mean(data.currentSpeed)) || 0);
      }
    });
  });

  return (
    <div className="layout">
      <div className="info">
        <p>
          区域宽高: {snake.width}/{snake.height}
        </p>
        <p>格子尺寸: {snake.size}</p>
        <p>格子总数: {snake.blocks.length}</p>
        <p>设定速率: {snake.speed}ms/次</p>
        <p>平均速率: {currentSpeed}ms/次</p>
        <button
          onClick={() => {
            snake.start();
          }}
        >
          开始
        </button>
        <button
          onClick={() => {
            snake.pause();
          }}
        >
          暂停
        </button>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <>
      <Monitor />
      <Routes>
        <Route path="demo1" element={<Demo1 />} />
        <Route path="demo2" element={<Demo2 />} />
        <Route path="demo3" element={<Demo3 />} />
        <Route path="demo4" element={<Demo4 />} />
        <Route path="demo5" element={<Demo5 />} />
      </Routes>
    </>
  );
}
