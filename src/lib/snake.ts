import random from 'lodash/random';
import isEqual from 'lodash/isEqual';

// 移动方向
export enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

export enum GameStatus {
  Init,
  Playing,
  Pause,
  Stop,
}

// 方块点(X_Y,例如0_0,0_1,1_1)
export type Point = string;

// 身体
export type Body = Point[];

// 食物
export type Feed = Point;

// 背景块列表
export type Blocks = Array<{ id: Point }>;

// 初始化配置
export type initOptions = {
  // 画布宽度
  width: number;
  // 画布高度
  height: number;
  // 每格的大小(单位-px)
  size: number;
  // 移动速度(单位毫秒)
  speed: number;
};

// 订阅事件id
export type EventId = ReturnType<typeof buildId>;

// 主动事件类型 move 移动 new_feed 新食物 game_over 游戏结束
export type HandleEventTypes = 'move' | 'new_feed' | 'game_over';

// 事件回调内容
export type HandleEventCallbackData = {
  // 当前的身体
  body: Body;
  // 当前的食物坐标
  feed: Feed;
  // 当前方向
  direction: Direction;
  // 设定速率
  speed: number;
  // 实时速率
  currentSpeed: number[];
};

// 回调函数类型
export type EventCallbackFn = (
  type: HandleEventTypes,
  data: HandleEventCallbackData
) => void;

// 订阅类型
export type EventSubscribes = Array<{
  id: EventId;
  fn: EventCallbackFn;
}>;

const keyDirectionMap = {
  ArrowUp: Direction.Up,
  ArrowDown: Direction.Down,
  ArrowLeft: Direction.Left,
  ArrowRight: Direction.Right,
};

const defaultOptions = {
  width: window.innerWidth,
  height: window.innerHeight,
  size: 20,
  speed: 1000,
};

export default class Snake {
  width = 0;
  height = 0;
  direction: Direction = Direction.Right;
  body: Body = [];
  eventSubscribes: EventSubscribes = [];
  initOptions: initOptions = defaultOptions;
  feed = '';
  timerId = 0;
  size = 20;
  speed = 1000;
  blocks: Blocks = [];
  lineCount = 0;
  columnCount = 0;
  backgroundStyle = {};
  status = GameStatus.Init;
  lastRecordId = '';
  maxSpeedRecordLen = 50;
  currentSpeed: number[] = [];

  // 实例化
  constructor(options?: initOptions) {
    this.init(options);
    document.addEventListener('keydown', (e) => this.onKeydown(e));
  }

  // 订阅事件
  on(fn: EventCallbackFn) {
    const id = buildId();

    this.eventSubscribes.push({ id, fn });

    return {
      off: () => {
        this.unSubscribes(id);
      },
    };
  }

  // 发布事件
  publish(type: HandleEventTypes) {
    const cbData = {
      body: this.body,
      feed: this.feed,
      direction: this.direction,
      speed: this.speed,
      currentSpeed: this.currentSpeed,
    };

    this.eventSubscribes.forEach((item) => {
      item?.fn?.(type, cbData);
    });
  }

  // 取消订阅事件
  unSubscribes(id: EventId) {
    this.eventSubscribes = this.eventSubscribes.filter((e) => e.id !== id);
  }

  // 初始化
  init(options: initOptions = this.initOptions) {
    const { width, height, size, speed } = options;

    this.setBackground(width, height, size);
    this.speed = speed;
    this.status = GameStatus.Init;
    this.createBody();
    this.createFeed();
    this.initOptions = options;
    return this;
  }

  // 开始游戏
  start() {
    if (this.status === GameStatus.Stop) {
      this.init();
      this.play();
    } else {
      this.play();
    }
  }

  play() {
    if (this.status === GameStatus.Playing) {
      return;
    }
    this.status = GameStatus.Playing;

    this.run();
  }

  // 停止游戏
  pause() {
    this.status = GameStatus.Pause;
    clearInterval(this.timerId);
  }

  stop() {
    this.pause();
    this.status = GameStatus.Stop;
  }

  // 游戏结束
  gameOver() {
    this.stop();
    this.publish('game_over');
  }

  onKeydown(e: KeyboardEvent) {
    if (Object.keys(keyDirectionMap).includes(e.key)) {
      const key = e.key as keyof typeof keyDirectionMap;
      this.changeDirection(keyDirectionMap[key]);
    }
  }

  // 改变移动方向
  changeDirection(direction: Direction) {
    if (direction === this.direction || this.status !== GameStatus.Playing) {
      return;
    }

    if (
      isEqual(
        [direction, this.direction].sort(),
        [Direction.Up, Direction.Down].sort()
      )
    ) {
      return;
    }

    if (
      isEqual(
        [direction, this.direction].sort(),
        [Direction.Left, Direction.Right].sort()
      )
    ) {
      return;
    }

    this.direction = direction;
  }

  // 开始移动
  run() {
    if (this.status !== GameStatus.Playing) {
      return;
    }

    this.timerId = window.setInterval(() => {
      this.recordSpeed();
      this.move();
    }, this.speed);
  }

  // 记录速率
  recordSpeed() {
    const recordId = buildId();
    window.performance.mark(recordId);

    if (this.lastRecordId) {
      window.performance.measure('currentSpeed', this.lastRecordId, recordId);
      const duration =
        window.performance.getEntriesByName('currentSpeed')[0]?.duration || 0;
      window.performance.clearMeasures('currentSpeed');
      if (this.currentSpeed.length >= this.maxSpeedRecordLen) {
        this.currentSpeed.shift();
      }
      this.currentSpeed.push(Math.floor(duration * 100) / 100);
    }

    this.lastRecordId = recordId;
  }

  // 移动
  move() {
    const afterBody = [...this.moveBody(this.body)];
    const newPoint = afterBody[0];

    if (this.body.includes(newPoint)) {
      this.gameOver();
      return;
    }

    if (newPoint === this.feed) {
      this.createFeed();
    } else {
      afterBody.pop();
    }

    this.body = afterBody;
    this.publish('move');
    return this;
  }

  moveBody(body: Body) {
    const afterBody = [...body];

    let [moveX, moveY] = parsePoint(body[0]).map(Number);
    switch (this.direction) {
      case Direction.Left:
        moveX -= 1;
        break;
      case Direction.Right:
        moveX += 1;
        break;
      case Direction.Up:
        moveY -= 1;
        break;
      case Direction.Down:
        moveY += 1;
        break;
      default:
        break;
    }

    if (moveX < 0) {
      moveX = this.columnCount - 1;
    } else if (moveX >= this.columnCount) {
      moveX = 0;
    }

    if (moveY < 0) {
      moveY = this.lineCount - 1;
    } else if (moveY >= this.lineCount) {
      moveY = 0;
    }

    afterBody.unshift(buildPoint(moveX, moveY));

    return afterBody;
  }

  createBody(bodyLen: number = Math.ceil(this.width / this.size / 5)) {
    let body = [this.getRandomPoint()];

    for (let index = 0; index < bodyLen; index++) {
      body = this.moveBody(body);
    }

    this.body = body;
  }

  // 生成随机点
  getRandomPoint() {
    const x = random(0, this.columnCount - 1);
    const y = random(0, this.lineCount - 1);
    let point = buildPoint(x, y);

    if (this.body.includes(point)) {
      point = this.getRandomPoint();
    }

    return point;
  }

  // 生成食物
  createFeed() {
    this.feed = this.getRandomPoint();
    this.publish('new_feed');
  }

  // 设置背景
  setBackground(width: number, height: number, size: number) {
    const { blocks, lineCount, columnCount } = createBlocks(
      width,
      height,
      size
    );
    this.width = width;
    this.height = height;
    this.size = size;
    this.blocks = blocks;
    this.lineCount = lineCount;
    this.columnCount = columnCount;
    this.backgroundStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, ${size}px)`,
      gridTemplateRows: `repeat(${lineCount}, ${size}px)`,
      width,
      height,
    };
    return this;
  }
}

// 构建唯一id
function buildId() {
  return [+new Date(), random(0, 1000)].join('_');
}

// 构建点的坐标
function buildPoint(x: number, y: number) {
  return [x, y].join('_');
}

// 解析点的坐标
function parsePoint(point: string) {
  const [x = 0, y = 0] = point.split('_');
  return [x, y];
}

// 生成背景方块列表
function createBlocks(width: number, height: number, size: number) {
  const columnCount = (width - (width % size)) / size;
  const lineCount = (height - (height % size)) / size;
  const blocks: Blocks = [];

  new Array(lineCount).fill(1).forEach((_, y) => {
    new Array(columnCount).fill(1).forEach((_, x) => {
      blocks.push({
        id: [x, y].join('_'),
      });
    });
  });

  return {
    blocks,
    lineCount,
    columnCount,
  };
}
